-- ============================================
-- 1. ENUM des rôles
-- ============================================
CREATE TYPE public.app_role AS ENUM ('super_admin', 'tenant_admin');

-- ============================================
-- 2. Tables auth
-- ============================================
CREATE TABLE public.user_roles (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role        public.app_role NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

CREATE TABLE public.tenant_members (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tenant_id  uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, tenant_id)
);

CREATE INDEX idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX idx_tenant_members_user_id ON public.tenant_members(user_id);
CREATE INDEX idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);

-- ============================================
-- 3. Fonctions helper RLS (SECURITY DEFINER + search_path)
-- ============================================
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.is_super_admin()
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'super_admin'
  )
$$;

CREATE OR REPLACE FUNCTION public.is_tenant_member(_tenant_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.tenant_members
    WHERE user_id = auth.uid() AND tenant_id = _tenant_id
  )
$$;

-- ============================================
-- 4. RLS sur user_roles & tenant_members
-- ============================================
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_roles" ON public.user_roles
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "super_admin_manage_roles" ON public.user_roles
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

ALTER TABLE public.tenant_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "users_read_own_memberships" ON public.tenant_members
  FOR SELECT TO authenticated
  USING (user_id = auth.uid());

CREATE POLICY "super_admin_manage_members" ON public.tenant_members
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

-- ============================================
-- 5. Nettoyage des anciennes policies permissives
-- ============================================
DROP POLICY IF EXISTS "Auth manage tenants" ON public.tenants;
DROP POLICY IF EXISTS "Public delete tenants" ON public.tenants;
DROP POLICY IF EXISTS "Public insert tenants" ON public.tenants;
DROP POLICY IF EXISTS "Public read tenants" ON public.tenants;
DROP POLICY IF EXISTS "Public update tenants" ON public.tenants;

DROP POLICY IF EXISTS "Auth manage services" ON public.services;
DROP POLICY IF EXISTS "Public delete services" ON public.services;
DROP POLICY IF EXISTS "Public insert services" ON public.services;
DROP POLICY IF EXISTS "Public read services" ON public.services;

DROP POLICY IF EXISTS "Auth manage site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public delete site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public insert site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public read site_settings" ON public.site_settings;
DROP POLICY IF EXISTS "Public update site_settings" ON public.site_settings;

DROP POLICY IF EXISTS "Auth manage service_areas" ON public.service_areas;
DROP POLICY IF EXISTS "Public delete service_areas" ON public.service_areas;
DROP POLICY IF EXISTS "Public insert service_areas" ON public.service_areas;
DROP POLICY IF EXISTS "Public read service_areas" ON public.service_areas;

DROP POLICY IF EXISTS "Auth manage portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Public delete portfolio" ON public.portfolio;
DROP POLICY IF EXISTS "Public read portfolio" ON public.portfolio;

DROP POLICY IF EXISTS "Auth manage certifications" ON public.tenant_certifications;
DROP POLICY IF EXISTS "Public delete tenant_certifications" ON public.tenant_certifications;
DROP POLICY IF EXISTS "Public insert certifications" ON public.tenant_certifications;
DROP POLICY IF EXISTS "Public read certifications" ON public.tenant_certifications;

DROP POLICY IF EXISTS "Auth manage contacts" ON public.contacts;
DROP POLICY IF EXISTS "Public delete contacts" ON public.contacts;
DROP POLICY IF EXISTS "Public insert contacts" ON public.contacts;

DROP POLICY IF EXISTS "Auth manage analytics" ON public.analytics_monthly;
DROP POLICY IF EXISTS "Public delete analytics_monthly" ON public.analytics_monthly;
DROP POLICY IF EXISTS "Public read analytics" ON public.analytics_monthly;

DROP POLICY IF EXISTS "Auth manage trade_templates" ON public.trade_templates;
DROP POLICY IF EXISTS "Public read trade_templates" ON public.trade_templates;

DROP POLICY IF EXISTS "Auth manage trade_service_templates" ON public.trade_service_templates;
DROP POLICY IF EXISTS "Public read trade_service_templates" ON public.trade_service_templates;

-- ============================================
-- 6. TENANTS — public lit les actifs, super_admin tout, tenant_admin son tenant
-- ============================================
CREATE POLICY "public_read_active_tenants" ON public.tenants
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "super_admin_all_tenants" ON public.tenants
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "tenant_admin_update_own_tenant" ON public.tenants
  FOR UPDATE TO authenticated
  USING (public.is_tenant_member(id))
  WITH CHECK (public.is_tenant_member(id));

-- ============================================
-- 7. SITE_SETTINGS
-- ============================================
CREATE POLICY "public_read_site_settings" ON public.site_settings
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "super_admin_all_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "tenant_admin_manage_own_settings" ON public.site_settings
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- ============================================
-- 8. SERVICES
-- ============================================
CREATE POLICY "public_read_services" ON public.services
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "super_admin_all_services" ON public.services
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "tenant_admin_manage_own_services" ON public.services
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- ============================================
-- 9. SERVICE_AREAS
-- ============================================
CREATE POLICY "public_read_service_areas" ON public.service_areas
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "super_admin_all_areas" ON public.service_areas
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "tenant_admin_manage_own_areas" ON public.service_areas
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- ============================================
-- 10. PORTFOLIO
-- ============================================
CREATE POLICY "public_read_portfolio" ON public.portfolio
  FOR SELECT TO anon, authenticated
  USING (is_published = true);

CREATE POLICY "super_admin_all_portfolio" ON public.portfolio
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "tenant_admin_manage_own_portfolio" ON public.portfolio
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- ============================================
-- 11. TENANT_CERTIFICATIONS
-- ============================================
CREATE POLICY "public_read_certifications" ON public.tenant_certifications
  FOR SELECT TO anon, authenticated
  USING (is_active = true);

CREATE POLICY "super_admin_all_certs" ON public.tenant_certifications
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "tenant_admin_read_own_certs" ON public.tenant_certifications
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));

-- ============================================
-- 12. CONTACTS — INSERT public (formulaire), SELECT privé
-- ============================================
CREATE POLICY "public_insert_contacts" ON public.contacts
  FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "super_admin_all_contacts" ON public.contacts
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "tenant_admin_manage_own_contacts" ON public.contacts
  FOR ALL TO authenticated
  USING (public.is_tenant_member(tenant_id))
  WITH CHECK (public.is_tenant_member(tenant_id));

-- ============================================
-- 13. ANALYTICS_MONTHLY — privé
-- ============================================
CREATE POLICY "super_admin_all_analytics" ON public.analytics_monthly
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "tenant_admin_read_own_analytics" ON public.analytics_monthly
  FOR SELECT TO authenticated
  USING (public.is_tenant_member(tenant_id));

-- ============================================
-- 14. TRADE_TEMPLATES (catalogue public en lecture)
-- ============================================
CREATE POLICY "public_read_trade_templates" ON public.trade_templates
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "super_admin_manage_trade_templates" ON public.trade_templates
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());

CREATE POLICY "public_read_trade_service_templates" ON public.trade_service_templates
  FOR SELECT TO anon, authenticated
  USING (true);

CREATE POLICY "super_admin_manage_trade_service_templates" ON public.trade_service_templates
  FOR ALL TO authenticated
  USING (public.is_super_admin())
  WITH CHECK (public.is_super_admin());