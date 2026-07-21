import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { CompanySearch } from "@/components/admin/CompanySearch";
import { Wand2, Plus, X, ArrowLeft, ArrowRight, Check, Loader2, Shield, Globe, Flame, Zap, Droplets, Leaf } from "lucide-react";
import { useState, useEffect } from "react";
import { toast } from "sonner";
import { findExistingTenantByIdentity, generateSlug, toTenantMutationError } from "@/lib/tenant-admin";
import { fetchRgeBySiret, type RgeCertification } from "@/lib/rge-api.functions";
import { scrapeQualitenr, type QualitenrData } from "@/lib/qualitenr-scraper.functions";
import { getDefaultPrimaryColorForTrade } from "@/lib/defaults";
import { fetchServiceTemplatesForTrades, activateTenantTrades, PARETO_MIN_SCORE } from "@/lib/tenant-trades";
import { getTradeShortName } from "@/lib/trade-wording";
import { Checkbox } from "@/components/ui/checkbox";

const tradeIcons: Record<string, React.ReactNode> = {
  Flame: <Flame className="h-6 w-6" />,
  Zap: <Zap className="h-6 w-6" />,
  Droplets: <Droplets className="h-6 w-6" />,
  Leaf: <Leaf className="h-6 w-6" />,
};

export const Route = createFileRoute("/super-admin/onboarding")({
  component: OnboardingWizard,
});

type ServiceDraft = {
  name: string;
  slug: string;
  description: string;
  is_featured: boolean;
  trade_template_id: string | null;
  priority_score: number;
  seo_title_template: string | null;
  seo_description_template: string | null;
};

type OnboardingData = {
  company_name: string;
  siret: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  hero_title: string;
  hero_subtitle: string;
  cta_text: string;
  primary_color: string;
  seo_meta_title: string;
  seo_meta_description: string;
  seo_boost_text: string;
  services: ServiceDraft[];
  cities: string[];
};

const defaultData: OnboardingData = {
  company_name: "",
  siret: "",
  phone: "",
  email: "",
  city: "",
  address: "",
  hero_title: "",
  hero_subtitle: "",
  cta_text: "Demander un devis",
  primary_color: "#2563eb",
  seo_meta_title: "",
  seo_meta_description: "",
  seo_boost_text: "",
  services: [],
  cities: [],
};

