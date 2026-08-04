-- Global brand catalogue (Business Truth entity), replicating the proven
-- catalogue pattern already used for trade_templates: Super Admin curates
-- the global list, tenants select from it via a junction table. No tenant
-- ever free-types a brand name into a text field again.

create table public.brands (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  logo_url text,
  website_url text,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create unique index brands_name_lower_unique on public.brands (lower(name));

create trigger trg_brands_updated_at
  before update on public.brands
  for each row execute function public.update_updated_at();

create table public.tenant_brands (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (tenant_id, brand_id)
);

alter table public.brands enable row level security;
alter table public.tenant_brands enable row level security;

-- brands: public read of active brands (needed to render a tenant's selected
-- brands on the public site), full CRUD reserved to the super admin.
create policy public_read_brands
  on public.brands for select
  to anon, authenticated
  using (is_active = true);

create policy super_admin_manage_brands
  on public.brands for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());

-- tenant_brands: public read (selection is shown on the public site),
-- tenant admins manage their own selection, super admin manages any.
create policy public_read_tenant_brands
  on public.tenant_brands for select
  to anon, authenticated
  using (true);

create policy tenant_admin_manage_own_brands
  on public.tenant_brands for all
  to authenticated
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

create policy super_admin_all_tenant_brands
  on public.tenant_brands for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());
