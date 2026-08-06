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
import { TenantCreatedRecap } from "@/components/admin/TenantCreatedRecap";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

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
  trade_service_template_id: string | null;
  priority_score: number;
  seo_title_template: string | null;
  seo_description_template: string | null;
};

type SuggestedService = {
  name: string;
  description: string;
  reason: string | null;
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
  /** AI suggestions outside the template catalogue — never inserted on save,
   * only "Ajouter à mes services" moves one into `services` — as a
   * tenant-scoped custom service, never into `trade_service_templates`
   * (the shared template library other tenants also draw from). */
  suggestedServices: SuggestedService[];
  /** AI's proposed primary_color — a suggestion only, never applied unless
   * the user explicitly clicks "Appliquer" in the Branding step. */
  suggestedPrimaryColor: string | null;
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
  suggestedServices: [],
  suggestedPrimaryColor: null,
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
  const [showRegenerateConfirm, setShowRegenerateConfirm] = useState(false);
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
  const [createdTenant, setCreatedTenant] = useState<{ id: string; company_name: string; slug: string } | null>(null);

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
      trade_service_template_id: t.id,
      priority_score: t.priority_score ?? 0,
      seo_title_template: t.seo_title_template,
      seo_description_template: t.seo_description_template,
    };
  }

  // Deterministic Pareto preselection of the PRIMARY trade's services — the
  // source of truth the AI generation step relies on. Pure, no state write,
  // so it can be called both eagerly (goToAiStep, generateFromBrief) and
  // from the manual fallback button in the Services step.
  function computeParetoPreselection(): ServiceDraft[] {
    if (!selectedTradeId || serviceTemplates.length === 0) return [];
    const paretoOfPrimary = serviceTemplates.filter(
      (t) => t.trade_template_id === selectedTradeId && (t.priority_score ?? 0) >= PARETO_MIN_SCORE
    );
    return paretoOfPrimary.map(templateToDraft);
  }

  // Manual fallback button in the Services step, for the case where the
  // template query hadn't resolved yet when the AI step ran.
  function autoPreselectParetoServices() {
    if (data.services.length > 0) return;
    const preselected = computeParetoPreselection();
    if (preselected.length === 0) return;
    setData((p) => ({ ...p, services: preselected }));
    toast.success(`${preselected.length} services Pareto du métier principal pré-sélectionnés`);
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

  // True once any field a regeneration would touch already has content —
  // whether that content came from a previous AI run or was typed by hand.
  // The two cases are indistinguishable in the current data model, so this
  // errs toward always asking rather than silently overwriting a manual
  // edit.
  function hasExistingEditorialContent(): boolean {
    if (data.hero_title.trim() || data.hero_subtitle.trim() || data.seo_meta_title.trim() || data.seo_meta_description.trim() || data.seo_boost_text.trim()) {
      return true;
    }
    return data.services.some((s) => s.description.trim().length > 0);
  }

  function generateFromBrief() {
    if (!brief.trim()) {
      toast.error("Collez un brief ou des infos sur le client");
      return;
    }
    if (hasExistingEditorialContent()) {
      setShowRegenerateConfirm(true);
      return;
    }
    runGeneration();
  }

  async function runGeneration() {
    setShowRegenerateConfirm(false);
    setIsGenerating(true);
    try {
      // Templates are the source of truth: make sure the Pareto services are
      // preselected before we ever call the AI, even if goToAiStep ran
      // before the template query had resolved.
      let currentServices = data.services;
      if (currentServices.length === 0) {
        const preselected = computeParetoPreselection();
        if (preselected.length > 0) {
          currentServices = preselected;
          setData((p) => ({ ...p, services: preselected }));
        }
      }
      const selectedServices = currentServices
        .filter((s) => s.trade_service_template_id)
        .map((s) => ({ id: s.trade_service_template_id as string, name: s.name }));

      const { data: result, error } = await supabase.functions.invoke(
        "generate-tenant",
        { body: { brief, selectedServices } }
      );
      if (error) throw error;
      if (!result?.success) throw new Error(result?.error?.message || "Erreur de génération IA");
      const aiData = result.data;

      setData((prev) => {
        const enrichmentById = new Map<string, any>(
          (aiData.services_enrichment || []).map((e: any) => [e.id, e])
        );
        // Only description/SEO text of already-selected services is ever
        // patched here — id/slug/name/trade_service_template_id are never
        // touched, matching what the prompt/validator both enforce.
        const services = prev.services.map((s) => {
          const enrichment = s.trade_service_template_id ? enrichmentById.get(s.trade_service_template_id) : undefined;
          if (!enrichment) return s;
          return {
            ...s,
            description: enrichment.description || s.description,
            seo_title_template: enrichment.seo_title_template ?? s.seo_title_template,
            seo_description_template: enrichment.seo_description_template ?? s.seo_description_template,
          };
        });
        return {
          ...prev,
          hero_title: aiData.hero_title || prev.hero_title,
          hero_subtitle: aiData.hero_subtitle || prev.hero_subtitle,
          cta_text: aiData.cta_text || prev.cta_text,
          seo_meta_title: aiData.seo_meta_title || prev.seo_meta_title,
          seo_meta_description: aiData.seo_meta_description || prev.seo_meta_description,
          seo_boost_text: aiData.seo_boost_text || prev.seo_boost_text,
          services,
          // Out-of-catalogue suggestions and the color suggestion are never
          // applied automatically — see the Services and Branding steps.
          suggestedServices: aiData.suggested_services || [],
          suggestedPrimaryColor: aiData.primary_color ?? null,
        };
      });
      toast.success("Configuration générée par l'IA !");
      setStep(2);
    } catch (e: any) {
      toast.error(e.message || "Erreur de génération IA");
    } finally {
      setIsGenerating(false);
    }
  }

  // Manual, explicit conversion of one AI suggestion into a tenant-scoped
  // custom service — never automatic, and never written to the shared
  // `trade_service_templates` library (trade_service_template_id stays
  // null, exactly like addService()'s free-text entries). This only ever
  // touches this tenant's own `services` draft, saved under its tenant_id.
  function addSuggestedServiceToTenant(idx: number) {
    setData((p) => {
      const suggestion = p.suggestedServices[idx];
      if (!suggestion) return p;
      const newDraft: ServiceDraft = {
        name: suggestion.name,
        slug: generateSlug(suggestion.name),
        description: suggestion.description,
        is_featured: false,
        trade_template_id: selectedTradeId,
        trade_service_template_id: null,
        priority_score: 0,
        seo_title_template: null,
        seo_description_template: null,
      };
      return {
        ...p,
        services: [...p.services, newDraft],
        suggestedServices: p.suggestedServices.filter((_, i) => i !== idx),
      };
    });
  }

  function dismissSuggestedService(idx: number) {
    setData((p) => ({ ...p, suggestedServices: p.suggestedServices.filter((_, i) => i !== idx) }));
  }

  function applySuggestedPrimaryColor() {
    setData((p) => (p.suggestedPrimaryColor ? { ...p, primary_color: p.suggestedPrimaryColor, suggestedPrimaryColor: null } : p));
  }

  const saveMutation = useMutation({
    mutationFn: async () => {
      if (!selectedTradeId) {
        throw new Error("Sélectionnez un métier avant de créer le client.");
      }

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
          trade_template_id: selectedTradeId,
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
      await activateTenantTrades({
        tenantId: tenant.id,
        primaryTradeId: selectedTradeId,
        complementaryTradeIds,
        source: "onboarding",
      });

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
          trade_service_template_id: s.trade_service_template_id,
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
      setCreatedTenant({ id: tenant.id, company_name: tenant.company_name, slug: tenant.slug });
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
          trade_service_template_id: null,
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

      // Certifications are shown publicly via their own dedicated,
      // always-live surface (CertificationBadges, reading tenant_certifications
      // directly) — never echoed into seo_boost_text as a cached sentence.
      // seo_boost_text stays purely editorial (Gemini or manual), so a later
      // certification change never leaves a stale claim behind, and no
      // regeneration can drift a qualification's exact wording.
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

  // Auto-update brief when company data changes, and preselect the primary
  // trade's Pareto services BEFORE the AI step — templates are the source
  // of truth, the AI only ever enriches text for services chosen here.
  function goToAiStep() {
    const autoBrief = buildBriefFromData(data, rgeCerts, scrapedData);
    if (!brief.trim() || brief === buildBriefFromData(defaultData, [], null)) {
      setBrief(autoBrief);
    }
    if (data.services.length === 0) {
      const preselected = computeParetoPreselection();
      if (preselected.length > 0) {
        setData((p) => ({ ...p, services: preselected }));
      }
    }
    setStep(1);
  }

  if (createdTenant) {
    return (
      <div className="space-y-6 max-w-3xl mx-auto">
        <AdminPageHeader
          title="Client créé"
          description="Voici le récapitulatif et les étapes restantes pour finaliser l'accès."
        />
        <TenantCreatedRecap
          tenant={createdTenant}
          onOpenTenant={() => navigate({ to: "/super-admin/tenants/$tenantId", params: { tenantId: createdTenant.id } })}
          onBackToList={() => navigate({ to: "/super-admin/tenants" })}
        />
      </div>
    );
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

      <AlertDialog open={showRegenerateConfirm} onOpenChange={setShowRegenerateConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Relancer la génération IA ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action remplace, sans distinction entre ce qui vient d'une génération précédente et ce
              qui a été corrigé à la main :
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="list-disc space-y-1 pl-5 text-sm text-muted-foreground">
            <li>le titre et le sous-titre Hero, le texte du bouton CTA ;</li>
            <li>le meta title et la meta description SEO ;</li>
            <li>le texte éditorial libre (SEO boost) ;</li>
            <li>la description et les textes SEO de chaque service déjà enrichi par l'IA.</li>
          </ul>
          <p className="text-sm text-muted-foreground">
            Ne sont jamais touchés : téléphone, email, ville, zones, SIRET, certifications, ni le nom/slug
            des services (déjà verrouillés côté validateur). Les services ajoutés manuellement ne sont pas
            supprimés. "Annuler" ne modifie rien.
          </p>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={runGeneration}>Relancer quand même</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
                {data.suggestedPrimaryColor && data.suggestedPrimaryColor !== data.primary_color && (
                  <div className="flex items-center gap-2 rounded-md border border-dashed border-primary/40 bg-primary/5 p-2 text-xs">
                    <span className="inline-block w-3.5 h-3.5 rounded" style={{ backgroundColor: data.suggestedPrimaryColor }} />
                    <span className="flex-1">Suggestion IA — à valider : {data.suggestedPrimaryColor}</span>
                    <Button type="button" size="sm" variant="outline" className="h-6 px-2 text-xs" onClick={applySuggestedPrimaryColor}>
                      Appliquer
                    </Button>
                  </div>
                )}
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
              <p className="text-xs text-muted-foreground">
                Texte éditorial libre (marques, spécialités, ton). Les certifications RGE s'affichent
                automatiquement dans leur propre section sur le site — inutile de les répéter ici.
              </p>
              <Textarea value={data.seo_boost_text} onChange={(e) => update("seo_boost_text", e.target.value)} rows={3} placeholder="Ex : spécialiste poêles à granulés et cheminées design..." />
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

            {data.suggestedServices.length > 0 && (
              <div className="space-y-2 border-t border-border pt-4">
                <Label className="text-xs uppercase tracking-wide text-muted-foreground">
                  Suggestions IA — à valider
                </Label>
                {data.suggestedServices.map((s, i) => (
                  <div key={i} className="flex items-start gap-2 p-3 rounded border border-dashed border-primary/40 bg-primary/5">
                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-sm">{s.name}</span>
                        <Badge variant="outline" className="text-xs">Suggestion IA</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">{s.description}</p>
                      {s.reason && <p className="text-xs text-muted-foreground italic">{s.reason}</p>}
                    </div>
                    <div className="flex flex-col gap-1">
                      <Button size="sm" variant="outline" onClick={() => addSuggestedServiceToTenant(i)}>
                        Ajouter à mes services
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => dismissSuggestedService(i)}>
                        Ignorer
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
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
