-- 1. Enable the pgvector extension to support high-dimensional embeddings
CREATE EXTENSION IF NOT EXISTS vector;

-- 2. Create the isolated documents table
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    content TEXT NOT NULL,
    embedding vector(1536), -- Standard OpenAI/Gemini embedding vector dimension
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS for strict multi-tenant isolation
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members select scoped documents" 
    ON public.documents FOR SELECT 
    USING (tenant_id = auth.tenant_id());

CREATE POLICY "Allow members insert scoped documents" 
    ON public.documents FOR INSERT 
    WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY "Allow members delete scoped documents" 
    ON public.documents FOR DELETE 
    USING (tenant_id = auth.tenant_id());

-- 4. Create RAG semantic similarity search query function
CREATE OR REPLACE FUNCTION match_documents (
  query_embedding vector(1536),
  match_threshold FLOAT,
  match_count INT,
  filter_tenant_id UUID
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  content TEXT,
  similarity FLOAT
)
LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  RETURN QUERY
  SELECT
    d.id,
    d.name,
    d.content,
    1 - (d.embedding <=> query_embedding) AS similarity -- Cosine similarity calculation
  FROM public.documents d
  WHERE d.tenant_id = filter_tenant_id
    AND 1 - (d.embedding <=> query_embedding) > match_threshold
  ORDER BY d.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
