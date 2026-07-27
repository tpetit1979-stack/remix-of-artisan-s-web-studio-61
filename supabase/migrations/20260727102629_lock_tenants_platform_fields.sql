DROP TRIGGER IF EXISTS trg_tenants_platform_fields_locked ON public.tenants;
DROP FUNCTION IF EXISTS public.enforce_tenant_platform_fields_locked();

CREATE OR REPLACE FUNCTION public.enforce_tenant_platform_fields_locked()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
DECLARE
  v_uid uuid := auth.uid();
  v_role text := current_setting('request.jwt.claim.role', true);
BEGIN
  IF v_role = 'service_role' THEN
    RETURN NEW;
  END IF;

  IF v_uid IS NULL THEN
    RAISE EXCEPTION 'tenant_platform_fields_locked: authentication required';
  END IF;

  IF public.is_super_admin() THEN
    RETURN NEW;
  END IF;

  IF (to_jsonb(NEW) - 'phone' - 'email' - 'updated_at')
     IS DISTINCT FROM
     (to_jsonb(OLD) - 'phone' - 'email' - 'updated_at') THEN
    RAISE EXCEPTION 'tenant_platform_fields_locked: tenant_admin may only modify phone and email';
  END IF;

  RETURN NEW;
END;
$function$;

CREATE TRIGGER trg_tenants_platform_fields_locked
BEFORE UPDATE ON public.tenants
FOR EACH ROW EXECUTE FUNCTION public.enforce_tenant_platform_fields_locked();
