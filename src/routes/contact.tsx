import { createFileRoute, Link, useSearch } from "@tanstack/react-router";
import { useTenant } from "@/hooks/use-tenant";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchFirstActiveTenant, fetchSiteSettings, fetchServices } from "@/lib/tenant";
import { buildPageTitle } from "@/lib/seo";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Phone, Mail, MapPin, CheckCircle, Clock, Shield } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/contact")({
  validateSearch: (search: Record<string, unknown>): { service?: string } => ({
    service: typeof search.service === "string" ? search.service : undefined,
  }),
  loader: async () => {
    const tenant = await fetchFirstActiveTenant();
    const settings = await fetchSiteSettings(tenant.id);
    return { tenant, settings };
  },
  head: ({ loaderData }) => {
    if (!loaderData) return {};
    const { tenant, settings } = loaderData;
    const title = buildPageTitle(settings, tenant, "Contact – Demandez votre devis gratuit");
    const description = `Contactez ${tenant.company_name} pour un devis gratuit et personnalisé. Réponse rapide garantie.`;
    const baseUrl = tenant.domain ? `https://${tenant.domain}` : "";
    return {
      meta: [
        { title },
        { name: "description", content: description },
        { property: "og:title", content: title },
        { property: "og:description", content: description },
      ],
      links: baseUrl ? [{ rel: "canonical", href: `${baseUrl}/contact` }] : [],
    };
  },
  component: ContactPage,
});

