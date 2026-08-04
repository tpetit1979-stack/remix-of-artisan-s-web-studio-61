-- Commercial Promises — Lot A
-- Schema, trigger and reconciliation RPC for tenant-confirmed commercial promises
-- (quote gratuity, response delay, emergency service) and the free-quote-claim
-- consistency check between site_settings.cta_text and quote_is_free.

ALTER TABLE public.site_settings
  ADD COLUMN IF NOT EXISTS quote_is_free boolean,
  ADD COLUMN IF NOT EXISTS quote_response_delay_hours integer,
  ADD COLUMN IF NOT EXISTS emergency_service_available boolean,
  ADD COLUMN IF NOT EXISTS free_quote_claim_reviewed_at timestamptz;

ALTER TABLE public.site_settings
  ADD CONSTRAINT site_settings_quote_response_delay_hours_check
  CHECK (quote_response_delay_hours IS NULL OR quote_response_delay_hours BETWEEN 1 AND 720);

COMMENT ON COLUMN public.site_settings.quote_is_free IS
  'Whether the tenant''s quote is genuinely free. Null = not confirmed by the tenant. Never inferred from cta_text wording.';
COMMENT ON COLUMN public.site_settings.quote_response_delay_hours IS
  'Tenant''s usual response delay in hours (1-720). Null = not confirmed.';
COMMENT ON COLUMN public.site_settings.emergency_service_available IS
  'Whether the tenant genuinely offers emergency/urgent service. Null = not confirmed.';
COMMENT ON COLUMN public.site_settings.free_quote_claim_reviewed_at IS
  'Timestamp of the last reconciliation of the free-quote claim in cta_text specifically -- not a general "all commercial promises reviewed" audit log, and it does not say who reviewed. Reset to null by trigger on every ordinary cta_text write; only reconcile_free_quote_claim() may set it to a non-null value.';

-- Simple, intentionally conservative heuristic: does this text assert/suggest a free quote?
-- False negatives are possible (it only checks for "gratuit"); it is a detection aid for the
-- reconciliation workflow, not a legal proof of what a text claims.
CREATE OR REPLACE FUNCTION public.mentions_free_quote(_text text)
RETURNS boolean
LANGUAGE sql
IMMUTABLE
AS $$
  SELECT _text IS NOT NULL AND _text ILIKE '%gratuit%'
$$;

-- Guard: any ordinary write to cta_text invalidates the previous free-quote-claim review.
-- Applies uniformly to every write path (Admin, Super Admin, onboarding, AI "regenerate", future
-- scripts) -- deliberately unconditional, no bypass flag, so a future write path can't silently
-- skip it. The only way to set free_quote_claim_reviewed_at to a real value afterwards is the
-- reconcile_free_quote_claim() function below.
CREATE OR REPLACE FUNCTION public.reset_free_quote_claim_review()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  IF NEW.cta_text IS DISTINCT FROM OLD.cta_text THEN
    NEW.free_quote_claim_reviewed_at := NULL;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS site_settings_reset_free_quote_claim_review ON public.site_settings;
CREATE TRIGGER site_settings_reset_free_quote_claim_review
  BEFORE UPDATE ON public.site_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.reset_free_quote_claim_review();

-- Reconciliation RPC: the only path allowed to close out a free-quote-claim review.
-- Runs as a single transaction so its two internal UPDATEs (cta_text, then the decision +
-- reviewed_at) are never observed in a partial state, and so the trigger above -- which fires on
-- the first UPDATE -- doesn't clobber the review timestamp set by the second.
CREATE OR REPLACE FUNCTION public.reconcile_free_quote_claim(
  p_tenant_id uuid,
  p_decision text,
  p_neutral_cta_text text DEFAULT NULL
)
RETURNS public.site_settings
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_row public.site_settings;
BEGIN
  IF p_decision NOT IN ('confirmed_free', 'confirmed_not_free', 'left_unspecified') THEN
    RAISE EXCEPTION 'invalid decision: %', p_decision;
  END IF;

  IF NOT (public.is_super_admin() OR public.is_tenant_member(p_tenant_id)) THEN
    RAISE EXCEPTION 'not authorized for tenant %', p_tenant_id;
  END IF;

  -- Lock the row for the duration of the reconciliation to serialize concurrent attempts.
  SELECT * INTO v_row FROM public.site_settings WHERE tenant_id = p_tenant_id FOR UPDATE;
  IF NOT FOUND THEN
    RAISE EXCEPTION 'no site_settings row for tenant %', p_tenant_id;
  END IF;

  IF p_decision IN ('confirmed_not_free', 'left_unspecified') THEN
    IF p_neutral_cta_text IS NULL OR public.mentions_free_quote(p_neutral_cta_text) THEN
      RAISE EXCEPTION 'a neutral, non-free-quote cta_text is required for decision %', p_decision;
    END IF;

    UPDATE public.site_settings
    SET cta_text = p_neutral_cta_text
    WHERE tenant_id = p_tenant_id;
  END IF;

  UPDATE public.site_settings
  SET
    quote_is_free = CASE p_decision
      WHEN 'confirmed_free' THEN true
      WHEN 'confirmed_not_free' THEN false
      WHEN 'left_unspecified' THEN NULL
    END,
    free_quote_claim_reviewed_at = now()
  WHERE tenant_id = p_tenant_id
  RETURNING * INTO v_row;

  IF public.mentions_free_quote(v_row.cta_text) AND v_row.quote_is_free IS DISTINCT FROM true THEN
    RAISE EXCEPTION 'invariant violated: cta_text mentions free quote but quote_is_free is not true';
  END IF;

  RETURN v_row;
END;
$$;

REVOKE ALL ON FUNCTION public.reconcile_free_quote_claim(uuid, text, text) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.reconcile_free_quote_claim(uuid, text, text) TO authenticated;
