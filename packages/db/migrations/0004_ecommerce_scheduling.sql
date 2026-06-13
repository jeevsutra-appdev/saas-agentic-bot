-- 1. Create the products catalog table
CREATE TABLE IF NOT EXISTS public.products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    price INT NOT NULL, -- Stored in cents/paise for PCI-DSS compliance integer math
    description TEXT,
    image_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Create the calendar appointments booking table
CREATE TABLE IF NOT EXISTS public.appointments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tenant_id UUID NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
    client_name TEXT NOT NULL,
    client_email TEXT NOT NULL,
    time_slot TEXT NOT NULL, -- Store selected ISO string or slot block
    status TEXT NOT NULL CHECK (status IN ('confirmed', 'cancelled', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Enable RLS on both tables for strict multi-tenant isolation
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow members view scoped products" 
    ON public.products FOR SELECT 
    USING (tenant_id = auth.tenant_id());

CREATE POLICY "Allow members manage scoped products" 
    ON public.products FOR ALL 
    USING (tenant_id = auth.tenant_id());

CREATE POLICY "Allow members view scoped appointments" 
    ON public.appointments FOR SELECT 
    USING (tenant_id = auth.tenant_id());

CREATE POLICY "Allow members manage scoped appointments" 
    ON public.appointments FOR ALL 
    USING (tenant_id = auth.tenant_id());
