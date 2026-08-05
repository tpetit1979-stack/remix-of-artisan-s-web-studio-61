import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useMemo } from "react";
import { useAdminTenant } from "@/hooks/use-tenant";
import {
  fetchAllServices,
  fetchServiceAreas,
  fetchContacts,
  hasPublishedPortfolioItem,
  buildPublicSiteUrl,
} from "@/lib/tenant";
import { fetchTenantBrands } from "@/lib/brands";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Wrench, MapPin, Image, Tag, Search, ArrowRight, ExternalLink, Mail, CheckCircle2 } from "lucide-react";

export const Route = createFileRoute("/admin/")({
  component: AdminDashboard,
});

/**
 * The single "next best action" is a product judgment call, not a measured
 * fact -- order below is a hypothesis (see docs/product/execution-backlog.md,
 * Lot D) to revisit once real usage shows whether it matches what artisans
 * actually need first. Deliberately excludes logo and RGE: both are
 * agency-owned (see docs/product/objects/apparence.md and rge.md) and a
 * copilot never tells you to do something you have no button for.
 *
 * SEO links to /admin/settings, not a dedicated /admin/seo screen -- that
 * split is Lot F, not yet shipped. Update this link when it ships.
 *
 * Each action carries a one-line "reason" -- the consequence of leaving it
 * undone, not just the instruction. These are still static copy per branch,
 * not a generated explanation: honest about what this is today (see
 * docs/product/execution-backlog.md, Lot D). A real rules engine producing
 * {priority, title, reason, confidence, ...} is a fine idea once there are
 * more than five branches to keep straight -- premature with five.
 */
function useNextAction(input: {
  serviceCount: number;
  hasAreas: boolean;
  hasPortfolio: boolean;
  hasBrands: boolean;
  hasSeo: boolean;
}) {
  return useMemo(() => {
    if (input.serviceCount === 0) {
      return {
        label: "Ajoutez votre premier service",
        reason: "Sans service renseigné, les visiteurs ne voient aucune prestation sur votre site.",
        to: "/admin/services" as const,
        icon: Wrench,
      };
    }
    if (!input.hasAreas) {
      const plural = input.serviceCount > 1 ? "s" : "";
      return {
        label: "Renseignez vos zones d'intervention",
        reason: `Vous avez déjà ${input.serviceCount} service${plural} configuré${plural}, mais aucun n'est associé à une zone d'intervention — les visiteurs ne verront aucune ville apparaître sur Google.`,
        to: "/admin/service-areas" as const,
        icon: MapPin,
      };
    }
    if (!input.hasPortfolio) {
      return {
        label: "Ajoutez une réalisation récente",
        reason: "Aucune réalisation publiée pour l'instant — c'est souvent ce qui décide un visiteur à vous contacter.",
        to: "/admin/portfolio" as const,
        icon: Image,
      };
    }
    if (!input.hasBrands) {
      return {
        label: "Indiquez les marques avec lesquelles vous travaillez",
        reason: "Aucune marque renseignée — c'est un repère de confiance que vos visiteurs recherchent.",
        to: "/admin/brands" as const,
        icon: Tag,
      };
    }
    if (!input.hasSeo) {
      return {
        label: "Complétez votre référencement (titre et description)",
        reason: "Le titre et la description qui apparaissent dans les résultats Google ne sont pas renseignés.",
        to: "/admin/settings" as const,
        icon: Search,
      };
    }
    return null;
  }, [input.serviceCount, input.hasAreas, input.hasPortfolio, input.hasBrands, input.hasSeo]);
}

function AdminDashboard() {
  const { tenant, settings } = useAdminTenant();

  const { data: services = [] } = useQuery({
    queryKey: ["dashboard-services", tenant?.id],
    queryFn: () => fetchAllServices(tenant!.id),
    enabled: !!tenant?.id,
  });
  const { data: areas = [] } = useQuery({
    queryKey: ["dashboard-areas", tenant?.id],
    queryFn: () => fetchServiceAreas(tenant!.id),
    enabled: !!tenant?.id,
  });
  const { data: hasPortfolio = false } = useQuery({
    queryKey: ["dashboard-portfolio", tenant?.id],
    queryFn: () => hasPublishedPortfolioItem(tenant!.id),
    enabled: !!tenant?.id,
  });
  const { data: brands = [] } = useQuery({
    queryKey: ["dashboard-brands", tenant?.id],
    queryFn: () => fetchTenantBrands(tenant!.id),
    enabled: !!tenant?.id,
  });
  const { data: contacts = [] } = useQuery({
    queryKey: ["dashboard-contacts", tenant?.id],
    queryFn: () => fetchContacts(tenant!.id),
    enabled: !!tenant?.id,
  });

  const hasSeo = !!settings?.seo_meta_title && !!settings?.seo_meta_description;
  const nextAction = useNextAction({
    serviceCount: services.length,
    hasAreas: areas.length > 0,
    hasPortfolio,
    hasBrands: brands.length > 0,
    hasSeo,
  });

  const unreadCount = contacts.filter((c) => !c.is_read).length;
  const recentContacts = contacts.slice(0, 3);

  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Tableau de bord" description={tenant.company_name} />

      {/* 1. Que dois-je faire maintenant ? */}
      {nextAction ? (
        <Card className="border-primary/40 bg-primary/5">
          <CardContent className="py-5 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 shrink-0">
                <nextAction.icon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-xs font-medium text-primary uppercase tracking-wide">À faire ensuite</p>
                <p className="font-medium text-foreground">{nextAction.label}</p>
                <p className="text-sm text-muted-foreground mt-0.5">{nextAction.reason}</p>
              </div>
            </div>
            <Link to={nextAction.to}>
              <Button size="sm">
                Y aller
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-green-600/30 bg-green-50">
          <CardContent className="py-5 flex items-center gap-3">
            <CheckCircle2 className="h-5 w-5 text-green-700 shrink-0" />
            <p className="font-medium text-green-800">Votre site est à jour — rien à compléter pour le moment.</p>
          </CardContent>
        </Card>
      )}

      {/* 2. Ai-je reçu une nouvelle demande ? */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Mail className="h-4 w-4" />
            Dernières demandes
            {unreadCount > 0 && <Badge variant="default" className="text-xs">{unreadCount} non lue{unreadCount > 1 ? "s" : ""}</Badge>}
          </CardTitle>
          <Link to="/admin/contacts">
            <Button variant="ghost" size="sm">
              Tout voir
              <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {recentContacts.length === 0 ? (
            <p className="text-sm text-muted-foreground">Aucune demande reçue pour le moment.</p>
          ) : (
            <div className="space-y-2">
              {recentContacts.map((c) => (
                <div key={c.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span className="font-medium text-sm truncate">{c.name}</span>
                    {!c.is_read && <Badge variant="default" className="text-xs shrink-0">Nouveau</Badge>}
                  </div>
                  <span className="text-xs text-muted-foreground shrink-0">
                    {c.created_at ? new Date(c.created_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short" }) : ""}
                  </span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Accès rapide aux actions les plus courantes + au site public */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Link to="/admin/portfolio">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="py-4 flex items-center gap-3">
              <Image className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Ajouter une réalisation</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/admin/contacts">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="py-4 flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Voir les demandes</span>
            </CardContent>
          </Card>
        </Link>
        <a href={buildPublicSiteUrl(tenant)} target="_blank" rel="noopener noreferrer">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer h-full">
            <CardContent className="py-4 flex items-center gap-3">
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">Voir mon site</span>
            </CardContent>
          </Card>
        </a>
      </div>
    </div>
  );
}
