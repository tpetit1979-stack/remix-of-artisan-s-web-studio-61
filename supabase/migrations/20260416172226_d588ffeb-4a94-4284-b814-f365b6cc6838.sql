
-- Trade templates table
CREATE TABLE public.trade_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trade_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read trade_templates" ON public.trade_templates FOR SELECT USING (true);
CREATE POLICY "Auth manage trade_templates" ON public.trade_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Trade service templates table
CREATE TABLE public.trade_service_templates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  trade_template_id UUID NOT NULL REFERENCES public.trade_templates(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  slug TEXT NOT NULL,
  description TEXT,
  is_featured BOOLEAN DEFAULT false,
  sort_order INTEGER DEFAULT 0,
  seo_title_template TEXT,
  seo_description_template TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.trade_service_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read trade_service_templates" ON public.trade_service_templates FOR SELECT USING (true);
CREATE POLICY "Auth manage trade_service_templates" ON public.trade_service_templates FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Add trade_template_id to tenants
ALTER TABLE public.tenants ADD COLUMN trade_template_id UUID REFERENCES public.trade_templates(id);

-- Seed: 4 trades
INSERT INTO public.trade_templates (name, slug, description, icon, sort_order) VALUES
  ('Chauffagiste', 'chauffagiste', 'Installation, entretien et dépannage de systèmes de chauffage', 'Flame', 0),
  ('Électricien', 'electricien', 'Travaux électriques, mise aux normes et domotique', 'Zap', 1),
  ('Plombier', 'plombier', 'Plomberie, sanitaire et dépannage', 'Droplets', 2),
  ('Énergéticien', 'energeticien', 'Audit, conseil et rénovation énergétique', 'Leaf', 3);

-- Seed: services for Chauffagiste
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, description, is_featured, sort_order, seo_title_template, seo_description_template)
SELECT t.id, s.name, s.slug, s.description, s.is_featured, s.sort_order, s.seo_title_template, s.seo_description_template
FROM public.trade_templates t,
(VALUES
  ('Installation chaudière', 'installation-chaudiere', 'Installation et remplacement de chaudières gaz, fioul et condensation.', true, 0, '{service} à {city} — {company}', '{company}, expert en {service} à {city}. Devis gratuit.'),
  ('Pompe à chaleur', 'pompe-a-chaleur', 'Installation de pompes à chaleur Air/Eau et Air/Air pour un confort optimal.', true, 1, '{service} à {city} — {company}', '{company}, spécialiste {service} à {city}. RGE, devis gratuit.'),
  ('Entretien et dépannage', 'entretien-depannage', 'Entretien annuel et dépannage de votre système de chauffage.', true, 2, '{service} à {city} — {company}', '{company} assure l''entretien et le dépannage chauffage à {city}.'),
  ('Chauffage écologique / ENR', 'chauffage-ecologique', 'Solutions de chauffage à énergie renouvelable : bois, solaire, géothermie.', false, 3, '{service} à {city} — {company}', '{company}, chauffage écologique et ENR à {city}. Devis gratuit.'),
  ('Aides et subventions chauffage', 'aides-subventions-chauffage', 'Accompagnement pour MaPrimeRénov'', CEE et aides locales.', false, 4, NULL, NULL),
  ('Chauffage bois & biomasse', 'chauffage-bois-biomasse', 'Pose de chaudières à bois, poêles et inserts pour une chaleur naturelle.', false, 5, '{service} à {city} — {company}', '{company}, pose de {service} à {city}. Artisan RGE.'),
  ('Chauffe-eau thermodynamique', 'chauffe-eau-thermodynamique', 'Installation de chauffe-eau thermodynamiques pour réduire votre facture.', false, 6, '{service} à {city} — {company}', '{company}, installation {service} à {city}. Devis gratuit.'),
  ('Solaire photovoltaïque', 'solaire-photovoltaique', 'Installation de panneaux solaires pour produire votre propre électricité.', false, 7, '{service} à {city} — {company}', '{company}, installation {service} à {city}. RGE, devis gratuit.')
) AS s(name, slug, description, is_featured, sort_order, seo_title_template, seo_description_template)
WHERE t.slug = 'chauffagiste';

