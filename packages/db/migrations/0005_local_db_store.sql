-- 1. Create the local_db_store table for JSON Key-Value storage
CREATE TABLE IF NOT EXISTS public.local_db_store (
    key TEXT PRIMARY KEY,
    data JSONB NOT NULL DEFAULT '{}'::jsonb,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.local_db_store ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
-- For now, allow all operations since it acts as a global KV store for the backend.
-- The API routes enforce tenant isolation at the application level.
CREATE POLICY "Allow full access to local_db_store" 
    ON public.local_db_store FOR ALL 
    USING (true)
    WITH CHECK (true);
