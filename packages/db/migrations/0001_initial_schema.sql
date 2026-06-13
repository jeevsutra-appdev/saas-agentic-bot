-- Initial Database Migration: Multi-Tenancy Base
-- Target: Supabase Postgres

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Core Tenant Tables
CREATE TABLE IF NOT EXISTS public.tenants (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    slug TEXT NOT NULL UNIQUE,
    plan_id TEXT NOT NULL DEFAULT 'free',
    credits_balance INTEGER NOT NULL DEFAULT 2000,
    status TEXT NOT NULL DEFAULT 'active',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. User Profiles (Synced from auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    full_name TEXT,
    avatar_url TEXT,
    role TEXT NOT NULL DEFAULT 'user',
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Monorepo Memberships
CREATE TABLE IF NOT EXISTS public.memberships (
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    tenant_id UUID REFERENCES public.tenants(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'admin', 'editor', 'viewer')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    PRIMARY KEY (user_id, tenant_id)
);

-- 5. Super Admins
CREATE TABLE IF NOT EXISTS public.super_admins (
    user_id UUID PRIMARY KEY REFERENCES public.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Heartbeat Table (Free tier keepalive survival)
CREATE TABLE IF NOT EXISTS public.heartbeat (
    id SERIAL PRIMARY KEY,
    beat_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Sync Trigger: auth.users to public.users mapping
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.users (id, email, full_name, avatar_url, role)
  VALUES (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    coalesce(new.raw_user_meta_data->>'avatar_url', ''),
    'user'
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Custom JWT Helper function for Row-Level Security
CREATE OR REPLACE FUNCTION auth.tenant_id()
RETURNS uuid
LANGUAGE sql STABLE SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (current_setting('request.jwt.claims', true)::jsonb ->> 'tenant_id')::uuid,
    '00000000-0000-0000-0000-000000000000'::uuid
  );
$$;

-- 9. Row-Level Security Enablement
ALTER TABLE public.tenants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.super_admins ENABLE ROW LEVEL SECURITY;

-- 10. RLS Policies

-- tenants: Only members can read/write their tenant record. Super admins can do all.
CREATE POLICY tenant_read ON public.tenants
  FOR SELECT
  USING (
    id = auth.tenant_id() OR 
    EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid())
  );

CREATE POLICY tenant_write ON public.tenants
  FOR ALL
  USING (
    id = auth.tenant_id() OR 
    EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid())
  )
  WITH CHECK (
    id = auth.tenant_id() OR 
    EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid())
  );

-- memberships: Filter by tenant_id
CREATE POLICY membership_isolation ON public.memberships
  FOR ALL
  USING (
    tenant_id = auth.tenant_id() OR 
    EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid())
  );

-- users: Users can read/write their own profiles, or within the tenant members list.
CREATE POLICY user_read ON public.users
  FOR SELECT
  USING (
    id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.memberships m1
      WHERE m1.user_id = public.users.id AND m1.tenant_id = auth.tenant_id()
    ) OR
    EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid())
  );

CREATE POLICY user_write ON public.users
  FOR ALL
  USING (
    id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.super_admins WHERE user_id = auth.uid())
  );
