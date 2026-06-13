-- 1. Create the skill runs tracking table
CREATE TABLE IF NOT EXISTS public.skill_runs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    skill_name TEXT NOT NULL, -- e.g., 'lead_capture', 'human_handoff', 'n8n_bridge'
    status TEXT NOT NULL CHECK (status IN ('success', 'failed', 'running')),
    latency_ms INT NOT NULL,
    payload JSONB,
    response JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the custom leads ledger table
CREATE TABLE IF NOT EXISTS public.leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on both tables for strict multi-tenant isolation
ALTER TABLE public.skill_runs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members view scoped skill_runs" 
    ON public.skill_runs FOR SELECT 
    USING (tenant_id = auth.tenant_id());

CREATE POLICY "Allow members insert scoped skill_runs" 
    ON public.skill_runs FOR INSERT 
    WITH CHECK (tenant_id = auth.tenant_id());

CREATE POLICY "Allow members view scoped leads" 
    ON public.leads FOR SELECT 
    USING (tenant_id = auth.tenant_id());

CREATE POLICY "Allow members insert scoped leads" 
    ON public.leads FOR INSERT 
    WITH CHECK (tenant_id = auth.tenant_id());
