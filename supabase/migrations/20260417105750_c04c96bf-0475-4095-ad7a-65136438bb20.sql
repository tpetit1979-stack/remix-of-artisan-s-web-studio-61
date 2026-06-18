-- Allow deletion of primary trade activation when the tenant itself is being deleted
-- or when no activations remain for the tenant after the operation.
CREATE OR REPLACE FUNCTION public.prevent_primary_trade_delete()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
DECLARE
  _tenant_still_exists boolean;
  _other_primary_exists boolean;
BEGIN
  IF OLD.is_primary = true THEN
    -- If the parent tenant no longer exists (cascade delete), allow
    SELECT EXISTS (
      SELECT 1 FROM public.tenants WHERE id = OLD.tenant_id
    ) INTO _tenant_still_exists;

    IF NOT _tenant_still_exists THEN
      RETURN OLD;
    END IF;

    SELECT EXISTS (
      SELECT 1
      FROM public.tenant_trade_activations tta
      WHERE tta.tenant_id = OLD.tenant_id
        AND tta.id <> OLD.id
        AND tta.is_primary = true
    ) INTO _other_primary_exists;

    IF NOT _other_primary_exists THEN
      RAISE EXCEPTION 'Cannot delete the only primary trade activation for this tenant';
    END IF;
  END IF;

  RETURN OLD;
END;
$function$;