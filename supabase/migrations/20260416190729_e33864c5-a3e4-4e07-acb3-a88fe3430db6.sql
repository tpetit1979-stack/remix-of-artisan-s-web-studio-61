
-- Bug 1 & 2 : contraintes UNIQUE
ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_unique UNIQUE (user_id);

ALTER TABLE public.tenant_members
  ADD CONSTRAINT tenant_members_user_tenant_unique UNIQUE (user_id, tenant_id);

-- Bug 6 : FK avec ON DELETE CASCADE vers auth.users
-- (On drop d'abord les FK existantes si elles n'ont pas le CASCADE, puis on recrée)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'user_roles'
      AND constraint_name = 'user_roles_user_id_fkey'
  ) THEN
    ALTER TABLE public.user_roles DROP CONSTRAINT user_roles_user_id_fkey;
  END IF;
END $$;

ALTER TABLE public.user_roles
  ADD CONSTRAINT user_roles_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema = 'public' AND table_name = 'tenant_members'
      AND constraint_name = 'tenant_members_user_id_fkey'
  ) THEN
    ALTER TABLE public.tenant_members DROP CONSTRAINT tenant_members_user_id_fkey;
  END IF;
END $$;

ALTER TABLE public.tenant_members
  ADD CONSTRAINT tenant_members_user_id_fkey
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE;

-- Bug 7 : index pour les fonctions RLS
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_user_id ON public.tenant_members(user_id);
CREATE INDEX IF NOT EXISTS idx_tenant_members_tenant_id ON public.tenant_members(tenant_id);

-- Bug 5 : granularité des rôles dans tenant_members
ALTER TABLE public.tenant_members
  ADD COLUMN IF NOT EXISTS role text NOT NULL DEFAULT 'owner'
  CHECK (role IN ('owner', 'editor', 'viewer'));

-- Bug 8 : trigger anti cross-tenant sur contacts.service_id
CREATE OR REPLACE FUNCTION public.check_contact_service_tenant()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.service_id IS NOT NULL THEN
    IF NOT EXISTS (
      SELECT 1 FROM public.services
      WHERE id = NEW.service_id AND tenant_id = NEW.tenant_id
    ) THEN
      RAISE EXCEPTION 'service_id does not belong to this tenant';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_contact_service_tenant ON public.contacts;
CREATE TRIGGER trg_contact_service_tenant
  BEFORE INSERT OR UPDATE ON public.contacts
  FOR EACH ROW EXECUTE FUNCTION public.check_contact_service_tenant();
