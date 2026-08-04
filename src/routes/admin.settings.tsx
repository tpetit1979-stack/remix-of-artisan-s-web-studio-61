import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminTenant } from "@/hooks/use-tenant";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { useState, useEffect, useMemo } from "react";
import { toast } from "sonner";
import { Check, Palette, Lock } from "lucide-react";
import { LogoAnalyzer } from "@/components/admin/LogoAnalyzer";
import { detectCommercialPromiseIssues } from "@/lib/commercial-promises";

export const Route = createFileRoute("/admin/settings")({
  component: AdminSettings,
});

/* ── Sector presets ── */
const SECTOR_PRESETS = [
  { label: "Ramoneur", hex: "#1e40af", desc: "Bleu acier" },
  { label: "Chauffagiste", hex: "#c2410c", desc: "Orange brûlé" },
  { label: "Plombier", hex: "#0f766e", desc: "Vert ardoise" },
];

/* ── Color presets: curated palettes for artisans ── */
const COLOR_PRESETS = [
  { hex: "#2563eb", name: "Bleu pro" },
  { hex: "#0891b2", name: "Cyan" },
  { hex: "#0d9488", name: "Teal" },
  { hex: "#059669", name: "Émeraude" },
  { hex: "#16a34a", name: "Vert" },
  { hex: "#ca8a04", name: "Or" },
  { hex: "#ea580c", name: "Orange" },
  { hex: "#dc2626", name: "Rouge" },
  { hex: "#9333ea", name: "Violet" },
  { hex: "#db2777", name: "Rose" },
  { hex: "#475569", name: "Ardoise" },
  { hex: "#1e293b", name: "Nuit" },
];

const GRADIENT_STYLES = [
  { value: "flat", label: "Plat" },
  { value: "diagonal", label: "Diagonal" },
  { value: "radial", label: "Radial" },
  { value: "dark", label: "Sombre" },
  { value: "light-top", label: "Clair haut" },
];

const FONT_OPTIONS = [
  { value: "inter", label: "Inter", desc: "Moderne et lisible" },
  { value: "outfit", label: "Outfit", desc: "Rond et chaleureux" },
  { value: "raleway", label: "Raleway", desc: "Élégant et premium" },
];

const HEADER_STYLES = [
  { value: "solid", label: "Couleur pleine" },
  { value: "gradient", label: "Dégradé" },
  { value: "dark", label: "Sombre" },
  { value: "light", label: "Blanc bordé" },
];