function generateCitySlug(city: string) {
  return city
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

function buildBriefFromData(d: OnboardingData, certs: RgeCertification[], scraped?: QualitenrData | null): string {
  const parts: string[] = [];
  if (d.company_name) parts.push(`Entreprise : ${d.company_name}`);
  if (d.city) parts.push(`Ville : ${d.city}`);
  if (d.address) parts.push(`Adresse : ${d.address}`);
  if (d.phone) parts.push(`Téléphone : ${d.phone}`);
  if (d.email) parts.push(`Email : ${d.email}`);
  if (d.siret) parts.push(`SIRET : ${d.siret}`);
  if (certs.length > 0) {
    const activeCerts = certs.filter((c) => c.is_active);
    const certNames = [...new Set(activeCerts.map((c) => c.certification_name))];
    const domains = [...new Set(activeCerts.map((c) => c.domaine).filter(Boolean))];
    if (certNames.length > 0) parts.push(`Certifications RGE : ${certNames.join(", ")}`);
    if (domains.length > 0) parts.push(`Domaines : ${domains.join(", ")}`);
  }
  if (scraped) {
    if (scraped.description) parts.push(`\nDescription (source Qualit'EnR) :\n${scraped.description}`);
    if (scraped.competences.length > 0) parts.push(`\nCompétences : ${scraped.competences.join(", ")}`);
  }
  return parts.join("\n");
}

function OnboardingWizard() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [data, setData] = useState<OnboardingData>(defaultData);
  const [brief, setBrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [newService, setNewService] = useState("");
  const [newCity, setNewCity] = useState("");
  const [rgeCerts, setRgeCerts] = useState<RgeCertification[]>([]);
  const [isFetchingRge, setIsFetchingRge] = useState(false);
  const [rgeAutoFetchAttempted, setRgeAutoFetchAttempted] = useState(false);
  const [rgeAutoFetchedFor, setRgeAutoFetchedFor] = useState<string | null>(null);
  const [scrapedData, setScrapedData] = useState<QualitenrData | null>(null);
  const [isScraping, setIsScraping] = useState(false);
  const [selectedTradeId, setSelectedTradeId] = useState<string | null>(null);
  const [complementaryTradeIds, setComplementaryTradeIds] = useState<string[]>([]);

  // Fetch trade categories + templates
  const { data: tradeCategories = [] } = useQuery({
    queryKey: ["trade-categories"],
    queryFn: async () => {
      const { data } = await supabase
        .from("trade_categories")
        .select("*")
        .order("sort_order");
      return data ?? [];
    },
  });

  const { data: tradeTemplates = [] } = useQuery({
    queryKey: ["trade-templates"],
    queryFn: async () => {
      const { data } = await supabase
        .from("trade_templates")
        .select("*")
        .order("sort_order");
      return data ?? [];
    },
  });

  // Group trades by category for the picker UI
  const tradesByCategory = tradeCategories.map((cat) => ({
    category: cat,
    trades: tradeTemplates.filter((t) => t.trade_category_id === cat.id),
  }));
  const uncategorizedTrades = tradeTemplates.filter((t) => !t.trade_category_id);

  // All activated trades = primary + complementary
  const activatedTradeIds = selectedTradeId
    ? [selectedTradeId, ...complementaryTradeIds.filter((id) => id !== selectedTradeId)]
    : [];

  // Fetch service templates for ALL activated trades, sorted by priority_score DESC
  const { data: serviceTemplates = [] } = useQuery({
    queryKey: ["trade-service-templates-multi", activatedTradeIds.join(",")],
    queryFn: () => fetchServiceTemplatesForTrades(activatedTradeIds),
    enabled: activatedTradeIds.length > 0,
  });

  // Auto-select primary trade + apply branding color
  function selectTrade(tradeId: string) {
    setSelectedTradeId(tradeId);
    setComplementaryTradeIds((p) => p.filter((id) => id !== tradeId));
    const trade = tradeTemplates.find((t) => t.id === tradeId);
    if (trade?.slug) {
      const suggested = getDefaultPrimaryColorForTrade(trade.slug);
      setData((p) =>
        p.primary_color === "#2563eb" ? { ...p, primary_color: suggested } : p
      );
    }
  }

  function toggleComplementaryTrade(tradeId: string) {
    if (tradeId === selectedTradeId) return;
    setComplementaryTradeIds((p) =>
      p.includes(tradeId) ? p.filter((id) => id !== tradeId) : [...p, tradeId]
    );
  }

  // Build a service draft from a template row.
  // is_featured = true ONLY for Pareto services of the PRIMARY trade
  // → home stays focused on the main trade.
  function templateToDraft(t: typeof serviceTemplates[number]): ServiceDraft {
    const isPrimaryPareto =
      t.trade_template_id === selectedTradeId && (t.priority_score ?? 0) >= PARETO_MIN_SCORE;
    return {
      name: t.name,
      slug: t.slug,
      description: t.description || "",
      is_featured: isPrimaryPareto,
      trade_template_id: t.trade_template_id,
      priority_score: t.priority_score ?? 0,
      seo_title_template: t.seo_title_template,
      seo_description_template: t.seo_description_template,
    };
  }

  // Pre-select the Pareto services of the PRIMARY trade only (top 5).
  // Called when the user enters the Services step.
  function autoPreselectParetoServices() {
    if (!selectedTradeId || serviceTemplates.length === 0 || data.services.length > 0) return;
    const paretoOfPrimary = serviceTemplates.filter(
      (t) => t.trade_template_id === selectedTradeId && (t.priority_score ?? 0) >= PARETO_MIN_SCORE
    );
    if (paretoOfPrimary.length === 0) return;
    setData((p) => ({ ...p, services: paretoOfPrimary.map(templateToDraft) }));
    toast.success(`${paretoOfPrimary.length} services Pareto du métier principal pré-sélectionnés`);
  }

  function toggleServiceFromTemplate(template: typeof serviceTemplates[number]) {
    setData((p) => {
      const exists = p.services.some((s) => s.slug === template.slug);
      if (exists) {
        return { ...p, services: p.services.filter((s) => s.slug !== template.slug) };
      }
      return { ...p, services: [...p.services, templateToDraft(template)] };
    });
  }

  const steps = [
    "Entreprise",
    "Génération IA",
    "Identité & Branding",
    "Services",
    "Zones",
    "Confirmation",
  ];

  async function generateFromBrief() {
    if (!brief.trim()) {
      toast.error("Collez un brief ou des infos sur le client");
      return;
    }
    setIsGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke(
        "generate-tenant",
        { body: { brief } }
      );
      if (error) throw error;
      if (result.error) throw new Error(result.error);

      setData((prev) => ({
        ...prev,
        company_name: result.company_name || prev.company_name,
        city: result.city || prev.city,
        phone: result.phone || prev.phone,
        email: result.email || prev.email,
        hero_title: result.hero_title || prev.hero_title,
        hero_subtitle: result.hero_subtitle || prev.hero_subtitle,
        cta_text: result.cta_text || prev.cta_text,
        primary_color: result.primary_color || prev.primary_color,
        seo_meta_title: result.seo_meta_title || prev.seo_meta_title,
        seo_meta_description: result.seo_meta_description || prev.seo_meta_description,
        seo_boost_text: result.seo_boost_text || prev.seo_boost_text,
        services: (result.services || []).map((s: any) => ({
          name: s.name,
          slug: generateSlug(s.name),
          description: s.description || "",
          is_featured: s.is_featured ?? false,
          trade_template_id: selectedTradeId,
          priority_score: 0,
          seo_title_template: null,
          seo_description_template: null,
        })),
        cities: result.cities || prev.cities,
      }));
      toast.success("Configuration générée par l'IA !");
      setStep(2);
    } catch (e: any) {
      toast.error(e.message || "Erreur de génération IA");
    } finally {
      setIsGenerating(false);
    }
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      const baseSlug = generateSlug(data.company_name);
      const existingTenant = await findExistingTenantByIdentity({
        companyName: data.company_name,
        slug: baseSlug,
        siret: data.siret || null,
      });

      if (existingTenant) {
        throw new Error(`Client déjà existant : ${existingTenant.company_name} (${existingTenant.slug})`);
      }

      // 1. Create tenant
      const { data: tenant, error: tenantErr } = await supabase
        .from("tenants")
        .insert({
          company_name: data.company_name,
          slug: baseSlug,
          siret: data.siret || null,
          phone: data.phone || null,
          email: data.email || null,
          city: data.city || null,
          address: data.address || null,
          seo_boost_text: data.seo_boost_text || null,
          trade_template_id: selectedTradeId || null,
          is_active: true,
        } as any)
        .select()
        .single();
      if (tenantErr) throw toTenantMutationError(tenantErr);

      // 2. Create site_settings
      const { error: settingsErr } = await supabase
        .from("site_settings")
        .insert({
          tenant_id: tenant.id,
          hero_title: data.hero_title,
          hero_subtitle: data.hero_subtitle,
          cta_text: data.cta_text,
          primary_color: data.primary_color,
          seo_meta_title: data.seo_meta_title,
          seo_meta_description: data.seo_meta_description,
        });
      if (settingsErr) throw settingsErr;

      // 3. Activate trades (primary + complementary). Trigger keeps tenants.trade_template_id in sync.
      if (selectedTradeId) {
        await activateTenantTrades({
          tenantId: tenant.id,
          primaryTradeId: selectedTradeId,
          complementaryTradeIds,
          source: "onboarding",
        });
      }

      // 4. Create services (use draft's pre-resolved slug + SEO templates)
      if (data.services.length > 0) {
        const servicesInsert = data.services.map((s, i) => ({
          tenant_id: tenant.id,
          name: s.name,
          slug: s.slug || generateSlug(s.name),
          description: s.description,
          is_featured: s.is_featured,
          is_active: true,
          sort_order: i,
          seo_title_template: s.seo_title_template,
          seo_description_template: s.seo_description_template,
        }));
        const { data: createdServices, error: svcErr } = await supabase
          .from("services")
          .insert(servicesInsert)
          .select();
        if (svcErr) throw svcErr;

        // 5. Create service_areas (each city × each service)
        if (data.cities.length > 0 && createdServices) {
          const areas = createdServices.flatMap((svc) =>
            data.cities.map((city, i) => ({
              tenant_id: tenant.id,
              service_id: svc.id,
              city,
              city_slug: generateCitySlug(city),
              is_primary: i === 0,
            }))
          );
          const { error: areaErr } = await supabase
            .from("service_areas")
            .insert(areas);
          if (areaErr) throw areaErr;
        }
      }


      // 5. Save RGE certifications
      if (rgeCerts.length > 0) {
        const certsInsert = rgeCerts
          .filter((c) => c.is_active)
          .map((c) => ({
            tenant_id: tenant.id,
            certification_name: c.certification_name,
            organisme: c.organisme,
            qualification_name: c.qualification_name,
            qualification_code: c.qualification_code,
            domaine: c.domaine,
            meta_domaine: c.meta_domaine,
            date_debut: c.date_debut || null,
            date_fin: c.date_fin || null,
            url_qualification: c.url_qualification || null,
            logo_url: c.logo_url || null,
            is_active: true,
          }));
        if (certsInsert.length > 0) {
          const { error: certErr } = await supabase
            .from("tenant_certifications")
            .insert(certsInsert);
          if (certErr) console.error("Cert insert error:", certErr);
        }
      }

      return tenant;
    },
    onSuccess: (tenant) => {
      toast.success(`${data.company_name} créé avec succès !`);
      navigate({ to: "/super-admin/tenants/$tenantId", params: { tenantId: tenant.id } });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function addService() {
    if (!newService.trim()) return;
    const name = newService.trim();
    setData((p) => ({
      ...p,
      services: [
        ...p.services,
        {
          name,
          slug: generateSlug(name),
          description: "",
          is_featured: false,
          trade_template_id: selectedTradeId,
          priority_score: 0,
          seo_title_template: null,
          seo_description_template: null,
        },
      ],
    }));
    setNewService("");
  }

  function removeService(idx: number) {
    setData((p) => ({ ...p, services: p.services.filter((_, i) => i !== idx) }));
  }

  function addCity() {
    if (!newCity.trim() || data.cities.includes(newCity.trim())) return;
    setData((p) => ({ ...p, cities: [...p.cities, newCity.trim()] }));
    setNewCity("");
  }

  function removeCity(idx: number) {
    setData((p) => ({ ...p, cities: p.cities.filter((_, i) => i !== idx) }));
  }

  const update = (field: keyof OnboardingData, value: any) =>
    setData((p) => ({ ...p, [field]: value }));

  async function fetchRgeData() {
    const siret = data.siret.replace(/\s/g, "");
    if (siret.length !== 14) {
      toast.error("SIRET invalide (14 chiffres requis)");
      return;
    }
    setIsFetchingRge(true);
    try {
      const result = await fetchRgeBySiret({ data: { siret } });
      if (result.certifications.length === 0) {
        toast.info("Aucune certification RGE trouvée pour ce SIRET");
        return;
      }
      setRgeCerts(result.certifications);
      // Auto-fill company info from first result
      const first = result.certifications[0];
      setData((prev) => ({
        ...prev,
        company_name: first.company_name || prev.company_name,
        city: first.city || prev.city,
        phone: first.phone || prev.phone,
        email: first.email || prev.email,
        address: first.address
          ? `${first.address}, ${first.postal_code} ${first.city}`
          : prev.address,
      }));

      // Generate SEO boost text from certifications
      const activeCerts = result.certifications.filter((c: RgeCertification) => c.is_active);
      const certNames = [...new Set(activeCerts.map((c: RgeCertification) => c.certification_name))];
      const domains = [...new Set(activeCerts.map((c: RgeCertification) => c.domaine).filter(Boolean))];
      const boostText = `Entreprise certifiée ${certNames.join(", ")} (RGE). Domaines : ${domains.join(", ")}.`;
      update("seo_boost_text", boostText);

      toast.success(`${result.certifications.length} certification(s) RGE trouvée(s) !`);

      // Auto-scrape Qualit'EnR if organisme is qualitenr
      const hasQualitenr = result.certifications.some(
        (c: RgeCertification) => c.organisme?.toLowerCase().includes("qualitenr")
      );
      if (hasQualitenr && first.company_name) {
        scrapeQualitenrPage(first.company_name);
      }
    } catch (e: any) {
      toast.error(e.message || "Erreur lors de la récupération RGE");
    } finally {
      setIsFetchingRge(false);
      setRgeAutoFetchAttempted(true);
    }
  }

  // Auto-trigger the RGE lookup as soon as a valid 14-digit SIRET is present
  // (typed manually or filled by CompanySearch) — no manual click required.
  // Guarded by rgeAutoFetchedFor so it only fires once per distinct SIRET.
  useEffect(() => {
    const siret = data.siret.replace(/\s/g, "");
    if (siret.length !== 14) return;
    if (siret === rgeAutoFetchedFor || isFetchingRge) return;
    setRgeAutoFetchedFor(siret);
    fetchRgeData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.siret]);

  async function scrapeQualitenrPage(companyName: string) {
    setIsScraping(true);
    try {
      const result = await scrapeQualitenr({ data: { companyName } });
      if (result.description || result.competences.length > 0) {
        setScrapedData(result);
        toast.success("Infos Qualit'EnR récupérées !");
      } else {
        toast.info("Page Qualit'EnR trouvée mais peu d'infos extraites");
      }
    } catch (e: any) {
      console.error("Scrape error:", e);
      // Silent fail - not critical
    } finally {
      setIsScraping(false);
    }
  }

  // Auto-update brief when company data changes
  function goToAiStep() {
    const autoBrief = buildBriefFromData(data, rgeCerts, scrapedData);
    if (!brief.trim() || brief === buildBriefFromData(defaultData, [], null)) {
      setBrief(autoBrief);
    }
    setStep(1);
  }

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <AdminPageHeader
        title="Onboarding nouveau client"
        description="Créez un site complet en quelques étapes"
      />

      {/* Progress bar */}
      <div className="flex gap-1">
        {steps.map((s, i) => (
          <button
            key={s}
            onClick={() => i <= step && setStep(i)}
            className={`flex-1 text-xs py-2 px-1 rounded transition-colors ${
              i === step
                ? "bg-primary text-primary-foreground font-medium"
                : i < step
                  ? "bg-primary/20 text-primary cursor-pointer"
                  : "bg-muted text-muted-foreground"
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {/* Step 0: Company search + SIRET + RGE */}
      {step === 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Recherche entreprise</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Recherchez l'entreprise ou saisissez le SIRET pour pré-remplir automatiquement les informations et récupérer les certifications RGE.
            </p>
            <CompanySearch
              onSelect={(d) =>
                setData((p) => ({
                  ...p,
                  company_name: d.company_name,
                  siret: d.siret,
                  address: d.address,
                  city: d.city,
                }))
              }
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nom entreprise *</Label>
                <Input value={data.company_name} onChange={(e) => update("company_name", e.target.value)} required />
                <p className="text-xs text-muted-foreground">
                  Nom récupéré automatiquement depuis le SIRET — vous pouvez le corriger (ex : retirer la forme juridique en MAJUSCULES).
                </p>
              </div>
              <div className="space-y-2">
                <Label>SIRET</Label>
                <div className="flex gap-2">
                  <Input value={data.siret} onChange={(e) => update("siret", e.target.value)} className="flex-1" />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={fetchRgeData}
                    disabled={isFetchingRge || data.siret.replace(/\s/g, "").length !== 14}
                    className="shrink-0"
                  >
                    {isFetchingRge ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <>
                        <Shield className="h-4 w-4 mr-1" />
                        RGE
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </div>

            {/* RGE certifications preview */}
            {rgeCerts.length > 0 && (() => {
              const activeCerts = rgeCerts.filter((c) => c.is_active);
              const uniqueCerts = activeCerts.filter(
                (c, i, arr) => arr.findIndex((x) => x.certification_name === c.certification_name) === i
              );
              const domains = [...new Set(activeCerts.map((c) => c.domaine).filter(Boolean))];
              return (
                <div className="rounded-lg border border-green-200 bg-green-50 p-3 space-y-2">
                  <p className="text-sm font-medium text-green-800 flex items-center gap-1.5">
                    <Shield className="h-4 w-4" />
                    {activeCerts.length} certification(s) RGE active(s) — {uniqueCerts.length} type(s)
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {uniqueCerts.map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs border-green-300 text-green-700 gap-1">
                        {c.logo_url && <img src={c.logo_url} alt="" loading="lazy" decoding="async" className="h-4 w-auto" />}
                        {c.certification_name}
                      </Badge>
                    ))}
                  </div>
                  {domains.length > 0 && (
                    <p className="text-xs text-green-600">
                      Domaines : {domains.join(", ")}
                    </p>
                  )}
                </div>
              );
            })()}

            {/* Qualit'EnR scraping status */}
            {isScraping && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin text-blue-600" />
                <p className="text-sm text-blue-700">Récupération des infos Qualit'EnR en cours...</p>
              </div>
            )}
            {scrapedData && !isScraping && (
              <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 space-y-1">
                <p className="text-sm font-medium text-blue-800 flex items-center gap-1.5">
                  <Globe className="h-4 w-4" />
                  Infos Qualit'EnR récupérées
                </p>
                {scrapedData.description && (
                  <p className="text-xs text-blue-600 line-clamp-2">{scrapedData.description.slice(0, 200)}…</p>
                )}
                {scrapedData.competences.length > 0 && (
                  <p className="text-xs text-blue-600">Compétences : {scrapedData.competences.join(", ")}</p>
                )}
              </div>
            )}
            {/* Manual scrape button if no auto-scrape happened */}
            {!scrapedData && !isScraping && data.company_name && rgeCerts.length === 0 && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => scrapeQualitenrPage(data.company_name)}
                className="gap-1.5"
              >
                <Globe className="h-4 w-4" />
                Chercher sur Qualit'EnR
              </Button>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Téléphone *</Label>
                <Input
                  value={data.phone}
                  onChange={(e) => update("phone", e.target.value)}
                  required
                  aria-invalid={rgeAutoFetchAttempted && !data.phone.trim()}
                />
                {rgeAutoFetchAttempted && !data.phone.trim() && (
                  <p className="text-xs text-amber-600">
                    Non trouvé automatiquement — à remplir manuellement.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Email</Label>
                <Input type="email" value={data.email} onChange={(e) => update("email", e.target.value)} />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Ville</Label>
                <Input value={data.city} onChange={(e) => update("city", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Adresse</Label>
                <Input value={data.address} onChange={(e) => update("address", e.target.value)} />
              </div>
            </div>

            {/* Trade template selector — grouped by category */}
            <div className="space-y-4">
              <Label>Métier principal</Label>
              <div className="space-y-4">
                {tradesByCategory.map(({ category, trades }) =>
                  trades.length === 0 ? null : (
                    <div key={category.id} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {category.name}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                        {trades.map((trade) => (
                          <button
                            key={trade.id}
                            type="button"
                            onClick={() => selectTrade(trade.id)}
                            className={`flex flex-col items-start gap-1 rounded-md border-2 p-3 text-left transition-all ${
                              selectedTradeId === trade.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-primary/30"
                            }`}
                          >
                            <span className="flex items-center gap-1.5 text-muted-foreground">
                              {tradeIcons[trade.icon || ""] ?? <Flame className="h-4 w-4" />}
                            </span>
                            <span className="text-sm font-medium leading-tight">
                              {getTradeShortName(trade.slug, trade.name)}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )
                )}
                {uncategorizedTrades.length > 0 && (
                  <div className="space-y-2">
                    <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                      Autres
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2">
                      {uncategorizedTrades.map((trade) => (
                        <button
                          key={trade.id}
                          type="button"
                          onClick={() => selectTrade(trade.id)}
                          className={`flex flex-col items-start gap-1 rounded-md border-2 p-3 text-left transition-all ${
                            selectedTradeId === trade.id
                              ? "border-primary bg-primary/5"
                              : "border-border hover:border-primary/30"
                          }`}
                        >
                          <span className="text-sm font-medium leading-tight">
                            {getTradeShortName(trade.slug, trade.name)}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {selectedTradeId && (
                <p className="text-xs text-muted-foreground">
                  Les services prioritaires (Pareto) du métier principal seront pré-sélectionnés à l'étape "Services".
                </p>
              )}
            </div>

            {/* Complementary trades — grouped by category */}
            {selectedTradeId && (
              <div className="space-y-4 border-t border-border pt-4">
                <div>
                  <Label>Activités complémentaires (optionnel)</Label>
                  <p className="text-xs text-muted-foreground mt-1">
                    Si l'artisan exerce plusieurs métiers. Leurs services seront proposés à l'étape suivante (non cochés par défaut).
                  </p>
                </div>
                {tradesByCategory.map(({ category, trades }) => {
                  const others = trades.filter((t) => t.id !== selectedTradeId);
                  if (others.length === 0) return null;
                  return (
                    <div key={category.id} className="space-y-2">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        {category.name}
                      </p>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                        {others.map((trade) => {
                          const checked = complementaryTradeIds.includes(trade.id);
                          return (
                            <button
                              key={trade.id}
                              type="button"
                              onClick={() => toggleComplementaryTrade(trade.id)}
                              className={`flex items-center gap-2 rounded-md border p-2.5 text-sm transition-all text-left ${
                                checked
                                  ? "border-primary bg-primary/5 text-foreground"
                                  : "border-border text-muted-foreground hover:border-primary/30"
                              }`}
                            >
                              <span className={`flex h-4 w-4 shrink-0 items-center justify-center rounded border ${checked ? "border-primary bg-primary text-primary-foreground" : "border-muted-foreground/30"}`}>
                                {checked && <Check className="h-3 w-3" />}
                              </span>
                              <span className="truncate">{getTradeShortName(trade.slug, trade.name)}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 1: AI Generation */}
      {step === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Wand2 className="h-5 w-5 text-primary" />
              Génération IA
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Le brief ci-dessous a été pré-rempli avec les informations récupérées.
              Vous pouvez l'enrichir (spécialités, marques, ton souhaité…) avant de lancer la génération.
            </p>
            <Textarea
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
              placeholder={`Ex: Ambiance Chaleur, artisan chauffagiste à Montpellier. 
Spécialisé poêles à granulés, ramonage, installation cheminées.
Intervient à Montpellier, Castelnau, Lattes, Juvignac, Grabels.
Tel: 04 67 00 00 00, certifié RGE.`}
              rows={8}
            />
            <div className="flex gap-3">
              <Button onClick={generateFromBrief} disabled={isGenerating}>
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Génération en cours...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    Générer via IA
                  </>
                )}
              </Button>
              <Button variant="outline" onClick={() => setStep(2)}>
                Passer (remplir manuellement)
                <ArrowRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 2: Branding & SEO */}
      {step === 2 && (
        <Card>
          <CardHeader>
            <CardTitle>Branding & SEO</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Titre Hero *</Label>
              <Input value={data.hero_title} onChange={(e) => update("hero_title", e.target.value)} placeholder="Votre expert chauffage à Montpellier" />
            </div>
            <div className="space-y-2">
              <Label>Sous-titre Hero</Label>
              <Textarea value={data.hero_subtitle} onChange={(e) => update("hero_subtitle", e.target.value)} rows={2} />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Texte CTA</Label>
                <Input value={data.cta_text} onChange={(e) => update("cta_text", e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Couleur primaire</Label>
                <div className="flex gap-2">
                  <input
                    type="color"
                    value={data.primary_color}
                    onChange={(e) => update("primary_color", e.target.value)}
                    className="h-10 w-14 rounded border border-border cursor-pointer"
                  />
                  <Input value={data.primary_color} onChange={(e) => update("primary_color", e.target.value)} className="flex-1" />
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Meta Title SEO</Label>
              <Input value={data.seo_meta_title} onChange={(e) => update("seo_meta_title", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label>Meta Description SEO</Label>
              <Textarea value={data.seo_meta_description} onChange={(e) => update("seo_meta_description", e.target.value)} rows={2} />
            </div>
            <div className="space-y-2">
              <Label>Texte SEO boost</Label>
              <Textarea value={data.seo_boost_text} onChange={(e) => update("seo_boost_text", e.target.value)} rows={3} placeholder="Marques, certifications, spécialités..." />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Step 3: Services */}
      {step === 3 && (
        <Card>
          <CardHeader>
            <CardTitle>Services ({data.services.length})</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Apply trade template button */}
            {selectedTradeId && serviceTemplates.length > 0 && data.services.length === 0 && (
              <div className="flex items-center gap-3 rounded-lg border border-primary/20 bg-primary/5 p-3">
                <p className="text-sm flex-1">
                  <span className="font-medium">{serviceTemplates.length} services</span> disponibles · top Pareto du métier principal pré-sélectionné
                </p>
                <Button size="sm" onClick={autoPreselectParetoServices}>
                  Pré-sélectionner Pareto
                </Button>
              </div>
            )}
            <div className="flex gap-2">
              <Input
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Nom du service (ex: Ramonage)"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addService())}
              />
              <Button onClick={addService} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="space-y-2">
              {data.services.map((s, i) => (
                <div key={i} className="flex items-start gap-2 p-3 rounded border border-border">
                  <div className="flex-1 space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{s.name}</span>
                      {s.is_featured && <Badge variant="default" className="text-xs">Featured</Badge>}
                    </div>
                    <Input
                      value={s.description}
                      onChange={(e) => {
                        const services = [...data.services];
                        services[i] = { ...services[i], description: e.target.value };
                        update("services", services);
                      }}
                      placeholder="Description courte..."
                      className="text-sm"
                    />
                    <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
                      <input
                        type="checkbox"
                        checked={s.is_featured}
                        onChange={(e) => {
                          const services = [...data.services];
                          services[i] = { ...services[i], is_featured: e.target.checked };
                          update("services", services);
                        }}
                      />
                      Mettre en avant
                    </label>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => removeService(i)}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            {data.services.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucun service. Ajoutez-en au moins un.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 4: Cities */}
      {step === 4 && (
        <Card>
          <CardHeader>
            <CardTitle>Zones d'intervention ({data.cities.length} villes)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="Nom de la ville"
                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addCity())}
              />
              <Button onClick={addCity} size="icon" variant="outline">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {data.cities.map((c, i) => (
                <Badge key={i} variant="secondary" className="text-sm py-1 px-3 gap-1">
                  {c}
                  <button onClick={() => removeCity(i)}>
                    <X className="h-3 w-3" />
                  </button>
                </Badge>
              ))}
            </div>
            {data.cities.length === 0 && (
              <p className="text-sm text-muted-foreground text-center py-4">
                Aucune ville. Ajoutez les zones d'intervention.
              </p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Step 5: Confirmation */}
      {step === 5 && (
        <Card>
          <CardHeader>
            <CardTitle>Récapitulatif</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-y-2 text-sm">
              <span className="text-muted-foreground">Entreprise</span>
              <span className="font-medium">{data.company_name}</span>
              <span className="text-muted-foreground">Ville</span>
              <span>{data.city}</span>
              <span className="text-muted-foreground">Téléphone</span>
              <span>{data.phone || "—"}</span>
              <span className="text-muted-foreground">Email</span>
              <span>{data.email || "—"}</span>
              <span className="text-muted-foreground">SIRET</span>
              <span>{data.siret || "—"}</span>
              <span className="text-muted-foreground">Couleur</span>
              <span className="flex items-center gap-2">
                <span className="inline-block w-4 h-4 rounded" style={{ backgroundColor: data.primary_color }} />
                {data.primary_color}
              </span>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-sm font-medium mb-1">Hero</p>
              <p className="text-sm">{data.hero_title}</p>
              <p className="text-xs text-muted-foreground">{data.hero_subtitle}</p>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-sm font-medium mb-1">
                {data.services.length} service(s)
              </p>
              <div className="flex flex-wrap gap-1">
                {data.services.map((s, i) => (
                  <Badge key={i} variant="outline" className="text-xs">
                    {s.name}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="border-t border-border pt-3">
              <p className="text-sm font-medium mb-1">
                {data.cities.length} ville(s)
              </p>
              <div className="flex flex-wrap gap-1">
                {data.cities.map((c, i) => (
                  <Badge key={i} variant="secondary" className="text-xs">
                    {c}
                  </Badge>
                ))}
              </div>
            </div>
            {rgeCerts.length > 0 && (
              <div className="border-t border-border pt-3">
                <p className="text-sm font-medium mb-1 flex items-center gap-1.5">
                  <Shield className="h-4 w-4 text-green-600" />
                  {rgeCerts.filter((c) => c.is_active).length} certification(s) RGE
                </p>
                <div className="flex flex-wrap gap-1">
                  {rgeCerts
                    .filter((c) => c.is_active)
                    .map((c, i) => (
                      <Badge key={i} variant="outline" className="text-xs">
                        {c.certification_name}
                      </Badge>
                    ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="outline"
          onClick={() => (step > 0 ? setStep(step - 1) : navigate({ to: "/super-admin" }))}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {step === 0 ? "Retour" : "Précédent"}
        </Button>

        {step < 5 ? (
          <Button
            onClick={() => step === 0 ? goToAiStep() : setStep(step + 1)}
            disabled={step === 0 && (!data.company_name || !data.phone.trim())}
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending || !data.company_name}
          >
            {saveMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Création...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                Créer le site
              </>
            )}
          </Button>
        )}
      </div>
    </div>
  );
}
