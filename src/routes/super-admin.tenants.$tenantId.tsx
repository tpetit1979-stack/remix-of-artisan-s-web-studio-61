import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  ArrowLeft, Plus, Pencil, Trash2, Star, GripVertical, Settings, Wrench,
  MapPin, Building2, ExternalLink, Wand2, Loader2, Shield, Check, Palette,
  Phone, Eye, ChevronDown, ChevronUp, UserCog, Image as ImageIcon, Calendar, Users, Handshake,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { toast } from "sonner";
import { fetchRgeBySiret, type RgeCertification } from "@/lib/rge-api.functions";
import { buildPublicSiteUrl } from "@/lib/tenant";
import { useImpersonation } from "@/stores/impersonation";
import { TeamManager } from "@/components/admin/TeamManager";
import { PartnersManager } from "@/components/admin/PartnersManager";
import { TenantLogoManager } from "@/components/admin/TenantLogoManager";
import { TenantGooglePlacesManager } from "@/components/admin/TenantGooglePlacesManager";

/* ── Presets ── */
const SECTOR_PRESETS = [
  { label: "Ramoneur", hex: "#1e40af", desc: "Bleu acier" },
  { label: "Chauffagiste", hex: "#c2410c", desc: "Orange brûlé" },
  { label: "Plombier", hex: "#0f766e", desc: "Vert ardoise" },
];
const COLOR_PRESETS = [
  { hex: "#2563eb" }, { hex: "#0891b2" }, { hex: "#0d9488" },
  { hex: "#059669" }, { hex: "#16a34a" }, { hex: "#ca8a04" },
  { hex: "#ea580c" }, { hex: "#dc2626" }, { hex: "#9333ea" },
  { hex: "#db2777" }, { hex: "#475569" }, { hex: "#1e293b" },
];
const GRADIENT_STYLES = [
  { value: "flat", label: "Plat" }, { value: "diagonal", label: "Diagonal" },
  { value: "radial", label: "Radial" }, { value: "dark", label: "Sombre" },
  { value: "light-top", label: "Clair haut" },
];
const FONT_OPTIONS = [
  { value: "inter", label: "Inter", desc: "Moderne" },
  { value: "outfit", label: "Outfit", desc: "Chaleureux" },
  { value: "raleway", label: "Raleway", desc: "Élégant" },
];
const HEADER_STYLES = [
  { value: "solid", label: "Plein" }, { value: "gradient", label: "Dégradé" },
  { value: "dark", label: "Sombre" }, { value: "light", label: "Clair" },
];

function hexToOklchPreview(hex: string) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const toLinear = (v: number) => (v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4));
  const lr = toLinear(r), lg = toLinear(g), lb = toLinear(b);
  const l_ = Math.cbrt(0.4122214708 * lr + 0.5363325363 * lg + 0.0514459929 * lb);
  const m_ = Math.cbrt(0.2119034982 * lr + 0.6806995451 * lg + 0.1073969566 * lb);
  const s_ = Math.cbrt(0.0883024619 * lr + 0.2817188376 * lg + 0.6299787005 * lb);
  const L = 0.2104542553 * l_ + 0.7936177850 * m_ - 0.0040720468 * s_;
  const a = 1.9779984951 * l_ - 2.4285922050 * m_ + 0.4505937099 * s_;
  const bOk = 0.0259040371 * l_ + 0.7827717662 * m_ - 0.8086757660 * s_;
  const C = Math.sqrt(a * a + bOk * bOk);
  let H = (Math.atan2(bOk, a) * 180) / Math.PI;
  if (H < 0) H += 360;
  return { l: L, c: C, h: H };
}

// Must stay in sync with the `TabsTrigger`/`TabsContent` value= list below
// (the "Tabs" section of TenantDetail) — adding a tab there without adding
// it here makes it unreachable via ?tab= but doesn't fail visibly.
const VALID_TABS = [
  "tenant", "settings", "services", "zones", "certifications", "team", "partners", "booking", "ai",
] as const;
type TabValue = (typeof VALID_TABS)[number];
function isTabValue(value: string): value is TabValue {
  return (VALID_TABS as readonly string[]).includes(value);
}

export const Route = createFileRoute("/super-admin/tenants/$tenantId")({
  component: TenantDetail,
  validateSearch: (search: Record<string, unknown>): { tab?: TabValue } => ({
    tab: typeof search.tab === "string" && isTabValue(search.tab) ? search.tab : undefined,
  }),
});

