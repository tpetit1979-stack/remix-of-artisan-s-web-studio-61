-- enforce_team_presentation_mode_locked() only needs to run as a trigger --
-- trigger firing does not require EXECUTE on the function for the role
-- performing the DML (verified live: an allowed-field update by a
-- tenant_admin still succeeds after this revoke, and the blocked write is
-- still correctly refused). Exposing it as a callable RPC to anon/
-- authenticated serves no purpose and was flagged by the Supabase linter.
--
-- Several older trigger functions in this schema carry the same warning
-- (enforce_tenant_platform_fields_locked, enforce_brand_assets_locked,
-- enforce_tenant_media_brand_locked, ...). Deliberately not touched here --
-- see docs/product/execution-backlog.md for that as a separate, logged
-- security backlog item rather than folding it into this fix.

revoke all on function public.enforce_team_presentation_mode_locked() from public, anon, authenticated;