function ContactPage() {
  const { tenant, settings } = useTenant();
  const { service: prefilledService } = Route.useSearch();

  const { data: services = [] } = useQuery({
    queryKey: ["services", tenant?.id],
    queryFn: () => fetchServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    service_id: prefilledService || "",
    message: "",
  });
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!tenant) return;
    if (!form.name.trim() || !form.phone.trim()) {
      toast.error("Veuillez renseigner votre nom et téléphone.");
      return;
    }
    setSending(true);
    try {
      const { error } = await supabase.from("contacts").insert({
        tenant_id: tenant.id,
        name: form.name.trim(),
        phone: form.phone.trim() || null,
        email: form.email.trim() || null,
        service_id: form.service_id || null,
        message: form.message.trim() || null,
      });
      if (error) throw error;
      setSent(true);
      toast.success("Demande envoyée ! Nous vous rappelons rapidement.");
    } catch {
      toast.error("Erreur lors de l'envoi. Veuillez réessayer.");
    } finally {
      setSending(false);
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col">
        <PublicHeader />
        <main className="flex flex-1 items-center justify-center px-4 py-16">
          <div className="max-w-md text-center">
            <CheckCircle className="mx-auto h-16 w-16 text-primary" />
            <h1 className="mt-6 text-2xl font-bold text-foreground">Demande envoyée !</h1>
            <p className="mt-3 text-muted-foreground">
              Merci pour votre demande. {tenant?.company_name} vous recontactera dans les plus brefs délais.
            </p>
            {tenant?.phone && (
              <p className="mt-4 text-sm text-muted-foreground">
                Besoin urgent ?{" "}
                <a href={`tel:${tenant.phone.replace(/\s/g, "")}`} className="font-semibold text-primary hover:underline">
                  Appelez-nous au {tenant.phone}
                </a>
              </p>
            )}
            <Link to="/" className="mt-6 inline-block">
              <Button variant="outline">Retour à l'accueil</Button>
            </Link>
          </div>
        </main>
        <PublicFooter />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 py-12 sm:py-16">
        <div className="mx-auto max-w-7xl px-4">
          <div className="grid gap-10 lg:grid-cols-5">
            {/* Left — trust & contact info */}
            <div className="lg:col-span-2">
              <h1 className="text-3xl font-bold text-foreground sm:text-4xl">
                Demandez votre devis gratuit
              </h1>
              <p className="mt-4 text-muted-foreground">
                Remplissez le formulaire ou appelez-nous directement. Nous répondons sous 24h.
              </p>

              {/* Trust badges */}
              <div className="mt-8 space-y-4">
                <div className="flex items-start gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Réponse rapide</p>
                    <p className="text-sm text-muted-foreground">Nous vous rappelons sous 24h</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Devis gratuit</p>
                    <p className="text-sm text-muted-foreground">Sans engagement de votre part</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <CheckCircle className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                  <div>
                    <p className="font-medium text-foreground">Intervention rapide</p>
                    <p className="text-sm text-muted-foreground">Technicien qualifié et certifié</p>
                  </div>
                </div>
              </div>

              {/* Direct contact */}
              {tenant && (
                <div className="mt-8 space-y-3 rounded-lg border border-border bg-muted/30 p-5">
                  <p className="text-sm font-semibold text-foreground">Contact direct</p>
                  {tenant.phone && (
                    <a
                      href={`tel:${tenant.phone.replace(/\s/g, "")}`}
                      className="flex items-center gap-3 text-foreground transition-colors hover:text-primary"
                    >
                      <Phone className="h-5 w-5 text-primary" />
                      <span className="text-lg font-bold">{tenant.phone}</span>
                    </a>
                  )}
                  {tenant.email && (
                    <a
                      href={`mailto:${tenant.email}`}
                      className="flex items-center gap-3 text-sm text-muted-foreground hover:text-primary"
                    >
                      <Mail className="h-4 w-4" />
                      <span>{tenant.email}</span>
                    </a>
                  )}
                  {(tenant.address || tenant.city) && (
                    <div className="flex items-start gap-3 text-sm text-muted-foreground">
                      <MapPin className="mt-0.5 h-4 w-4" />
                      <span>{[tenant.address, tenant.city].filter(Boolean).join(", ")}</span>
                    </div>
                  )}
                </div>
              )}

              {/* Google Maps embed — no API key required for the basic iframe. */}
              {tenant?.city && (
                <div className="mt-6 overflow-hidden rounded-lg border border-border">
                  <iframe
                    title={`Carte — ${tenant.city}`}
                    src={`https://www.google.com/maps?q=${encodeURIComponent(
                      [tenant.address, tenant.city].filter(Boolean).join(", "),
                    )}&output=embed`}
                    width="100%"
                    height="260"
                    loading="lazy"
                    referrerPolicy="no-referrer-when-downgrade"
                    className="block w-full border-0"
                  />
                </div>
              )}
            </div>

            {/* Right — form */}
            <form
              onSubmit={handleSubmit}
              className="space-y-4 rounded-xl border border-border bg-card p-6 shadow-sm lg:col-span-3"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Nom *</Label>
                  <Input
                    id="name"
                    required
                    placeholder="Votre nom"
                    maxLength={100}
                    value={form.name}
                    onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone *</Label>
                  <Input
                    id="phone"
                    type="tel"
                    required
                    placeholder="06 XX XX XX XX"
                    maxLength={20}
                    value={form.phone}
                    onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (optionnel)</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="votre@email.com"
                  maxLength={255}
                  value={form.email}
                  onChange={(e) => setForm((p) => ({ ...p, email: e.target.value }))}
                />
              </div>
              {services.length > 0 && (
                <div className="space-y-2">
                  <Label htmlFor="service">Service concerné</Label>
                  <Select
                    value={form.service_id}
                    onValueChange={(v) => setForm((p) => ({ ...p, service_id: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Choisir un service" />
                    </SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
              <div className="space-y-2">
                <Label htmlFor="message">Votre demande</Label>
                <Textarea
                  id="message"
                  rows={4}
                  placeholder="Décrivez votre besoin..."
                  maxLength={1000}
                  value={form.message}
                  onChange={(e) => setForm((p) => ({ ...p, message: e.target.value }))}
                />
              </div>
              <Button type="submit" size="lg" className="w-full" disabled={sending}>
                {sending ? "Envoi en cours..." : "Envoyer ma demande"}
              </Button>
              <p className="text-center text-xs text-muted-foreground">
                Vos données sont confidentielles et ne seront jamais partagées.
              </p>
            </form>
          </div>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