-- Seed: services for Électricien
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, description, is_featured, sort_order, seo_title_template, seo_description_template)
SELECT t.id, s.name, s.slug, s.description, s.is_featured, s.sort_order, s.seo_title_template, s.seo_description_template
FROM public.trade_templates t,
(VALUES
  ('Mise aux normes électriques', 'mise-aux-normes', 'Diagnostic et mise en conformité de votre installation électrique.', true, 0, '{service} à {city} — {company}', '{company}, {service} à {city}. Devis gratuit.'),
  ('Tableau électrique', 'tableau-electrique', 'Remplacement et mise à niveau de tableaux électriques.', true, 1, '{service} à {city} — {company}', '{company}, intervention {service} à {city}.'),
  ('Dépannage électrique', 'depannage-electrique', 'Intervention rapide pour toute panne électrique.', true, 2, '{service} à {city} — {company}', '{company}, {service} urgent à {city}. Intervention rapide.'),
  ('Éclairage intérieur / extérieur', 'eclairage', 'Conception et installation d''éclairage LED, halogène et décoratif.', false, 3, NULL, NULL),
  ('Domotique', 'domotique', 'Installation de systèmes domotiques pour la maison connectée.', false, 4, NULL, NULL),
  ('Sécurité et conformité', 'securite-conformite', 'Vérification et certification de la conformité de vos installations.', false, 5, NULL, NULL)
) AS s(name, slug, description, is_featured, sort_order, seo_title_template, seo_description_template)
WHERE t.slug = 'electricien';

-- Seed: services for Plombier
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, description, is_featured, sort_order, seo_title_template, seo_description_template)
SELECT t.id, s.name, s.slug, s.description, s.is_featured, s.sort_order, s.seo_title_template, s.seo_description_template
FROM public.trade_templates t,
(VALUES
  ('Dépannage fuite', 'depannage-fuite', 'Recherche et réparation de fuites d''eau en urgence.', true, 0, '{service} à {city} — {company}', '{company}, {service} à {city}. Intervention rapide.'),
  ('Salle de bain', 'salle-de-bain', 'Création et rénovation complète de salle de bain.', true, 1, '{service} à {city} — {company}', '{company}, rénovation {service} à {city}. Devis gratuit.'),
  ('Installation sanitaire', 'installation-sanitaire', 'Pose de sanitaires, robinetterie et raccordements.', true, 2, '{service} à {city} — {company}', '{company}, {service} à {city}.'),
  ('Recherche de fuite', 'recherche-fuite', 'Détection non destructive de fuites d''eau cachées.', false, 3, NULL, NULL),
  ('Chauffe-eau', 'chauffe-eau', 'Installation et remplacement de chauffe-eau électriques et gaz.', false, 4, '{service} à {city} — {company}', '{company}, pose et remplacement {service} à {city}.'),
  ('Urgence plomberie', 'urgence-plomberie', 'Intervention plomberie en urgence 7j/7.', false, 5, '{service} à {city} — {company}', '{company}, {service} à {city}. Disponible 7j/7.')
) AS s(name, slug, description, is_featured, sort_order, seo_title_template, seo_description_template)
WHERE t.slug = 'plombier';

-- Seed: services for Énergéticien
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, description, is_featured, sort_order, seo_title_template, seo_description_template)
SELECT t.id, s.name, s.slug, s.description, s.is_featured, s.sort_order, s.seo_title_template, s.seo_description_template
FROM public.trade_templates t,
(VALUES
  ('Audit énergétique', 'audit-energetique', 'Diagnostic complet de la performance énergétique de votre logement.', true, 0, '{service} à {city} — {company}', '{company}, {service} à {city}. Devis gratuit.'),
  ('Rénovation énergétique', 'renovation-energetique', 'Accompagnement global pour la rénovation énergétique de votre habitat.', true, 1, '{service} à {city} — {company}', '{company}, expert {service} à {city}.'),
  ('Optimisation consommation', 'optimisation-consommation', 'Réduction de vos factures grâce à l''optimisation de vos équipements.', true, 2, NULL, NULL),
  ('Accompagnement aides', 'accompagnement-aides', 'Montage des dossiers MaPrimeRénov'', CEE et aides locales.', false, 3, NULL, NULL),
  ('Étude technique', 'etude-technique', 'Étude thermique et technique avant travaux de rénovation.', false, 4, NULL, NULL),
  ('Parcours de rénovation', 'parcours-renovation', 'Suivi complet de votre projet de rénovation, de l''étude à la réception.', false, 5, NULL, NULL)
) AS s(name, slug, description, is_featured, sort_order, seo_title_template, seo_description_template)
WHERE t.slug = 'energeticien';
