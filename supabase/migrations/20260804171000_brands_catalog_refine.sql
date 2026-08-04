-- Refine the brand catalogue per product review: brands become a
-- trade-agnostic catalogue (not just HVAC) organised by category,
-- tenant_brands gains is_featured/notes for general "we work with" badges,
-- and a new tenant_service_brands junction scopes a brand to one specific
-- service — so "Installation climatisation" never lists a poêle brand.

alter table public.brands
  add column category text,
  add column sort_order integer not null default 0;

alter table public.tenant_brands
  add column is_featured boolean not null default false,
  add column notes text;

create table public.tenant_service_brands (
  id uuid primary key default gen_random_uuid(),
  tenant_id uuid not null references public.tenants(id) on delete cascade,
  service_id uuid not null references public.services(id) on delete cascade,
  brand_id uuid not null references public.brands(id) on delete cascade,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  unique (service_id, brand_id)
);

alter table public.tenant_service_brands enable row level security;

create policy public_read_tenant_service_brands
  on public.tenant_service_brands for select
  to anon, authenticated
  using (true);

create policy tenant_admin_manage_own_service_brands
  on public.tenant_service_brands for all
  to authenticated
  using (public.is_tenant_member(tenant_id))
  with check (public.is_tenant_member(tenant_id));

create policy super_admin_all_tenant_service_brands
  on public.tenant_service_brands for all
  to authenticated
  using (public.is_super_admin())
  with check (public.is_super_admin());
