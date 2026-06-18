WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'chauffagiste')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Pompe à chaleur','pompe-a-chaleur',5::smallint,'installation',1),('Chaudière gaz','chaudiere-gaz',4::smallint,'installation',2),('Ballon thermodynamique','ballon-thermodynamique',3::smallint,'installation',3),('Dépannage chauffage','depannage-chauffage',2::smallint,'depannage',4),('Entretien chauffage','entretien-chauffage',1::smallint,'entretien',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'climatisation')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Installation climatisation','installation-climatisation',5::smallint,'installation',1),('Entretien climatisation','entretien-climatisation',4::smallint,'entretien',2),('Dépannage climatisation','depannage-climatisation',3::smallint,'depannage',3),('Climatisation réversible','climatisation-reversible',2::smallint,'installation',4),('Mise en service clim','mise-en-service-clim',1::smallint,'mise-en-service',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'frigoriste')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Chambre froide','chambre-froide',5::smallint,'installation',1),('Dépannage frigorifique','depannage-frigorifique',4::smallint,'depannage',2),('Groupe froid','groupe-froid',3::smallint,'installation',3),('Maintenance frigorifique','maintenance-frigorifique',2::smallint,'maintenance',4),('Contrat entretien froid','contrat-entretien-froid',1::smallint,'entretien',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'ventilation')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('VMC simple flux','vmc-simple-flux',5::smallint,'installation',1),('VMC double flux','vmc-double-flux',4::smallint,'installation',2),('Entretien VMC','entretien-vmc',3::smallint,'entretien',3),('Dépannage VMC','depannage-vmc',2::smallint,'depannage',4),('Installation ventilation','installation-ventilation',1::smallint,'installation',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'pompes-a-chaleur')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('PAC air/eau','pac-air-eau',5::smallint,'installation',1),('PAC air/air','pac-air-air',4::smallint,'installation',2),('Entretien PAC','entretien-pac',3::smallint,'entretien',3),('Dépannage PAC','depannage-pac',2::smallint,'depannage',4),('Remplacement PAC','remplacement-pac',1::smallint,'remplacement',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'photovoltaique')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Installation panneaux solaires','installation-panneaux-solaires',5::smallint,'installation',1),('Autoconsommation','autoconsommation',4::smallint,'installation',2),('Maintenance photovoltaïque','maintenance-photovoltaique',3::smallint,'maintenance',3),('Onduleur photovoltaïque','onduleur-photovoltaique',2::smallint,'remplacement',4),('Batterie solaire','batterie-solaire',1::smallint,'installation',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'ramoneur')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Ramonage cheminée','ramonage-cheminee',5::smallint,'entretien',1),('Ramonage poêle à bois','ramonage-poele-bois',4::smallint,'entretien',2),('Ramonage poêle à granulés','ramonage-poele-granules',3::smallint,'entretien',3),('Débistrage','debistrage',2::smallint,'entretien',4),('Entretien conduit','entretien-conduit',1::smallint,'entretien',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'plomberie')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Dépannage plomberie','depannage-plomberie',5::smallint,'depannage',1),('Débouchage canalisation','debouchage-canalisation',4::smallint,'urgence',2),('Remplacement chauffe-eau','remplacement-chauffe-eau',3::smallint,'remplacement',3),('Rénovation salle de bain','renovation-salle-de-bain',2::smallint,'renovation',4),('Recherche de fuite','recherche-fuite',1::smallint,'depannage',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'electricite')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Dépannage électricité','depannage-electricite',5::smallint,'depannage',1),('Tableau électrique','tableau-electrique',4::smallint,'installation',2),('Mise aux normes électriques','mise-aux-normes-electriques',3::smallint,'renovation',3),('Borne IRVE','borne-irve',2::smallint,'installation',4),('Domotique','domotique',1::smallint,'installation',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'courant-faible-automatisme')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Interphone','interphone',5::smallint,'installation',1),('Vidéosurveillance','videosurveillance',4::smallint,'installation',2),('Motorisation portail','motorisation-portail',3::smallint,'installation',3),('Contrôle d''accès','controle-acces',2::smallint,'installation',4),('Alarme','alarme',1::smallint,'installation',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'serrurerie')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Ouverture de porte','ouverture-porte',5::smallint,'urgence',1),('Remplacement serrure','remplacement-serrure',4::smallint,'remplacement',2),('Porte blindée','porte-blindee',3::smallint,'installation',3),('Sécurisation après effraction','securisation-apres-effraction',2::smallint,'urgence',4),('Dépannage serrurerie','depannage-serrurerie',1::smallint,'depannage',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'couverture')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Réparation toiture','reparation-toiture',5::smallint,'reparation',1),('Rénovation toiture','renovation-toiture',4::smallint,'renovation',2),('Fuite toiture','fuite-toiture',3::smallint,'urgence',3),('Zinguerie','zinguerie',2::smallint,'installation',4),('Démoussage toiture','demoussage-toiture',1::smallint,'entretien',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'peintre')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Peinture intérieure','peinture-interieure',5::smallint,'renovation',1),('Peinture extérieure','peinture-exterieure',4::smallint,'renovation',2),('Rénovation murs et plafonds','renovation-murs-plafonds',3::smallint,'renovation',3),('Ravalement peinture','ravalement-peinture',2::smallint,'renovation',4),('Remise en état logement','remise-en-etat-logement',1::smallint,'renovation',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'tous-corps-etat')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Rénovation appartement','renovation-appartement',5::smallint,'renovation',1),('Rénovation maison','renovation-maison',4::smallint,'renovation',2),('Rénovation salle de bain','renovation-salle-de-bain',3::smallint,'renovation',3),('Rénovation cuisine','renovation-cuisine',2::smallint,'renovation',4),('Entreprise générale bâtiment','entreprise-generale-batiment',1::smallint,'renovation',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'multi-services')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Petits travaux','petits-travaux',5::smallint,'installation',1),('Rénovation intérieure','renovation-interieure',4::smallint,'renovation',2),('Dépannage maison','depannage-maison',3::smallint,'depannage',3),('Montage et pose','montage-pose',2::smallint,'installation',4),('Entretien habitat','entretien-habitat',1::smallint,'entretien',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'sav')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Dépannage','depannage',5::smallint,'depannage',1),('Maintenance','maintenance',4::smallint,'maintenance',2),('Contrat SAV','contrat-sav',3::smallint,'maintenance',3),('Diagnostic panne','diagnostic-panne',2::smallint,'depannage',4),('Remplacement pièce','remplacement-piece',1::smallint,'remplacement',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'cuisiniste')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Pose cuisine','pose-cuisine',5::smallint,'installation',1),('Conception cuisine','conception-cuisine',4::smallint,'installation',2),('Rénovation cuisine','renovation-cuisine',3::smallint,'renovation',3),('Plan de travail','plan-de-travail',2::smallint,'installation',4),('Aménagement cuisine','amenagement-cuisine',1::smallint,'installation',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'lutte-nuisibles')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Dératisation','deratisation',5::smallint,'urgence',1),('Désinsectisation','desinsectisation',4::smallint,'urgence',2),('Désinfection','desinfection',3::smallint,'maintenance',3),('Traitement punaises','traitement-punaises',2::smallint,'urgence',4),('Destruction nid guêpes et frelons','destruction-nid-guepes-frelons',1::smallint,'urgence',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'pisciniste')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Construction piscine','construction-piscine',5::smallint,'construction',1),('Rénovation piscine','renovation-piscine',4::smallint,'renovation',2),('Dépannage filtration piscine','depannage-filtration-piscine',3::smallint,'depannage',3),('Entretien piscine','entretien-piscine',2::smallint,'entretien',4),('Local technique piscine','local-technique-piscine',1::smallint,'installation',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;

WITH trade AS (SELECT id FROM public.trade_templates WHERE slug = 'paysagiste')
INSERT INTO public.trade_service_templates (trade_template_id, name, slug, priority_score, seo_intent, is_featured, sort_order)
SELECT trade.id, v.name, v.slug, v.score, v.intent, true, v.sort FROM trade,
(VALUES ('Aménagement jardin','amenagement-jardin',5::smallint,'installation',1),('Terrasse','terrasse',4::smallint,'construction',2),('Pose clôture','pose-cloture',3::smallint,'installation',3),('Arrosage automatique','arrosage-automatique',2::smallint,'installation',4),('Entretien jardin','entretien-jardin',1::smallint,'entretien',5)) AS v(name,slug,score,intent,sort)
ON CONFLICT (trade_template_id, slug) DO UPDATE SET name=EXCLUDED.name, priority_score=EXCLUDED.priority_score, seo_intent=EXCLUDED.seo_intent, is_featured=true;