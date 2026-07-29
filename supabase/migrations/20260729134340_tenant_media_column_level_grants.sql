-- S1 refinement: table-wide SELECT was only a convenience GRANT, not a real
-- boundary — verified empirically that security_invoker views require the
-- invoker to hold privileges on the underlying table, so revoking SELECT
-- entirely breaks the view too. Column-level GRANT keeps the view working
-- while actually restricting which columns anon/authenticated can read,
-- on the view AND on direct table queries. Any future sensitive column
-- (e.g. private storage path, moderation state, AI metadata) stays
-- unreadable by default, without relying on frontend discipline alone.
REVOKE SELECT ON public.tenant_media FROM anon, authenticated;
GRANT SELECT (id, tenant_id, category, target_id, public_url, alt_text, sort_order, is_active)
ON public.tenant_media TO anon, authenticated;
