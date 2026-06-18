ALTER TABLE public.trade_service_templates
  DROP CONSTRAINT IF EXISTS trade_service_templates_seo_intent_check;

ALTER TABLE public.trade_service_templates
  ADD CONSTRAINT trade_service_templates_seo_intent_check
  CHECK (seo_intent IS NULL OR seo_intent IN (
    'installation', 'depannage', 'entretien', 'renovation', 'urgence',
    'devis', 'maintenance', 'construction', 'remplacement', 'reparation',
    'mise-en-service'
  ));