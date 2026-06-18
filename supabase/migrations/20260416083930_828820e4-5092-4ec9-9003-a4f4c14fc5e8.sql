
CREATE TABLE public.tenant_certifications (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  tenant_id uuid NOT NULL REFERENCES public.tenants(id) ON DELETE CASCADE,
  certification_name text NOT NULL,
  organisme text,
  qualification_name text,
  qualification_code text,
  domaine text,
  meta_domaine text,
  date_debut date,
  date_fin date,
  url_qualification text,
  logo_url text,
  is_active boolean DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE public.tenant_certifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read certifications"
  ON public.tenant_certifications FOR SELECT
  USING (true);

CREATE POLICY "Auth manage certifications"
  ON public.tenant_certifications FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE INDEX idx_tenant_certifications_tenant ON public.tenant_certifications(tenant_id);
CREATE INDEX idx_tenant_certifications_active ON public.tenant_certifications(tenant_id, is_active);
