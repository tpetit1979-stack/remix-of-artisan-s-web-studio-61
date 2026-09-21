-- SUPORDO — capture durable des demandes commerciales du site marketing.
--
-- Table volontairement séparée de `contacts` : `contacts` porte les demandes
-- reçues par les sites artisans, avec `tenant_id NOT NULL` et une policy
-- `tenant_admin_manage_own_contacts` qui ouvre la ligne à tout membre du
-- tenant. Y écrire un prospect SUPORDO imposerait un tenant fictif et
-- rendrait ces prospects lisibles par un client. Les deux flux restent donc
-- strictement séparés.
--
-- Écriture : uniquement côté serveur via le client service_role, qui
-- contourne RLS. Aucune policy INSERT publique n'est créée : personne ne peut
-- insérer depuis un navigateur.

create table public.marketing_leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),

  intent text not null check (intent in ('site_request', 'callback')),
  source text not null check (
    source in ('home', 'pricing', 'how_it_works', 'examples', 'start', 'confirmation')
  ),

  -- Demandés dans les deux formulaires.
  first_name text not null,
  last_name text not null,
  phone text not null,

  -- Demandés uniquement par « Demander mon site ».
  company text,
  city text,
  email text,

  -- `trade` porte le slug canonique de public.trade_templates, ou 'autre'.
  -- Pas de FK : le slug est figé au moment de la demande et ne doit pas
  -- disparaître si la taxonomie évolue.
  trade text,
  trade_other text,

  current_website text,
  message text,

  status text not null default 'new' check (status in ('new', 'contacted', 'closed')),
  -- null = notification email non partie. C'est ce qui rend la persistance
  -- utile : un échec Resend laisse le prospect retrouvable.
  notified_at timestamptz,

  -- Une demande de site est inexploitable sans ces quatre informations ;
  -- un rappel express n'en a besoin d'aucune.
  constraint marketing_leads_site_request_complete check (
    intent <> 'site_request'
    or (company is not null and city is not null and email is not null and trade is not null)
  ),

  -- Le texte libre n'existe que pour 'autre', et il est alors obligatoire.
  constraint marketing_leads_trade_other_coherent check (
    (trade = 'autre' and trade_other is not null)
    or (trade is distinct from 'autre' and trade_other is null)
  )
);

alter table public.marketing_leads enable row level security;

-- Lecture et gestion réservées au Super Admin. Aucun rôle anon, aucun membre
-- de tenant : un prospect SUPORDO n'est jamais visible depuis un site client.
create policy super_admin_manage_marketing_leads
  on public.marketing_leads
  for all
  to authenticated
  using (is_super_admin())
  with check (is_super_admin());

-- Seul index créé : retrouver les demandes dont l'email n'est pas parti.
create index marketing_leads_pending_notification_idx
  on public.marketing_leads (created_at desc)
  where notified_at is null;