/* ── Helpers ── */
function Field({ label, children, className, hint }: { label: string; children: React.ReactNode; className?: string; hint?: string }) {
  return (
    <div className={`space-y-1 ${className ?? ""}`}>
      <Label className="text-xs font-medium text-muted-foreground">{label}</Label>
      {children}
      {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}

/* ── Full-Width Preview ── */
function FullSitePreview({ designForm, tenant }: { designForm: any; tenant: any }) {
  const color = designForm?.primary_color ?? "#2563eb";
  const radius = designForm?.border_radius ?? 8;
  const headerStyle = designForm?.header_style ?? "solid";
  const fontFamily = designForm?.font_family ?? "inter";
  const companyName = tenant?.company_name ?? "Entreprise";
  const heroTitle = designForm?.hero_title || "Votre titre ici";
  const heroSubtitle = designForm?.hero_subtitle || "Sous-titre de votre site vitrine";
  const ctaText = designForm?.cta_text || "Demander un devis";
  const phone = tenant?.phone || "01 23 45 67 89";
  const city = tenant?.city || "votre ville";

  const fontFamilyCss = fontFamily === "outfit" ? "'Outfit', sans-serif"
    : fontFamily === "raleway" ? "'Raleway', sans-serif" : "'Inter', sans-serif";

  const oklch = hexToOklchPreview(color);
  const lighter = `oklch(${Math.min(0.85, oklch.l * 1.15).toFixed(3)} ${(oklch.c * 0.9).toFixed(3)} ${((oklch.h + 15) % 360).toFixed(1)})`;
  const headerBg = headerStyle === "gradient"
    ? `linear-gradient(135deg, ${color}, ${lighter})`
    : headerStyle === "dark" ? "#1e293b"
    : headerStyle === "light" ? "#ffffff"
    : color;
  const headerTextColor = headerStyle === "light" ? color : "#ffffff";

  return (
    <div style={{ fontFamily: fontFamilyCss }} className="bg-background text-foreground">
      {/* ── Header ── */}
      <header
        className="flex items-center justify-between px-4 py-3 gap-2 flex-wrap"
        style={{
          background: typeof headerBg === "string" && !headerBg.startsWith("linear") ? headerBg : undefined,
          backgroundImage: typeof headerBg === "string" && headerBg.startsWith("linear") ? headerBg : undefined,
          color: headerTextColor,
          borderBottom: headerStyle === "light" ? "1px solid #e5e7eb" : undefined,
        }}
      >
        <div className="flex items-center gap-2 min-w-0">
          {designForm?.logo_url ? (
            <img src={designForm.logo_url} alt="" loading="lazy" decoding="async" className="h-8 w-8 object-contain rounded shrink-0" />
          ) : (
            <div className="h-8 w-8 rounded-lg shrink-0" style={{ backgroundColor: headerStyle === "light" ? color : "rgba(255,255,255,0.2)" }} />
          )}
          <span className="font-bold text-sm truncate">{companyName}</span>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          <nav className="hidden lg:flex items-center gap-4 text-xs font-medium opacity-90">
            <span>Accueil</span><span>Services</span><span>Réalisations</span><span>Contact</span>
          </nav>
          <span className="hidden sm:block text-xs opacity-80 whitespace-nowrap">{phone}</span>
          <div
            className="px-3 py-1.5 text-xs font-semibold cursor-pointer whitespace-nowrap"
            style={{
              backgroundColor: headerStyle === "light" ? color : "rgba(255,255,255,0.2)",
              color: headerStyle === "light" ? "#fff" : "inherit",
              borderRadius: `${radius}px`,
            }}
          >
            {ctaText}
          </div>
        </div>
      </header>

      {/* ── Hero ── */}
      <section
        className="px-4 py-10 md:py-14 text-center space-y-4"
        style={{ background: `linear-gradient(135deg, ${color}12, ${color}06)` }}
      >
        <h1 className="text-2xl md:text-3xl font-bold text-foreground leading-tight max-w-2xl mx-auto">{heroTitle}</h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">{heroSubtitle}</p>
        <div className="flex flex-wrap justify-center gap-3 pt-1">
          <span className="px-6 py-3 text-sm font-semibold text-white cursor-pointer shadow-lg" style={{ backgroundColor: color, borderRadius: `${radius}px` }}>{ctaText}</span>
          <span className="px-6 py-3 text-sm font-semibold border-2 cursor-pointer" style={{ color, borderColor: `${color}60`, borderRadius: `${radius}px` }}>En savoir plus</span>
        </div>
      </section>

      {/* ── Services ── */}
      <section className="px-6 py-12 space-y-6">
        <h2 className="text-xl font-bold text-center text-foreground">Nos services</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {["Installation", "Entretien", "Dépannage"].map((s, i) => (
            <div key={i} className="border p-5 space-y-2 hover:shadow-md transition-shadow" style={{ borderRadius: `${radius}px` }}>
              <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold" style={{ backgroundColor: color }}>{s[0]}</div>
              <p className="font-semibold text-sm">{s}</p>
              <p className="text-xs text-muted-foreground">Service professionnel à {city} et alentours.</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="px-6 py-10 text-center text-white" style={{ backgroundColor: color }}>
        <p className="text-lg font-bold">Besoin d'un artisan de confiance ?</p>
        <p className="text-sm opacity-90 mt-1">Contactez {companyName} pour un devis gratuit.</p>
        <div className="mt-4 inline-block px-6 py-3 bg-white font-semibold text-sm cursor-pointer" style={{ color, borderRadius: `${radius}px` }}>{ctaText}</div>
      </section>

      {/* ── Footer ── */}
      <footer className="px-6 py-6 bg-muted/30 border-t text-center text-sm text-muted-foreground space-y-1">
        <p className="font-medium text-foreground">{companyName}</p>
        <p>{phone} • {tenant?.email || "contact@example.com"}</p>
        <p className="text-xs">© {new Date().getFullYear()} {companyName} — Tous droits réservés</p>
      </footer>
    </div>
  );
}

/* ══════════════════════════════════════════════════════
   MAIN COMPONENT
   ══════════════════════════════════════════════════════ */
function TenantDetail() {
  const { tenantId } = Route.useParams();
  const { tab } = Route.useSearch();
  const activeTab: TabValue = tab ?? "tenant";
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const routeNavigate = Route.useNavigate();
  const { startImpersonation } = useImpersonation();
  const [previewOpen, setPreviewOpen] = useState(true);

  const setTab = useCallback((value: string) => {
    if (isTabValue(value)) routeNavigate({ search: (prev) => ({ ...prev, tab: value }) });
  }, [routeNavigate]);

  // Design form state lifted here so preview updates live
  const [designForm, setDesignForm] = useState<any>(null);

  const { data: tenant } = useQuery({
    queryKey: ["sa-tenant", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: settings } = useQuery({
    queryKey: ["sa-settings", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("*").eq("tenant_id", tenantId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const { data: services = [] } = useQuery({
    queryKey: ["sa-services", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("*").eq("tenant_id", tenantId).order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["sa-areas", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_areas").select("*").eq("tenant_id", tenantId).order("city", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: certifications = [] } = useQuery({
    queryKey: ["sa-certs", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenant_certifications").select("*").eq("tenant_id", tenantId).order("certification_name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Init design form from settings
  useEffect(() => {
    if (settings && !designForm) setDesignForm({ ...settings });
  }, [settings]);

  const setDesignField = useCallback((key: string, value: any) => {
    setDesignForm((p: any) => p ? { ...p, [key]: value } : p);
  }, []);

  const completionItems = [
    { label: "Services", ok: services.length > 0 },
    { label: "Zones", ok: areas.length > 0 },
    { label: "Logo", ok: !!settings?.logo_url },
    { label: "RGE", ok: certifications.length > 0 },
    { label: "SEO", ok: !!(settings?.seo_meta_title && settings?.seo_meta_description) },
  ];
  const completionPct = Math.round((completionItems.filter(i => i.ok).length / completionItems.length) * 100);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link to="/super-admin/tenants">
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-xl font-bold text-foreground truncate">{tenant?.company_name ?? "Chargement..."}</h1>
            {tenant && (
              <a href={buildPublicSiteUrl(tenant)} target="_blank" rel="noopener noreferrer">
                <Badge variant="outline" className="gap-1 cursor-pointer hover:bg-muted text-[10px]">
                  <ExternalLink className="h-3 w-3" /> Voir le site
                </Badge>
              </a>
            )}
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Link to="/super-admin/tenants/$tenantId/media" params={{ tenantId }}>
            <Button size="sm" variant="outline" className="h-8 text-xs gap-1.5">
              <ImageIcon className="h-3.5 w-3.5" /> Photos
            </Button>
          </Link>
          <Button
            size="sm"
            className="h-8 text-xs gap-1.5"
            disabled={!tenant}
            onClick={() => {
              if (!tenant) return;
              startImpersonation(tenant.id, tenant.company_name);
              toast.success(`Impersonation : ${tenant.company_name}`);
              navigate({ to: "/admin/settings" });
            }}
          >
            <UserCog className="h-3.5 w-3.5" /> Gérer ce site
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="h-8 text-xs gap-1.5"
            disabled={!tenant}
            onClick={() => {
              if (!tenant) return;
              startImpersonation(tenant.id, tenant.company_name);
              toast.success(`Impersonation : ${tenant.company_name}`);
              navigate({ to: "/admin/portfolio" });
            }}
          >
            <ImageIcon className="h-3.5 w-3.5" /> Gérer les réalisations
          </Button>
          <div className="hidden md:flex items-center gap-1.5">
            {completionItems.map(item => (
              <Badge key={item.label} variant={item.ok ? "secondary" : "outline"} className="text-[10px] px-1.5 py-0">
                {item.ok && <Check className="h-2.5 w-2.5 mr-0.5" />}{item.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      {/* Completion bar + preview toggle */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
          <div className="h-full rounded-full transition-all" style={{ width: `${completionPct}%`, backgroundColor: completionPct === 100 ? '#16a34a' : '#ea580c' }} />
        </div>
        <span className="text-[10px] text-muted-foreground whitespace-nowrap">{completionPct}%</span>
        <Button variant="outline" size="sm" className="h-8 text-xs gap-1" onClick={() => setPreviewOpen(!previewOpen)}>
          <Eye className="h-3.5 w-3.5" />
          {previewOpen ? "Masquer l’aperçu" : "Afficher l’aperçu"}
          {previewOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </Button>
      </div>

      {/* Tabs — value= list must stay in sync with VALID_TABS above */}
      <Tabs value={activeTab} onValueChange={setTab}>
        <TabsList className="w-full justify-start overflow-x-auto">
          <TabsTrigger value="tenant"><Building2 className="h-3 w-3 mr-1" /> Entreprise</TabsTrigger>
          <TabsTrigger value="settings"><Palette className="h-3 w-3 mr-1" /> Design</TabsTrigger>
          <TabsTrigger value="services"><Wrench className="h-3 w-3 mr-1" /> Services</TabsTrigger>
          <TabsTrigger value="zones"><MapPin className="h-3 w-3 mr-1" /> Zones</TabsTrigger>
          <TabsTrigger value="certifications"><Shield className="h-3 w-3 mr-1" /> RGE</TabsTrigger>
          <TabsTrigger value="team"><Users className="h-3 w-3 mr-1" /> Équipe</TabsTrigger>
          <TabsTrigger value="partners"><Handshake className="h-3 w-3 mr-1" /> Partenaires</TabsTrigger>
          <TabsTrigger value="booking"><Calendar className="h-3 w-3 mr-1" /> RDV</TabsTrigger>
          <TabsTrigger value="ai"><Wand2 className="h-3 w-3 mr-1" /> IA</TabsTrigger>
        </TabsList>

        <TabsContent value="tenant" className="mt-3">
          <TenantTab tenantId={tenantId} tenant={tenant} />
        </TabsContent>
        <TabsContent value="settings" className="mt-3">
          <SettingsTab tenantId={tenantId} designForm={designForm} setDesignField={setDesignField} setDesignForm={setDesignForm} settings={settings} />
        </TabsContent>
        <TabsContent value="services" className="mt-3">
          <ServicesTab tenantId={tenantId} services={services} />
        </TabsContent>
        <TabsContent value="zones" className="mt-3">
          <ZonesTab tenantId={tenantId} areas={areas} services={services} />
        </TabsContent>
        <TabsContent value="certifications" className="mt-3">
          <CertificationsTab tenantId={tenantId} tenant={tenant} certifications={certifications} />
        </TabsContent>
        <TabsContent value="team" className="mt-3">
          <TeamManager tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="partners" className="mt-3">
          <PartnersManager tenantId={tenantId} />
        </TabsContent>
        <TabsContent value="booking" className="mt-3">
          <BookingTab tenantId={tenantId} settings={settings} />
        </TabsContent>
        <TabsContent value="ai" className="mt-3">
          <AiTab tenantId={tenantId} tenant={tenant} settings={settings} />
        </TabsContent>
      </Tabs>

      {previewOpen && designForm && (
        <section className="space-y-3 pt-2">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground">Aperçu du site</h2>
              <p className="text-xs text-muted-foreground">Version pleine largeur en bas, comme une vraie page.</p>
            </div>
            {tenant && (
              <a href={buildPublicSiteUrl(tenant)} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" size="sm" className="h-8 text-xs gap-1">
                  <ExternalLink className="h-3.5 w-3.5" /> Ouvrir le site
                </Button>
              </a>
            )}
          </div>
          <div className="rounded-2xl border bg-card shadow-sm overflow-hidden">
            <FullSitePreview designForm={designForm} tenant={tenant} />
          </div>
        </section>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// TENANT TAB
// ═══════════════════════════════════════════════
function TenantTab({ tenantId, tenant }: { tenantId: string; tenant: any }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);
  // Google fields have their own immediate mutations (TenantGooglePlacesManager,
  // writing straight to `tenants`) so there must be exactly one path that can
  // write those columns — never this generic save racing it. `googleBusy`
  // disables this button while that other path is active.
  const [googleBusy, setGoogleBusy] = useState(false);

  useEffect(() => {
    if (tenant) setForm({ ...tenant });
  }, [tenant]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("tenants").update({
        company_name: form.company_name, slug: form.slug,
        domain: form.domain || null, siret: form.siret || null,
        phone: form.phone || null, email: form.email || null,
        city: form.city || null, address: form.address || null,
        tagline: form.tagline || null,
        years_experience: form.years_experience ? parseInt(form.years_experience) : null,
        seo_boost_text: form.seo_boost_text || null,
        is_active: form.is_active, has_lignia: form.has_lignia,
        lignia_tenant_id: form.lignia_tenant_id || null,
      } as any).eq("id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-tenant", tenantId] }); toast.success("Entreprise mise à jour"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!form) return <p className="text-muted-foreground text-sm">Chargement...</p>;
  const set = (key: string, value: any) => setForm((p: any) => ({ ...p, [key]: value }));

  return (
    <div className="space-y-4 max-w-2xl">
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Nom *" hint="Nom récupéré automatiquement depuis le SIRET — vous pouvez le corriger (ex : retirer la forme juridique en MAJUSCULES)."><Input value={form.company_name ?? ""} onChange={e => set("company_name", e.target.value)} /></Field>
            <Field label="Slug" hint="Le slug identifie techniquement le site. Il ne doit plus être modifié après la création du client."><Input value={form.slug ?? ""} readOnly disabled className="bg-muted cursor-not-allowed" /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Domaine"><Input value={form.domain ?? ""} onChange={e => set("domain", e.target.value)} placeholder="monsite.fr" /></Field>
            <Field label="SIRET"><Input value={form.siret ?? ""} onChange={e => set("siret", e.target.value)} /></Field>
          </div>
          <Field label="Tagline"><Input value={form.tagline ?? ""} onChange={e => set("tagline", e.target.value)} placeholder="Votre expert en..." /></Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Téléphone"><Input value={form.phone ?? ""} onChange={e => set("phone", e.target.value)} /></Field>
            <Field label="Email"><Input type="email" value={form.email ?? ""} onChange={e => set("email", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Ville"><Input value={form.city ?? ""} onChange={e => set("city", e.target.value)} /></Field>
            <Field label="Adresse"><Input value={form.address ?? ""} onChange={e => set("address", e.target.value)} /></Field>
          </div>
          <Field label="Expérience (années)" className="max-w-[120px]"><Input type="number" value={form.years_experience ?? ""} onChange={e => set("years_experience", e.target.value)} /></Field>

          <Separator />
          <TenantGooglePlacesManager
            tenantId={tenantId}
            tenant={tenant}
            disabled={save.isPending}
            onBusyChange={setGoogleBusy}
          />
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-4 space-y-3">
          <Field label="Texte SEO long (éditorial page d'accueil)">
            <Textarea
              value={form.seo_boost_text ?? ""}
              onChange={e => set("seo_boost_text", e.target.value)}
              rows={10}
              placeholder="Ce texte s'affiche en bas de la page d'accueil. Généré par l'IA, éditable ici."
            />
          </Field>
          <Separator />
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Switch checked={form.is_active ?? true} onCheckedChange={v => set("is_active", v)} />
              <Label className="text-sm">Actif</Label>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.has_lignia ?? false} onCheckedChange={v => set("has_lignia", v)} />
              <Label className="text-sm">LIGNIA</Label>
            </div>
          </div>
          {form.has_lignia && (
            <Field label="LIGNIA Tenant ID"><Input value={form.lignia_tenant_id ?? ""} onChange={e => set("lignia_tenant_id", e.target.value)} /></Field>
          )}
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending || googleBusy}>
          {save.isPending ? "Enregistrement..." : "Enregistrer"}
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SETTINGS TAB — uses lifted designForm state
// ═══════════════════════════════════════════════
function SettingsTab({ tenantId, designForm, setDesignField, setDesignForm, settings }: {
  tenantId: string; designForm: any; setDesignField: (k: string, v: any) => void; setDesignForm: (fn: any) => void; settings: any;
}) {
  const queryClient = useQueryClient();

  const currentColor = designForm?.primary_color ?? "#2563eb";
  const radius = designForm?.border_radius ?? 8;
  const gradientStyle = designForm?.gradient_style ?? "flat";
  const fontFamily = designForm?.font_family ?? "inter";
  const headerStyle = designForm?.header_style ?? "solid";

  // Logo is intentionally excluded from this payload: it has its own
  // immediate mutation (TenantLogoManager, writing site_settings.logo_url
  // directly) so there must be exactly one path that can write that column —
  // never two concurrent writers racing each other. `logoBusy` below disables
  // this button while that other path is active, and vice versa.
  const [logoBusy, setLogoBusy] = useState(false);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update({
        hero_title: designForm.hero_title, hero_subtitle: designForm.hero_subtitle,
        primary_color: designForm.primary_color, cta_text: designForm.cta_text,
        seo_meta_title: designForm.seo_meta_title,
        seo_meta_description: designForm.seo_meta_description, border_radius: designForm.border_radius,
        gradient_style: designForm.gradient_style, header_style: designForm.header_style,
        font_family: designForm.font_family,
      }).eq("tenant_id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-settings", tenantId] }); toast.success("Design enregistré"); },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!designForm) return <p className="text-muted-foreground text-sm">Chargement...</p>;

  return (
    <div className="space-y-4 max-w-xl">
      {/* Contenu */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Settings className="h-3 w-3" /> Contenu</p>
          <Field label="Titre hero"><Input value={designForm.hero_title ?? ""} onChange={e => setDesignField("hero_title", e.target.value)} placeholder="Votre expert en..." /></Field>
          <Field label="Sous-titre hero"><Input value={designForm.hero_subtitle ?? ""} onChange={e => setDesignField("hero_subtitle", e.target.value)} /></Field>
          <Field label="Texte CTA"><Input value={designForm.cta_text ?? ""} onChange={e => setDesignField("cta_text", e.target.value)} /></Field>

          <TenantLogoManager
            tenantId={tenantId}
            logoUrl={designForm.logo_url ?? null}
            onLogoChange={(url) => setDesignField("logo_url", url)}
            disabled={save.isPending}
            onBusyChange={setLogoBusy}
          />
        </CardContent>
      </Card>

      {/* Couleur */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5"><Palette className="h-3 w-3" /> Couleur</p>
          {/* Sector presets */}
          <div className="flex gap-1.5 flex-wrap">
            {SECTOR_PRESETS.map(sp => (
              <button key={sp.hex} type="button" onClick={() => setDesignField("primary_color", sp.hex)}
                className={`flex items-center gap-1.5 rounded-lg border px-2.5 py-1 text-xs font-medium transition-all ${currentColor.toLowerCase() === sp.hex.toLowerCase() ? "ring-2 ring-foreground ring-offset-1" : "hover:bg-muted"}`}>
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: sp.hex }} />{sp.label}
              </button>
            ))}
          </div>
          {/* Color grid */}
          <div className="flex gap-1 flex-wrap">
            {COLOR_PRESETS.map(p => (
              <button key={p.hex} type="button" onClick={() => setDesignField("primary_color", p.hex)}
                className="h-7 w-7 rounded-md transition-all hover:scale-110 focus:outline-none relative" style={{ backgroundColor: p.hex }}>
                {currentColor.toLowerCase() === p.hex.toLowerCase() && (
                  <div className="absolute inset-0 flex items-center justify-center rounded-md ring-2 ring-foreground ring-offset-1 ring-offset-background">
                    <Check className="h-3 w-3 text-white drop-shadow" />
                  </div>
                )}
              </button>
            ))}
          </div>
          {/* Custom color input */}
          <div className="flex items-center gap-2">
            <input type="color" value={currentColor} onChange={e => setDesignField("primary_color", e.target.value)}
              className="h-7 w-7 cursor-pointer rounded border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded [&::-webkit-color-swatch]:border-0" />
            <Input value={currentColor} onChange={e => setDesignField("primary_color", e.target.value)} className="w-24 font-mono text-xs h-7" />
          </div>
        </CardContent>
      </Card>

      {/* Style */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Style</p>
          <Field label="Dégradé">
            <div className="flex gap-1 flex-wrap">
              {GRADIENT_STYLES.map(gs => (
                <button key={gs.value} type="button" onClick={() => setDesignField("gradient_style", gs.value)}
                  className={`rounded border px-2 py-0.5 text-xs transition-all ${gradientStyle === gs.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  {gs.label}
                </button>
              ))}
            </div>
          </Field>
          <Field label={`Coins : ${radius}px`}>
            <input type="range" min={0} max={20} value={radius} onChange={e => setDesignField("border_radius", parseInt(e.target.value))} className="w-full accent-primary h-1.5" />
          </Field>
          <Field label="Typo">
            <div className="flex gap-1.5">
              {FONT_OPTIONS.map(fo => (
                <button key={fo.value} type="button" onClick={() => setDesignField("font_family", fo.value)}
                  className={`flex-1 rounded-lg border px-2 py-1.5 text-xs text-left transition-all ${fontFamily === fo.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted"}`}>
                  <span className="font-semibold">{fo.label}</span> <span className="text-muted-foreground">{fo.desc}</span>
                </button>
              ))}
            </div>
          </Field>
          <Field label="Header">
            <div className="flex gap-1 flex-wrap">
              {HEADER_STYLES.map(hs => (
                <button key={hs.value} type="button" onClick={() => setDesignField("header_style", hs.value)}
                  className={`rounded border px-2 py-0.5 text-xs transition-all ${headerStyle === hs.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  {hs.label}
                </button>
              ))}
            </div>
          </Field>
        </CardContent>
      </Card>

      {/* SEO */}
      <Card>
        <CardContent className="pt-4 space-y-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">SEO</p>
          <Field label="Meta titre"><Input value={designForm.seo_meta_title ?? ""} onChange={e => setDesignField("seo_meta_title", e.target.value)} /></Field>
          <Field label="Meta description"><Input value={designForm.seo_meta_description ?? ""} onChange={e => setDesignField("seo_meta_description", e.target.value)} /></Field>
        </CardContent>
      </Card>

      {/* Save — sticky */}
      <div className="sticky bottom-0 bg-background/95 backdrop-blur border-t -mx-4 px-4 py-3 flex justify-end">
        <Button onClick={() => save.mutate()} disabled={save.isPending || logoBusy} size="lg">
          {save.isPending ? "Enregistrement..." : "Enregistrer le design"}
        </Button>
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════
// SERVICES TAB — Catalogue par métier
// ═══════════════════════════════════════════════
function ServicesTab({ tenantId, services }: { tenantId: string; services: any[] }) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<any>(null);
  const [isOpen, setIsOpen] = useState(false);

  // Fetch all trade templates + their service templates
  const { data: trades = [] } = useQuery({
    queryKey: ["trade-templates"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trade_templates")
        .select("*, trade_service_templates(*)")
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  function generateSlug(name: string) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  // Set of slugs already active for this tenant
  const activeSlugs = useMemo(() => new Set(services.map((s: any) => s.slug)), [services]);

  // Toggle a template service on/off
  const toggleService = useMutation({
    mutationFn: async (tpl: any) => {
      const existing = services.find((s: any) => s.slug === tpl.slug);
      if (existing) {
        // Remove it
        const { error } = await supabase.from("services").delete().eq("id", existing.id);
        if (error) throw error;
      } else {
        // Add it
        const { error } = await supabase.from("services").insert({
          tenant_id: tenantId,
          name: tpl.name,
          slug: tpl.slug,
          description: tpl.description ?? "",
          is_featured: tpl.is_featured ?? false,
          is_active: true,
          sort_order: tpl.sort_order ?? services.length,
          seo_title_template: tpl.seo_title_template,
          seo_description_template: tpl.seo_description_template,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-services", tenantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  // Bulk toggle all services in a trade
  const toggleTrade = useMutation({
    mutationFn: async ({ templates, allActive }: { templates: any[]; allActive: boolean }) => {
      if (allActive) {
        // Remove all services matching these slugs
        const slugsToRemove = templates.map((t: any) => t.slug);
        const idsToRemove = services.filter((s: any) => slugsToRemove.includes(s.slug)).map((s: any) => s.id);
        if (idsToRemove.length > 0) {
          const { error } = await supabase.from("services").delete().in("id", idsToRemove);
          if (error) throw error;
        }
      } else {
        // Add missing services
        const missing = templates.filter((t: any) => !activeSlugs.has(t.slug));
        if (missing.length > 0) {
          const rows = missing.map((tpl: any, i: number) => ({
            tenant_id: tenantId,
            name: tpl.name,
            slug: tpl.slug,
            description: tpl.description ?? "",
            is_featured: tpl.is_featured ?? false,
            is_active: true,
            sort_order: services.length + i,
            seo_title_template: tpl.seo_title_template,
            seo_description_template: tpl.seo_description_template,
          }));
          const { error } = await supabase.from("services").insert(rows);
          if (error) throw error;
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-services", tenantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const save = useMutation({
    mutationFn: async (s: any) => {
      if (s.id) {
        const { error } = await supabase.from("services").update({
          name: s.name, slug: s.slug, description: s.description,
          is_featured: s.is_featured, is_active: s.is_active, sort_order: s.sort_order,
          seo_title_template: s.seo_title_template, seo_description_template: s.seo_description_template,
        }).eq("id", s.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert({
          tenant_id: tenantId, name: s.name, slug: s.slug, description: s.description,
          is_featured: s.is_featured ?? false, is_active: s.is_active ?? true,
          sort_order: s.sort_order ?? services.length,
          seo_title_template: s.seo_title_template, seo_description_template: s.seo_description_template,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-services", tenantId] }); setIsOpen(false); setEditing(null); toast.success("Service enregistré"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("services").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-services", tenantId] }); toast.success("Service supprimé"); },
    onError: (e: Error) => toast.error(e.message),
  });

  // Custom services not from any template
  const templateSlugs = useMemo(() => {
    const set = new Set<string>();
    trades.forEach((t: any) => (t.trade_service_templates ?? []).forEach((tpl: any) => set.add(tpl.slug)));
    return set;
  }, [trades]);
  const customServices = services.filter((s: any) => !templateSlugs.has(s.slug));

  return (
    <div className="space-y-4 max-w-2xl">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm font-medium text-foreground">{services.length} activité(s) active(s)</p>
          <p className="text-xs text-muted-foreground">Cochez les activités par métier pour ce tenant</p>
        </div>
        <Button size="sm" className="h-7 text-xs" onClick={() => { setEditing({ name: "", slug: "", description: "", is_featured: false, is_active: true, sort_order: services.length, seo_title_template: "", seo_description_template: "" }); setIsOpen(true); }}>
          <Plus className="h-3 w-3 mr-1" /> Service personnalisé
        </Button>
      </div>

      {/* Catalogue par métier */}
      {trades.length > 0 && (
        <Accordion type="multiple" defaultValue={trades.map((t: any) => t.id)} className="space-y-2">
          {trades.map((trade: any) => {
            const templates = (trade.trade_service_templates ?? []).sort((a: any, b: any) => (a.sort_order ?? 0) - (b.sort_order ?? 0));
            const activeCount = templates.filter((t: any) => activeSlugs.has(t.slug)).length;
            const allActive = activeCount === templates.length && templates.length > 0;
            const someActive = activeCount > 0 && !allActive;

            return (
              <AccordionItem key={trade.id} value={trade.id} className="border rounded-lg overflow-hidden">
                <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-muted/50">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <Checkbox
                      checked={allActive ? true : someActive ? "indeterminate" : false}
                      onCheckedChange={() => toggleTrade.mutate({ templates, allActive: allActive || someActive })}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0"
                    />
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="font-semibold text-sm">{trade.name}</span>
                      <Badge variant="secondary" className="text-[10px] px-1.5 py-0 shrink-0">
                        {activeCount}/{templates.length}
                      </Badge>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-3">
                  <div className="space-y-1 ml-7">
                    {templates.map((tpl: any) => {
                      const isActive = activeSlugs.has(tpl.slug);
                      const existingService = services.find((s: any) => s.slug === tpl.slug);
                      return (
                        <div key={tpl.id} className="flex items-center gap-3 py-1.5 group">
                          <Checkbox
                            checked={isActive}
                            onCheckedChange={() => toggleService.mutate(tpl)}
                            disabled={toggleService.isPending}
                          />
                          <div className="flex-1 min-w-0">
                            <span className={`text-sm ${isActive ? "font-medium text-foreground" : "text-muted-foreground"}`}>{tpl.name}</span>
                            {tpl.description && (
                              <p className="text-[11px] text-muted-foreground line-clamp-1">{tpl.description}</p>
                            )}
                          </div>
                          {isActive && tpl.is_featured && (
                            <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Vedette</Badge>
                          )}
                          {isActive && existingService && (
                            <Button variant="ghost" size="icon" className="h-6 w-6 opacity-0 group-hover:opacity-100" onClick={() => { setEditing({ ...existingService }); setIsOpen(true); }}>
                              <Pencil className="h-3 w-3" />
                            </Button>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      )}

      {/* Services personnalisés (hors template) */}
      {customServices.length > 0 && (
        <div className="space-y-2">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Services personnalisés</p>
          <div className="space-y-1.5">
            {customServices.map((s: any) => (
              <Card key={s.id}>
                <CardContent className="flex items-center gap-3 py-2.5">
                  <GripVertical className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">{s.name}</span>
                      {s.is_featured && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Vedette</Badge>}
                      {!s.is_active && <Badge variant="destructive" className="text-[10px] px-1.5 py-0">Inactif</Badge>}
                    </div>
                    <p className="text-[11px] text-muted-foreground">{s.slug}</p>
                  </div>
                  <div className="flex gap-0.5 shrink-0">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { setEditing({ ...s }); setIsOpen(true); }}><Pencil className="h-3 w-3" /></Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (confirm("Supprimer ?")) del.mutate(s.id); }}><Trash2 className="h-3 w-3 text-destructive" /></Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Dialog édition */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editing?.id ? "Modifier" : "Nouveau service"}</DialogTitle></DialogHeader>
          {editing && (
            <form className="space-y-3" onSubmit={e => { e.preventDefault(); save.mutate(editing); }}>
              <Field label="Nom"><Input value={editing.name} onChange={e => { const name = e.target.value; setEditing((p: any) => ({ ...p, name, slug: p.id ? p.slug : generateSlug(name) })); }} required /></Field>
              <Field label="Slug"><Input value={editing.slug} onChange={e => setEditing((p: any) => ({ ...p, slug: e.target.value }))} required /></Field>
              <Field label="Description"><Textarea value={editing.description ?? ""} onChange={e => setEditing((p: any) => ({ ...p, description: e.target.value }))} rows={3} /></Field>
              <Field label="Ordre" className="max-w-[100px]"><Input type="number" value={editing.sort_order ?? 0} onChange={e => setEditing((p: any) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))} /></Field>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2"><Switch checked={editing.is_active ?? true} onCheckedChange={v => setEditing((p: any) => ({ ...p, is_active: v }))} /><Label className="text-sm">Actif</Label></div>
                <div className="flex items-center gap-2"><Switch checked={editing.is_featured ?? false} onCheckedChange={v => setEditing((p: any) => ({ ...p, is_featured: v }))} /><Label className="text-sm">Vedette</Label></div>
              </div>
              <Field label="SEO titre"><Input value={editing.seo_title_template ?? ""} onChange={e => setEditing((p: any) => ({ ...p, seo_title_template: e.target.value }))} placeholder="{service} à {city}" /></Field>
              <Field label="SEO description"><Textarea value={editing.seo_description_template ?? ""} onChange={e => setEditing((p: any) => ({ ...p, seo_description_template: e.target.value }))} rows={2} /></Field>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={save.isPending}>{save.isPending ? "..." : "Enregistrer"}</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════
// ZONES TAB
// ═══════════════════════════════════════════════
function ZonesTab({ tenantId, areas, services }: { tenantId: string; areas: any[]; services: any[] }) {
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(false);
  const [form, setForm] = useState({ city: "", city_slug: "", service_id: "", is_primary: false });

  function generateSlug(name: string) {
    return name.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
  }

  const add = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("service_areas").insert({ tenant_id: tenantId, city: form.city, city_slug: form.city_slug, service_id: form.service_id, is_primary: form.is_primary });
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-areas", tenantId] }); setIsOpen(false); setForm({ city: "", city_slug: "", service_id: "", is_primary: false }); toast.success("Zone ajoutée"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const bulkAdd = useMutation({
    mutationFn: async () => {
      const rows = services.map(s => ({ tenant_id: tenantId, city: form.city, city_slug: form.city_slug, service_id: s.id, is_primary: form.is_primary }));
      const { error } = await supabase.from("service_areas").insert(rows);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-areas", tenantId] }); setIsOpen(false); setForm({ city: "", city_slug: "", service_id: "", is_primary: false }); toast.success("Zone ajoutée à tous les services"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("service_areas").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-areas", tenantId] }); toast.success("Zone supprimée"); },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePrimary = useMutation({
    mutationFn: async ({ id, is_primary }: { id: string; is_primary: boolean }) => { const { error } = await supabase.from("service_areas").update({ is_primary }).eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-areas", tenantId] }); },
  });

  const grouped = services.map(s => ({ service: s, areas: areas.filter(a => a.service_id === s.id) }));

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">{areas.length} zone(s) · {services.length} service(s)</p>
        <Button size="sm" className="h-7 text-xs" onClick={() => setIsOpen(true)} disabled={services.length === 0}>
          <Plus className="h-3 w-3 mr-1" /> Ajouter
        </Button>
      </div>

      {services.length === 0 ? (
        <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Créez d'abord des services.</CardContent></Card>
      ) : (
        <div className="space-y-2">
          {grouped.map(({ service, areas: sAreas }) => (
            <Card key={service.id}>
              <CardContent className="py-2.5">
                <h3 className="font-medium text-sm text-foreground mb-1.5">{service.name}</h3>
                {sAreas.length === 0 ? (
                  <p className="text-[11px] text-muted-foreground">Aucune zone</p>
                ) : (
                  <div className="flex flex-wrap gap-1">
                    {sAreas.map(area => (
                      <div key={area.id} className="flex items-center gap-0.5 rounded-full border bg-card px-2 py-0.5 text-[11px]">
                        {area.is_primary && <Star className="h-2.5 w-2.5 text-primary fill-primary" />}
                        <span>{area.city}</span>
                        <button onClick={() => togglePrimary.mutate({ id: area.id, is_primary: !area.is_primary })} className="text-muted-foreground hover:text-primary"><Star className="h-2.5 w-2.5" /></button>
                        <button onClick={() => { if (confirm("Supprimer ?")) del.mutate(area.id); }} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-2.5 w-2.5" /></button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader><DialogTitle>Ajouter une zone</DialogTitle></DialogHeader>
          <form className="space-y-3" onSubmit={e => e.preventDefault()}>
            <Field label="Service">
              <Select value={form.service_id} onValueChange={v => setForm(p => ({ ...p, service_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">✦ Tous les services</SelectItem>
                  {services.map(s => <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>)}
                </SelectContent>
              </Select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Ville"><Input value={form.city} onChange={e => setForm(p => ({ ...p, city: e.target.value, city_slug: generateSlug(e.target.value) }))} required /></Field>
              <Field label="Slug"><Input value={form.city_slug} onChange={e => setForm(p => ({ ...p, city_slug: e.target.value }))} required /></Field>
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_primary} onCheckedChange={v => setForm(p => ({ ...p, is_primary: v }))} />
              <Label className="text-sm">Ville principale</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>Annuler</Button>
              {form.service_id === "__all__" ? (
                <Button type="button" onClick={() => bulkAdd.mutate()} disabled={bulkAdd.isPending || !form.city}>{bulkAdd.isPending ? "..." : "Ajouter à tous"}</Button>
              ) : (
                <Button type="button" onClick={() => add.mutate()} disabled={add.isPending || !form.service_id || !form.city}>{add.isPending ? "..." : "Ajouter"}</Button>
              )}
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// ═══════════════════════════════════════════════
// CERTIFICATIONS TAB
// ═══════════════════════════════════════════════
function CertificationsTab({ tenantId, tenant, certifications }: { tenantId: string; tenant: any; certifications: any[] }) {
  const queryClient = useQueryClient();
  const [isFetchingRge, setIsFetchingRge] = useState(false);

  const del = useMutation({
    mutationFn: async (id: string) => { const { error } = await supabase.from("tenant_certifications").delete().eq("id", id); if (error) throw error; },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ["sa-certs", tenantId] }); toast.success("Supprimée"); },
    onError: (e: Error) => toast.error(e.message),
  });

  async function refreshRge() {
    const siret = tenant?.siret?.replace(/\s/g, "");
    if (!siret || siret.length !== 14) { toast.error("SIRET invalide ou manquant"); return; }
    setIsFetchingRge(true);
    try {
      const result = await fetchRgeBySiret({ data: { siret } });
      if (result.certifications.length === 0) { toast.info("Aucune certification RGE trouvée"); return; }
      await supabase.from("tenant_certifications").delete().eq("tenant_id", tenantId);
      const certsInsert = result.certifications.filter((c: RgeCertification) => c.is_active).map((c: RgeCertification) => ({
        tenant_id: tenantId, certification_name: c.certification_name, organisme: c.organisme,
        qualification_name: c.qualification_name, qualification_code: c.qualification_code,
        domaine: c.domaine, meta_domaine: c.meta_domaine,
        date_debut: c.date_debut || null, date_fin: c.date_fin || null,
        url_qualification: c.url_qualification || null, logo_url: c.logo_url || null, is_active: true,
      }));
      if (certsInsert.length > 0) {
        const { error } = await supabase.from("tenant_certifications").insert(certsInsert);
        if (error) throw error;
      }
      queryClient.invalidateQueries({ queryKey: ["sa-certs", tenantId] });
      toast.success(`${certsInsert.length} certification(s) importée(s)`);
    } catch (e: any) {
      toast.error(e.message || "Erreur RGE");
    } finally {
      setIsFetchingRge(false);
    }
  }

  return (
    <div className="space-y-3 max-w-2xl">
      <div className="flex justify-between items-center">
        <p className="text-xs text-muted-foreground">{certifications.length} certification(s)</p>
        <Button onClick={refreshRge} disabled={isFetchingRge || !tenant?.siret} variant="outline" size="sm" className="h-7 text-xs">
          {isFetchingRge ? <Loader2 className="h-3 w-3 animate-spin mr-1" /> : <Shield className="h-3 w-3 mr-1" />}
          {isFetchingRge ? "Récupération..." : "Importer RGE"}
        </Button>
      </div>

      {certifications.length === 0 ? (
        <Card><CardContent className="py-6 text-center text-sm text-muted-foreground">Aucune certification. Importez depuis l'API RGE.</CardContent></Card>
      ) : (
        <div className="space-y-1.5">
          {certifications.map(c => (
            <Card key={c.id}>
              <CardContent className="flex items-center gap-3 py-2.5">
                {c.logo_url && <img src={c.logo_url} alt="" loading="lazy" decoding="async" className="h-7 w-7 object-contain shrink-0" />}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{c.certification_name}</span>
                    {c.is_active && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Active</Badge>}
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{c.qualification_name} — {c.domaine}</p>
                  {c.date_fin && <p className="text-[10px] text-muted-foreground">Expire le {new Date(c.date_fin).toLocaleDateString("fr-FR")}</p>}
                </div>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => { if (confirm("Supprimer ?")) del.mutate(c.id); }}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════
// AI TAB
// ═══════════════════════════════════════════════
function aiTabSlug(name: string) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

type SuggestedService = { name: string; description?: string; is_featured?: boolean };

function AiTab({ tenantId, tenant, settings }: { tenantId: string; tenant: any; settings: any }) {
  const queryClient = useQueryClient();
  const [brief, setBrief] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [suggestedServices, setSuggestedServices] = useState<SuggestedService[]>([]);
  const [selectedSuggestedServices, setSelectedSuggestedServices] = useState<Record<string, boolean>>({});
  const [suggestedCities, setSuggestedCities] = useState<string[]>([]);
  const [selectedCities, setSelectedCities] = useState<Record<string, boolean>>({});
  const [selectedServiceIds, setSelectedServiceIds] = useState<Record<string, boolean>>({});
  const [markFirstPrimary, setMarkFirstPrimary] = useState(true);
  const [isApplying, setIsApplying] = useState(false);

  const { data: tenantServices = [] } = useQuery({
    queryKey: ["sa-services-for-ai", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services")
        .select("id, name, slug, is_active")
        .eq("tenant_id", tenantId)
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: existingAreas = [] } = useQuery({
    queryKey: ["sa-areas-for-ai", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("service_areas")
        .select("service_id, city_slug")
        .eq("tenant_id", tenantId);
      if (error) throw error;
      return data ?? [];
    },
  });

  useEffect(() => {
    if (tenant && !brief) {
      const parts: string[] = [];
      if (tenant.company_name) parts.push(`Entreprise : ${tenant.company_name}`);
      if (tenant.city) parts.push(`Ville : ${tenant.city}`);
      if (tenant.address) parts.push(`Adresse : ${tenant.address}`);
      if (tenant.phone) parts.push(`Téléphone : ${tenant.phone}`);
      if (tenant.email) parts.push(`Email : ${tenant.email}`);
      if (tenant.siret) parts.push(`SIRET : ${tenant.siret}`);
      if (tenant.seo_boost_text) parts.push(`\nInfos SEO :\n${tenant.seo_boost_text}`);
      setBrief(parts.join("\n"));
    }
  }, [tenant]);

  useEffect(() => {
    if (tenantServices.length > 0 && Object.keys(selectedServiceIds).length === 0) {
      const all: Record<string, boolean> = {};
      tenantServices.forEach((s) => { all[s.id] = true; });
      setSelectedServiceIds(all);
    }
  }, [tenantServices]);

  const activeSlugs = useMemo(() => new Set(tenantServices.map((s: any) => s.slug)), [tenantServices]);

  async function regenerate() {
    if (!brief.trim()) { toast.error("Le brief est vide"); return; }
    setIsGenerating(true);
    try {
      const { data: result, error } = await supabase.functions.invoke("generate-tenant", { body: { brief } });
      if (error) throw error;
      if (result.error) throw new Error(result.error);
      const { error: settingsErr } = await supabase.from("site_settings").update({
        hero_title: result.hero_title || settings?.hero_title,
        hero_subtitle: result.hero_subtitle || settings?.hero_subtitle,
        cta_text: result.cta_text || settings?.cta_text,
        primary_color: result.primary_color || settings?.primary_color,
        seo_meta_title: result.seo_meta_title || settings?.seo_meta_title,
        seo_meta_description: result.seo_meta_description || settings?.seo_meta_description,
      }).eq("tenant_id", tenantId);
      if (settingsErr) throw settingsErr;
      if (result.seo_boost_text) {
        await supabase.from("tenants").update({ seo_boost_text: result.seo_boost_text }).eq("id", tenantId);
      }
      const cities: string[] = Array.isArray(result.cities) ? result.cities.filter(Boolean) : [];
      setSuggestedCities(cities);
      const preSelCities: Record<string, boolean> = {};
      cities.forEach((c) => { preSelCities[c] = true; });
      setSelectedCities(preSelCities);

      const svcs: SuggestedService[] = Array.isArray(result.services)
        ? result.services.filter((s: any) => s?.name)
        : [];
      setSuggestedServices(svcs);
      const preSelServices: Record<string, boolean> = {};
      svcs.forEach((s) => { preSelServices[aiTabSlug(s.name)] = !activeSlugs.has(aiTabSlug(s.name)); });
      setSelectedSuggestedServices(preSelServices);

      queryClient.invalidateQueries({ queryKey: ["sa-settings", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["sa-tenant", tenantId] });
      toast.success(`Contenu régénéré ! ${svcs.length} service(s) et ${cities.length} ville(s) suggéré(s).`);
    } catch (e: any) {
      toast.error(e.message || "Erreur");
    } finally {
      setIsGenerating(false);
    }
  }

  const existingPairSet = useMemo(() => {
    const s = new Set<string>();
    existingAreas.forEach((a) => s.add(`${a.service_id}::${a.city_slug}`));
    return s;
  }, [existingAreas]);

  async function applyServicesAndAreas() {
    const servicesToCreate = suggestedServices
      .filter((s) => selectedSuggestedServices[aiTabSlug(s.name)])
      .map((s, idx) => ({
        tenant_id: tenantId,
        name: s.name,
        slug: aiTabSlug(s.name),
        description: s.description ?? "",
        is_featured: s.is_featured ?? false,
        is_active: true,
        sort_order: tenantServices.length + idx,
      }));
    const cities = suggestedCities.filter((c) => selectedCities[c]);

    if (servicesToCreate.length === 0 && cities.length === 0) {
      toast.error("Sélectionnez au moins un service ou une ville");
      return;
    }

    setIsApplying(true);
    try {
      let createdServices: any[] = [];
      if (servicesToCreate.length > 0) {
        const { data, error } = await supabase
          .from("services")
          .upsert(servicesToCreate, { onConflict: "tenant_id,slug" })
          .select();
        if (error) throw error;
        createdServices = data ?? [];
        queryClient.invalidateQueries({ queryKey: ["sa-services", tenantId] });
        queryClient.invalidateQueries({ queryKey: ["sa-services-for-ai", tenantId] });
      }

      let insertedAreasCount = 0;
      if (cities.length > 0) {
        const existingSelected = tenantServices.filter((s) => selectedServiceIds[s.id]);
        const byId = new Map<string, any>();
        [...existingSelected, ...createdServices].forEach((svc) => byId.set(svc.id, svc));
        const services = Array.from(byId.values());

        if (services.length === 0) {
          toast.error("Aucun service à rattacher aux villes sélectionnées");
        } else {
          const rows = services.flatMap((svc) =>
            cities.map((city, idx) => ({
              tenant_id: tenantId,
              service_id: svc.id,
              city,
              city_slug: aiTabSlug(city),
              is_primary: markFirstPrimary && idx === 0,
            }))
          );
          const fresh = rows.filter((r) => !existingPairSet.has(`${r.service_id}::${r.city_slug}`));
          if (fresh.length > 0) {
            const { data: inserted, error } = await supabase
              .from("service_areas")
              .upsert(fresh, { onConflict: "service_id,city_slug", ignoreDuplicates: true })
              .select();
            if (error) throw error;
            insertedAreasCount = inserted?.length ?? fresh.length;
            queryClient.invalidateQueries({ queryKey: ["sa-areas", tenantId] });
            queryClient.invalidateQueries({ queryKey: ["sa-areas-for-ai", tenantId] });
          }
        }
      }

      toast.success(`${createdServices.length} service(s) et ${insertedAreasCount} zone(s) appliqué(s)`);
    } catch (e: any) {
      toast.error(e.message || "Erreur d'application");
    } finally {
      setIsApplying(false);
    }
  }

  const cityIsCovered = (city: string) => {
    const slug = aiTabSlug(city);
    const activeServiceIds = tenantServices.filter((s) => selectedServiceIds[s.id]).map((s) => s.id);
    if (activeServiceIds.length === 0) return false;
    return activeServiceIds.every((sid) => existingPairSet.has(`${sid}::${slug}`));
  };

  return (
    <div className="max-w-2xl space-y-4">
      <Card>
        <CardContent className="pt-4 space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Wand2 className="h-4 w-4 text-primary" /> Régénérer le contenu via IA
          </div>
          <p className="text-[11px] text-muted-foreground">
            Modifiez le brief puis lancez la régénération. Cela mettra à jour le hero, le SEO, le CTA et proposera des villes d'intervention à valider.
          </p>
          <Textarea value={brief} onChange={e => setBrief(e.target.value)} rows={6} placeholder="Informations sur le client..." />
          <Button onClick={regenerate} disabled={isGenerating}>
            {isGenerating ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Génération...</> : <><Wand2 className="h-4 w-4 mr-2" /> Régénérer</>}
          </Button>
        </CardContent>
      </Card>

      {suggestedServices.length > 0 && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Wrench className="h-4 w-4 text-primary" /> Services suggérés par l'IA ({suggestedServices.length})
            </div>
            <p className="text-[11px] text-muted-foreground">
              Cochez les services à créer dans <code>services</code> (upsert sur <code>tenant_id, slug</code>). Les services déjà actifs sont ignorés par défaut.
            </p>
            <div className="flex flex-wrap gap-2">
              {suggestedServices.map((s) => {
                const slug = aiTabSlug(s.name);
                const covered = activeSlugs.has(slug);
                return (
                  <label
                    key={slug}
                    className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm cursor-pointer ${
                      covered ? "border-muted bg-muted/40 text-muted-foreground" : "border-border"
                    }`}
                  >
                    <Checkbox
                      checked={!!selectedSuggestedServices[slug]}
                      onCheckedChange={(v) =>
                        setSelectedSuggestedServices((p) => ({ ...p, [slug]: !!v }))
                      }
                    />
                    <span>{s.name}</span>
                    {s.is_featured && <Badge variant="secondary" className="text-[10px] px-1.5 py-0">Vedette</Badge>}
                    {covered && <span className="text-[10px] uppercase">déjà</span>}
                  </label>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {suggestedCities.length > 0 && (
        <Card>
          <CardContent className="pt-4 space-y-4">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4 text-primary" /> Villes suggérées par l'IA ({suggestedCities.length})
            </div>
            <p className="text-[11px] text-muted-foreground">
              Cochez les villes à insérer dans <code>service_areas</code>. Chaque ville sera rattachée à chaque service sélectionné ci-dessous, ainsi qu'aux services suggérés cochés ci-dessus. Les paires déjà existantes sont ignorées (upsert sur <code>service_id, city_slug</code>).
            </p>

            <div>
              <Label className="text-xs">Villes</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {suggestedCities.map((c) => {
                  const covered = cityIsCovered(c);
                  return (
                    <label
                      key={c}
                      className={`flex items-center gap-2 rounded-md border px-2.5 py-1.5 text-sm cursor-pointer ${
                        covered ? "border-muted bg-muted/40 text-muted-foreground" : "border-border"
                      }`}
                    >
                      <Checkbox
                        checked={!!selectedCities[c]}
                        onCheckedChange={(v) =>
                          setSelectedCities((p) => ({ ...p, [c]: !!v }))
                        }
                      />
                      <span>{c}</span>
                      {covered && <span className="text-[10px] uppercase">déjà</span>}
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <Label className="text-xs">Rattacher aux services</Label>
              {tenantServices.length === 0 ? (
                <p className="text-xs text-muted-foreground mt-2">
                  Aucun service actif. Créez d'abord au moins un service dans l'onglet Services.
                </p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {tenantServices.map((s) => (
                    <label
                      key={s.id}
                      className="flex items-center gap-2 rounded-md border border-border px-2.5 py-1.5 text-sm cursor-pointer"
                    >
                      <Checkbox
                        checked={!!selectedServiceIds[s.id]}
                        onCheckedChange={(v) =>
                          setSelectedServiceIds((p) => ({ ...p, [s.id]: !!v }))
                        }
                      />
                      <span>{s.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
              <Checkbox checked={markFirstPrimary} onCheckedChange={(v) => setMarkFirstPrimary(!!v)} />
              Marquer la 1<sup>re</sup> ville cochée comme ville principale (par service)
            </label>
          </CardContent>
        </Card>
      )}

      {(suggestedServices.length > 0 || suggestedCities.length > 0) && (
        <Button onClick={applyServicesAndAreas} disabled={isApplying}>
          {isApplying ? (
            <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Application...</>
          ) : (
            <><Plus className="h-4 w-4 mr-2" /> Appliquer les services et zones sélectionnés</>
          )}
        </Button>
      )}
    </div>
  );
}

/* ── Booking Tab ── */
function BookingTab({ tenantId, settings }: { tenantId: string; settings: any }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);

  useEffect(() => {
    if (settings && !form) {
      setForm({
        booking_enabled: !!settings.booking_enabled,
        booking_url: settings.booking_url ?? "",
        booking_button_label: settings.booking_button_label ?? "Prendre rendez-vous",
      });
    }
  }, [settings]);

  const save = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("site_settings")
        .update({
          booking_enabled: !!form.booking_enabled,
          booking_url: form.booking_url?.trim() ? form.booking_url.trim() : null,
          booking_button_label: form.booking_button_label?.trim() || "Prendre rendez-vous",
        } as any)
        .eq("tenant_id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-settings", tenantId] });
      toast.success("Prise de rendez-vous enregistrée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  if (!form) return <p className="text-muted-foreground text-sm">Chargement...</p>;

  return (
    <div className="space-y-4 max-w-xl">
      <Card>
        <CardContent className="pt-4 space-y-4">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="h-3 w-3" /> Prise de rendez-vous en ligne
          </p>

          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="sa-booking-enabled">Activer la prise de rendez-vous</Label>
              <p className="text-sm text-muted-foreground">
                Affiche un bouton "Prendre rendez-vous" sur le site public de ce tenant.
              </p>
            </div>
            <Switch
              id="sa-booking-enabled"
              checked={!!form.booking_enabled}
              onCheckedChange={(v: boolean) => setForm((p: any) => ({ ...p, booking_enabled: v }))}
            />
          </div>

          {form.booking_enabled && (
            <div className="space-y-4 border-t pt-4">
              <Field label="Lien de prise de rendez-vous">
                <Input
                  type="url"
                  placeholder="https://calendly.com/votre-lien"
                  value={form.booking_url ?? ""}
                  onChange={(e) => setForm((p: any) => ({ ...p, booking_url: e.target.value }))}
                />
              </Field>
              {!form.booking_url?.trim() && (
                <p className="text-sm text-muted-foreground">
                  Aucun lien configuré pour le moment, le bouton affichera un message d'attente sur le site public.
                </p>
              )}
              <Field label="Texte du bouton">
                <Input
                  value={form.booking_button_label ?? ""}
                  placeholder="Prendre rendez-vous"
                  onChange={(e) => setForm((p: any) => ({ ...p, booking_button_label: e.target.value }))}
                />
              </Field>
            </div>
          )}

          <div className="pt-2">
            <Button size="sm" onClick={() => save.mutate()} disabled={save.isPending}>
              {save.isPending ? "Enregistrement..." : "Enregistrer"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
