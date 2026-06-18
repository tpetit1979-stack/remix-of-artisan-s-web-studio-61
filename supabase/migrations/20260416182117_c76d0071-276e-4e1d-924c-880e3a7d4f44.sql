ALTER TABLE public.site_settings 
ADD COLUMN IF NOT EXISTS ai_analysis JSONB DEFAULT NULL;

COMMENT ON COLUMN public.site_settings.ai_analysis IS 'Cached AI logo analysis: { palette: {...}, style: "...", variants: [{...}], analyzed_at: "..." }';