function hexToOklchPreview(hex: string): { l: number; c: number; h: number } {
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

function generatePreviewShades(hex: string) {
  const { l, c, h } = hexToOklchPreview(hex);
  return [
    { label: "Clair", css: `oklch(${Math.min(0.95, l * 1.35).toFixed(3)} ${(c * 0.2).toFixed(3)} ${h.toFixed(1)})` },
    { label: "Léger", css: `oklch(${Math.min(0.88, l * 1.2).toFixed(3)} ${(c * 0.4).toFixed(3)} ${h.toFixed(1)})` },
    { label: "Base", css: hex },
    { label: "Foncé", css: `oklch(${(l * 0.75).toFixed(3)} ${(c * 1.1).toFixed(3)} ${h.toFixed(1)})` },
    { label: "Profond", css: `oklch(${(l * 0.5).toFixed(3)} ${c.toFixed(3)} ${h.toFixed(1)})` },
  ];
}

function AdminSettings() {
  const { tenant, settings } = useAdminTenant();
  const queryClient = useQueryClient();
  const [form, setForm] = useState<any>(null);
  const [tenantForm, setTenantForm] = useState<any>(null);

  useEffect(() => {
    if (settings) setForm({ ...settings });
  }, [settings]);

  useEffect(() => {
    if (tenant) setTenantForm({ phone: tenant.phone ?? "", email: tenant.email ?? "" });
  }, [tenant]);

  const currentColor = form?.primary_color ?? "#2563eb";
  const currentBorderRadius = form?.border_radius ?? 8;
  const currentGradientStyle = form?.gradient_style ?? "flat";
  const currentFontFamily = form?.font_family ?? "inter";
  const currentHeaderStyle = form?.header_style ?? "solid";
  const shades = useMemo(() => generatePreviewShades(currentColor), [currentColor]);

  const saveSettings = useMutation({
    mutationFn: async () => {
      // logo_url, favicon_url, hero_image_url are intentionally NOT in this payload:
      // brand visuals are managed exclusively by super-admin (DB trigger enforces this too).
      const { error } = await supabase
        .from("site_settings")
        .update({
          hero_title: form.hero_title,
          hero_subtitle: form.hero_subtitle,
          primary_color: form.primary_color,
          cta_text: form.cta_text,
          seo_meta_title: form.seo_meta_title,
          seo_meta_description: form.seo_meta_description,
          border_radius: form.border_radius,
          gradient_style: form.gradient_style,
          header_style: form.header_style,
          font_family: form.font_family,
          booking_enabled: form.booking_enabled ?? false,
          booking_url: form.booking_url ?? null,
          booking_button_label: form.booking_button_label ?? "Prendre rendez-vous",
          quote_is_free: form.quote_is_free ?? null,
          quote_response_delay_hours: form.quote_response_delay_hours ?? null,
          emergency_service_available: form.emergency_service_available ?? null,
          whatsapp_enabled: form.whatsapp_enabled ?? false,
          whatsapp_number: form.whatsapp_number ?? null,
          whatsapp_message_template: form.whatsapp_message_template ?? null,
        } as any)
        .eq("tenant_id", tenant!.id);
      if (error) throw error;
    },

    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings"] });
      toast.success("Paramètres enregistrés");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveTenant = useMutation({
    mutationFn: async () => {
      const { error } = await supabase
        .from("tenants")
        .update({ phone: tenantForm.phone, email: tenantForm.email })
        .eq("id", tenant!.id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tenant"] });
      toast.success("Coordonnées enregistrées");
    },
    onError: (e: Error) => toast.error(e.message),
  });


  if (!form || !tenantForm) return <p className="text-muted-foreground">Chargement...</p>;

  // Pure, local check — no network call. Only warns; the actual reconciliation is a
  // Super Admin action (Lot B2), never automatic here.
  const promiseIssues = detectCommercialPromiseIssues({
    ctaText: form.cta_text ?? null,
    quoteIsFree: form.quote_is_free ?? null,
    quoteResponseDelayHours: form.quote_response_delay_hours ?? null,
    emergencyServiceAvailable: form.emergency_service_available ?? null,
  });

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Mon site" description="Personnalisez l'apparence de votre site" />

      {/* Coordonnées */}
      <Card>
        <CardHeader><CardTitle>Coordonnées</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Téléphone</Label>
              <Input value={tenantForm.phone} onChange={(e) => setTenantForm((p: any) => ({ ...p, phone: e.target.value }))} />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Input type="email" value={tenantForm.email} onChange={(e) => setTenantForm((p: any) => ({ ...p, email: e.target.value }))} />
            </div>
          </div>
          <Button onClick={() => saveTenant.mutate()} disabled={saveTenant.isPending}>
            {saveTenant.isPending ? "Enregistrement..." : "Enregistrer"}
          </Button>
        </CardContent>
      </Card>

      {/* Logo — read-only, managed by super-admin */}
      <Card>
        <CardHeader><CardTitle>Logo & identité visuelle</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            {form.logo_url ? (
              <img src={form.logo_url} alt="Logo" loading="lazy" className="h-16 object-contain rounded border bg-muted/30 p-2" />
            ) : (
              <div className="h-16 w-32 rounded border bg-muted/30 flex items-center justify-center text-xs text-muted-foreground">
                Aucun logo
              </div>
            )}
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>Géré par votre agence — contactez-nous pour modifier votre logo.</span>
            </div>
          </div>

          <div className="border-t pt-4">
            <LogoAnalyzer
              logoUrl={form.logo_url ?? null}
              tenantId={tenant!.id}
              tradeName={tenant?.company_name}
              cachedAnalysis={form.ai_analysis ?? null}
              onAnalyzed={(analysis) => setForm((p: any) => ({ ...p, ai_analysis: analysis }))}
              onApply={(v) => setForm((p: any) => ({
                ...p,
                primary_color: v.primary_color,
                gradient_style: v.gradient_style,
                font_family: v.font_family,
                header_style: v.header_style,
                border_radius: v.border_radius,
              }))}
            />
          </div>
        </CardContent>
      </Card>


      {/* Hero */}
      <Card>
        <CardHeader><CardTitle>Hero</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>Titre</Label>
            <Input value={form.hero_title ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, hero_title: e.target.value }))} />
          </div>
          <div className="space-y-2">
            <Label>Sous-titre</Label>
            <Input value={form.hero_subtitle ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, hero_subtitle: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp */}
      <Card>
        <CardHeader><CardTitle>WhatsApp</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="wa-enabled">Activer le bouton WhatsApp</Label>
              <p className="text-sm text-muted-foreground">
                Affiche un bouton WhatsApp sur votre site public.
              </p>
            </div>
            <Switch
              id="wa-enabled"
              checked={!!form.whatsapp_enabled}
              onCheckedChange={(v: boolean) => setForm((p: any) => ({ ...p, whatsapp_enabled: v }))}
            />
          </div>
          {form.whatsapp_enabled && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Numéro WhatsApp</Label>
                <Input
                  type="tel"
                  placeholder="06 XX XX XX XX"
                  value={form.whatsapp_number ?? ""}
                  onChange={(e) => setForm((p: any) => ({ ...p, whatsapp_number: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label>Message pré-rempli</Label>
                <Input
                  placeholder="Bonjour, je souhaite un devis."
                  value={form.whatsapp_message_template ?? ""}
                  onChange={(e) => setForm((p: any) => ({ ...p, whatsapp_message_template: e.target.value }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Devis & engagements */}
      <Card>
        <CardHeader><CardTitle>Devis & engagements</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            Ne renseignez que ce qui est vrai pour votre entreprise. "Non précisé" n'affiche jamais de promesse sur votre site.
          </p>

          {promiseIssues.length > 0 && (
            <div className="rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              Votre bouton d'appel à l'action évoque la gratuité, mais "Devis gratuit" n'est pas réglé sur "Oui" ci-dessous.
              Corrigez l'un des deux pour rester cohérent.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Devis gratuit</Label>
              <Select
                value={form.quote_is_free === null || form.quote_is_free === undefined ? "unset" : String(form.quote_is_free)}
                onValueChange={(v) => setForm((p: any) => ({ ...p, quote_is_free: v === "unset" ? null : v === "true" }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">Non précisé</SelectItem>
                  <SelectItem value="true">Oui, gratuit</SelectItem>
                  <SelectItem value="false">Non, payant</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Intervention d'urgence</Label>
              <Select
                value={form.emergency_service_available === null || form.emergency_service_available === undefined ? "unset" : String(form.emergency_service_available)}
                onValueChange={(v) => setForm((p: any) => ({ ...p, emergency_service_available: v === "unset" ? null : v === "true" }))}
              >
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="unset">Non précisé</SelectItem>
                  <SelectItem value="true">Oui</SelectItem>
                  <SelectItem value="false">Non</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label>Délai de réponse habituel (heures)</Label>
            <Input
              type="number"
              min={1}
              max={720}
              value={form.quote_response_delay_hours ?? ""}
              placeholder="Non précisé"
              onChange={(e) => {
                const raw = e.target.value;
                setForm((p: any) => ({
                  ...p,
                  quote_response_delay_hours: raw === "" ? null : Math.min(720, Math.max(1, parseInt(raw, 10))),
                }));
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Couleur & Palette */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-5 w-5" />
            Palette de couleurs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Sector presets */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Preset sectoriel</Label>
            <div className="flex gap-2 flex-wrap">
              {SECTOR_PRESETS.map((sp) => (
                <button
                  key={sp.hex}
                  type="button"
                  onClick={() => setForm((f: any) => ({ ...f, primary_color: sp.hex }))}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-all hover:shadow-md ${currentColor.toLowerCase() === sp.hex.toLowerCase() ? "ring-2 ring-foreground ring-offset-2" : ""}`}
                >
                  <div className="h-4 w-4 rounded-full" style={{ backgroundColor: sp.hex }} />
                  <span className="font-medium">{sp.label}</span>
                  <span className="text-muted-foreground text-xs">({sp.desc})</span>
                </button>
              ))}
            </div>
          </div>

          {/* Presets grid */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Ou choisissez une couleur</Label>
            <div className="grid grid-cols-6 sm:grid-cols-12 gap-2">
              {COLOR_PRESETS.map((p) => (
                <button
                  key={p.hex}
                  type="button"
                  onClick={() => setForm((f: any) => ({ ...f, primary_color: p.hex }))}
                  className="group relative aspect-square rounded-lg transition-all hover:scale-110 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                  style={{ backgroundColor: p.hex }}
                  title={p.name}
                >
                  {currentColor.toLowerCase() === p.hex.toLowerCase() && (
                    <div className="absolute inset-0 flex items-center justify-center rounded-lg ring-2 ring-foreground ring-offset-2 ring-offset-background">
                      <Check className="h-4 w-4 text-white drop-shadow-md" />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Custom color */}
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={currentColor}
              onChange={(e) => setForm((p: any) => ({ ...p, primary_color: e.target.value }))}
              className="h-10 w-10 cursor-pointer rounded-lg border-0 p-0 [&::-webkit-color-swatch-wrapper]:p-0 [&::-webkit-color-swatch]:rounded-lg [&::-webkit-color-swatch]:border-0"
            />
            <Input
              value={currentColor}
              onChange={(e) => setForm((p: any) => ({ ...p, primary_color: e.target.value }))}
              className="w-32 font-mono text-sm"
              placeholder="#2563eb"
            />
            <span className="text-sm text-muted-foreground">ou couleur personnalisée</span>
          </div>

          {/* Gradient style */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Style de dégradé</Label>
            <div className="flex gap-1 flex-wrap">
              {GRADIENT_STYLES.map((gs) => (
                <button
                  key={gs.value}
                  type="button"
                  onClick={() => setForm((f: any) => ({ ...f, gradient_style: gs.value }))}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition-all ${currentGradientStyle === gs.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                >
                  {gs.label}
                </button>
              ))}
            </div>
          </div>

          {/* Live palette preview */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Dégradé automatique</Label>
            <div className="flex gap-1 rounded-xl overflow-hidden h-14">
              {shades.map((s, i) => (
                <div key={i} className="flex-1 flex items-end justify-center pb-1 transition-all" style={{ backgroundColor: s.css }}>
                  <span className="text-[10px] font-medium text-white/80 drop-shadow-sm">{s.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Live preview card */}
          <div>
            <Label className="text-sm text-muted-foreground mb-3 block">Aperçu en direct</Label>
            <div className="border bg-card p-6 space-y-4" style={{ borderRadius: `${currentBorderRadius}px` }}>
              <div className="flex items-center gap-3">
                <div className="h-10 w-10" style={{ backgroundColor: currentColor, borderRadius: `${currentBorderRadius}px` }} />
                <div>
                  <p className="font-semibold" style={{ color: currentColor }}>Votre entreprise</p>
                  <p className="text-sm text-muted-foreground">Expert en chauffage</p>
                </div>
              </div>
              <div className="flex gap-2">
                <button type="button" className="px-4 py-2 text-sm font-medium text-white transition-opacity hover:opacity-90" style={{ backgroundColor: currentColor, borderRadius: `${currentBorderRadius}px` }}>
                  Demander un devis
                </button>
                <button type="button" className="border px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80" style={{ color: currentColor, borderColor: currentColor + "40", borderRadius: `${currentBorderRadius}px` }}>
                  En savoir plus
                </button>
              </div>
            </div>
          </div>

          {/* CTA text */}
          <div className="space-y-2">
            <Label>Texte du bouton CTA</Label>
            <Input value={form.cta_text ?? ""} onChange={(e) => setForm((p: any) => ({ ...p, cta_text: e.target.value }))} />
          </div>
        </CardContent>
      </Card>

      {/* Border Radius */}
      <Card>
        <CardHeader><CardTitle>Rayon des coins</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="range"
              min={0}
              max={20}
              value={currentBorderRadius}
              onChange={(e) => setForm((p: any) => ({ ...p, border_radius: parseInt(e.target.value) }))}
              className="flex-1 accent-primary"
            />
            <span className="text-sm font-mono w-12 text-right">{currentBorderRadius}px</span>
          </div>
          <div className="flex gap-3">
            {[0, 4, 8, 12, 16].map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setForm((p: any) => ({ ...p, border_radius: v }))}
                className={`h-10 w-10 border-2 transition-all ${currentBorderRadius === v ? "border-primary" : "border-muted"}`}
                style={{ borderRadius: `${v}px`, backgroundColor: currentBorderRadius === v ? currentColor + "20" : undefined }}
              />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Typography */}
      <Card>
        <CardHeader><CardTitle>Typographie</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {FONT_OPTIONS.map((fo) => (
              <button
                key={fo.value}
                type="button"
                onClick={() => setForm((f: any) => ({ ...f, font_family: fo.value }))}
                className={`rounded-xl border p-4 text-left transition-all ${currentFontFamily === fo.value ? "ring-2 ring-primary bg-primary/5" : "hover:bg-muted"}`}
              >
                <p className="font-semibold text-lg">{fo.label}</p>
                <p className="text-sm text-muted-foreground">{fo.desc}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Header Style */}
      <Card>
        <CardHeader><CardTitle>Style de header</CardTitle></CardHeader>
        <CardContent>
          <div className="flex gap-2 flex-wrap">
            {HEADER_STYLES.map((hs) => (
              <button
                key={hs.value}
                type="button"
                onClick={() => setForm((f: any) => ({ ...f, header_style: hs.value }))}
                className={`rounded-lg border px-4 py-2 text-sm transition-all ${currentHeaderStyle === hs.value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
              >
                {hs.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Online booking */}
      <Card>
        <CardHeader><CardTitle>Prise de rendez-vous en ligne</CardTitle></CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div className="space-y-0.5">
              <Label htmlFor="booking-enabled">Activer la prise de rendez-vous</Label>
              <p className="text-sm text-muted-foreground">
                Affiche un bouton "Prendre rendez-vous" sur votre site public.
              </p>
            </div>
            <Switch
              id="booking-enabled"
              checked={!!form.booking_enabled}
              onCheckedChange={(v: boolean) => setForm((p: any) => ({ ...p, booking_enabled: v }))}
            />
          </div>

          {form.booking_enabled && (
            <div className="space-y-4 border-t pt-4">
              <div className="space-y-2">
                <Label>Lien de prise de rendez-vous</Label>
                <Input
                  type="url"
                  placeholder="https://calendly.com/votre-lien"
                  value={form.booking_url ?? ""}
                  onChange={(e) => setForm((p: any) => ({ ...p, booking_url: e.target.value }))}
                />
                {!form.booking_url?.trim() && (
                  <p className="text-sm text-muted-foreground">
                    Aucun lien configuré pour le moment, le bouton affichera un message d'attente sur le site public.
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Texte du bouton</Label>
                <Input
                  value={form.booking_button_label ?? ""}
                  placeholder="Prendre rendez-vous"
                  onChange={(e) => setForm((p: any) => ({ ...p, booking_button_label: e.target.value }))}
                />
              </div>
            </div>
          )}
        </CardContent>
      </Card>



      {/* SEO */}
      <SeoSection form={form} setForm={setForm} tenant={tenant} />


      <div className="flex justify-end">
        <Button size="lg" onClick={() => saveSettings.mutate()} disabled={saveSettings.isPending}>
          {saveSettings.isPending ? "Enregistrement..." : "Enregistrer les paramètres"}
        </Button>
      </div>
    </div>
  );
}

/* ── SEO section with live Google preview + character counters ── */

function buildDefaultSeoTitle(tenant: any): string {
  const company = tenant?.company_name ?? "Votre entreprise";
  const city = tenant?.city;
  const trade = tenant?.trade_label ?? tenant?.trade ?? "Artisan";
  const base = city ? `${trade} à ${city} — ${company}` : `${trade} — ${company}`;
  return `${base} | Devis gratuit`;
}

function buildDefaultSeoDescription(tenant: any): string {
  const company = tenant?.company_name ?? "Notre entreprise";
  const city = tenant?.city;
  const trade = (tenant?.trade_label ?? tenant?.trade ?? "artisan").toString().toLowerCase();
  const where = city ? `à ${city} et alentours` : "près de chez vous";
  return `${company}, ${trade} certifié, intervient ${where}. Devis gratuit, intervention rapide, travail soigné. Contactez-nous dès aujourd'hui.`.slice(0, 160);
}

function counterColor(len: number, min: number, max: number): string {
  if (len === 0) return "text-muted-foreground";
  if (len < min) return "text-orange-600";
  if (len > max) return "text-red-600";
  return "text-emerald-600";
}

function counterBarColor(len: number, min: number, max: number): string {
  if (len === 0) return "bg-muted";
  if (len < min) return "bg-orange-500";
  if (len > max) return "bg-red-500";
  return "bg-emerald-500";
}

function CharCounter({ len, min, max, hardMax }: { len: number; min: number; max: number; hardMax: number }) {
  const pct = Math.min(100, (len / hardMax) * 100);
  const label =
    len === 0 ? "Vide — un titre auto sera utilisé"
    : len < min ? `Trop court (min. ${min})`
    : len > max ? `Trop long (max. ${max})`
    : "Longueur optimale";
  return (
    <div className="space-y-1">
      <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
        <div className={`h-full transition-all ${counterBarColor(len, min, max)}`} style={{ width: `${pct}%` }} />
      </div>
      <div className="flex justify-between text-xs">
        <span className={counterColor(len, min, max)}>{label}</span>
        <span className={`font-mono ${counterColor(len, min, max)}`}>{len} / {max}</span>
      </div>
    </div>
  );
}

function GooglePreview({ title, description, url }: { title: string; description: string; url: string }) {
  return (
    <div className="rounded-lg border bg-white p-4 font-sans">
      <div className="text-xs text-[#202124]/70 truncate">{url.replace(/^https?:\/\//, "")}</div>
      <div className="mt-0.5 text-[18px] leading-6 text-[#1a0dab] hover:underline cursor-pointer truncate">
        {title || "Titre de votre page"}
      </div>
      <div className="mt-1 text-sm leading-5 text-[#4d5156] line-clamp-2">
        {description || "La description de votre page apparaîtra ici dans les résultats de recherche Google."}
      </div>
    </div>
  );
}

function SeoSection({ form, setForm, tenant }: { form: any; setForm: any; tenant: any }) {
  const defaultTitle = useMemo(() => buildDefaultSeoTitle(tenant), [tenant]);
  const defaultDescription = useMemo(() => buildDefaultSeoDescription(tenant), [tenant]);

  const titleValue = form.seo_meta_title ?? "";
  const descValue = form.seo_meta_description ?? "";
  const previewTitle = titleValue.trim() || defaultTitle;
  const previewDesc = descValue.trim() || defaultDescription;

  const siteUrl = typeof window !== "undefined"
    ? `${window.location.protocol}//${window.location.host}`
    : "https://votresite.fr";

  return (
    <Card>
      <CardHeader>
        <CardTitle>SEO</CardTitle>
        <p className="text-sm text-muted-foreground">
          Ces champs contrôlent l'aperçu Google de votre page d'accueil. Laissez vide pour utiliser un titre généré automatiquement.
        </p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label>Meta titre</Label>
          <Input
            value={titleValue}
            placeholder={defaultTitle}
            onChange={(e) => setForm((p: any) => ({ ...p, seo_meta_title: e.target.value }))}
          />
          <CharCounter len={titleValue.length} min={50} max={60} hardMax={65} />
          <GooglePreview title={previewTitle} description={previewDesc} url={siteUrl} />
        </div>

        <div className="space-y-2">
          <Label>Meta description</Label>
          <Input
            value={descValue}
            placeholder={defaultDescription}
            onChange={(e) => setForm((p: any) => ({ ...p, seo_meta_description: e.target.value }))}
          />
          <CharCounter len={descValue.length} min={120} max={155} hardMax={160} />
        </div>
      </CardContent>
    </Card>
  );
}

