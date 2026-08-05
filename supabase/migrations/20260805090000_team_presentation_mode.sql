-- Explicit, agency-owned presentation mode for the public team section.
-- Never deduced from the active member count -- that was the bug this
-- replaces (see docs/product/execution-backlog.md, Lot 2 révisé). Lives on
-- site_settings, not tenants: it's a presentation decision (same family as
-- hero_title, cta_text), not a legal identity fact.

alter table public.site_settings
  add column team_presentation_mode text default null;

alter table public.site_settings
  add constraint site_settings_team_presentation_mode_check
  check (team_presentation_mode is null or team_presentation_mode in ('artisan', 'company', 'hidden'));

-- Narrow lock on this single column, covering INSERT and UPDATE -- a
-- trigger scoped to UPDATE only would leave row-creation as an open path
-- for a tenant_admin to set it. Deliberately not an extension of the
-- tenants.enforce_tenant_platform_fields_locked pattern (an exclusion list
-- would be unwieldy against the dozens of tenant-writable columns already
-- on site_settings) and not a table-wide lock -- only this column.
create or replace function public.enforce_team_presentation_mode_locked()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_role text := current_setting('request.jwt.claim.role', true);
  v_old_mode text;
begin
  if v_role = 'service_role' then
    return new;
  end if;

  if public.is_super_admin() then
    return new;
  end if;

  v_old_mode := case when tg_op = 'UPDATE' then old.team_presentation_mode else null end;

  if new.team_presentation_mode is distinct from v_old_mode then
    raise exception 'team_presentation_mode_locked: only super_admin may set this field';
  end if;

  return new;
end;
$function$;

drop trigger if exists trg_site_settings_team_presentation_mode_locked on public.site_settings;
create trigger trg_site_settings_team_presentation_mode_locked
before insert or update on public.site_settings
for each row execute function public.enforce_team_presentation_mode_locked();
