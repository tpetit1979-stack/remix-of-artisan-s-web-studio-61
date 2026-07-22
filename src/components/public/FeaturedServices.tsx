import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Star,
  Wrench,
  Flame,
  Droplets,
  Zap,
  Wind,
  Sun,
  Hammer,
  Paintbrush,
} from "lucide-react";
import { useResolvedMedia } from "@/lib/media-resolver";
import { useTenant } from "@/hooks/use-tenant";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { Service, Tenant, SiteSettings } from "@/lib/tenant";

interface FeaturedServicesProps {
  services: Service[];
  tenant: Tenant;
  settings?: SiteSettings | null;
}

const TRADE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  "poeles-cheminees": Flame,
  ramoneur: Flame,
  chauffagiste: Flame,
  plombier: Droplets,
  plomberie: Droplets,
  electricien: Zap,
  electricite: Zap,
  climatisation: Wind,
  cvc: Wind,
  ventilation: Wind,
  frigoriste: Wind,
  photovoltaique: Sun,
  energeticien: Sun,
  couverture: Hammer,
  maconnerie: Hammer,
  charpente: Hammer,
  carrelage: Hammer,
  "menuiserie-agencement": Wrench,
  peinture: Paintbrush,
  peintre: Paintbrush,
  serrurerie: Wrench,
  "serrurerie-metallerie": Wrench,
  pisciniste: Droplets,
  paysagiste: Sun,
};

function getTradeIcon(slug: string | null | undefined) {
  if (!slug) return Wrench;
  return TRADE_ICONS[slug] ?? Wrench;
}

export function FeaturedServices({ services, tenant, settings }: FeaturedServicesProps) {
  const { data: tradeSlug } = useQuery({
    queryKey: ["trade-slug", tenant.trade_template_id],
    queryFn: async () => {
      if (!tenant.trade_template_id) return null;
      const { data } = await supabase
        .from("trade_templates")
        .select("slug")
        .eq("id", tenant.trade_template_id)
        .maybeSingle();
      return data?.slug ?? null;
    },
    enabled: !!tenant.trade_template_id,
    staleTime: 1000 * 60 * 30,
  });

  const featured = services.filter((s) => s.is_featured);
  const displayServices = featured.length > 0 ? featured : services;
  if (displayServices.length === 0) return null;

  const items = displayServices.slice(0, 5);
  const featuredIndex = items.findIndex((s) => s.is_featured);

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold text-foreground sm:text-4xl">Nos services</h2>
          <p className="mt-4 text-muted-foreground">
            {tenant.company_name} vous propose des services professionnels adaptés à vos besoins.
          </p>
        </div>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((s, idx) => (
            <Link
              key={s.id}
              to="/services/$serviceSlug"
              params={{ serviceSlug: s.slug }}
              className={getGridClass(items.length, idx)}
            >
              <Card className="group h-full overflow-hidden border-border transition-all hover:border-primary/30 hover:shadow-elegant lg:hover:shadow-md lg:hover:scale-[1.01] transition-transform duration-200">
                <div className="relative overflow-hidden">
                  <ServiceMedia service={s} tradeSlug={tradeSlug} />
                  <div className="absolute inset-0 bg-gradient-to-t from-foreground/20 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
                  {featuredIndex !== -1 && idx === featuredIndex && (
                    <span className="absolute left-3 top-3 inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-xs font-semibold text-primary-foreground shadow-sm">
                      <Star className="h-3 w-3 fill-current" />
                      Service phare
                    </span>
                  )}
                </div>
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                    {s.name}
                  </h3>
                  {s.description && (
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground line-clamp-3">
                      {s.description}
                    </p>
                  )}
                  <span className="mt-4 inline-flex items-center text-sm font-semibold text-primary">
                    En savoir plus <ArrowRight className="ml-1.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link to="/contact">
            <Button size="lg" className="h-12 px-8">
              {settings?.cta_text ?? "Demander un devis"}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function ServiceMedia({ service, tradeSlug }: { service: Service; tradeSlug: string | null | undefined }) {
  const { tenant } = useTenant();
  const resolved = useResolvedMedia({
    tenantId: tenant?.id ?? null,
    tradeTemplateId: tenant?.trade_template_id ?? null,
    category: "service",
    targetId: service.id,
    altFallback: service.name,
  });

  const Icon = getTradeIcon(tradeSlug);

  if (resolved.source === "placeholder") {
    return (
      <div className="aspect-[16/10] w-full bg-gradient-to-br from-primary/15 via-primary/5 to-primary/10 flex items-center justify-center">
        <Icon className="h-12 w-12 text-primary/50 transition-transform duration-500 group-hover:scale-110" />
      </div>
    );
  }

  return (
    <img
      src={resolved.url}
      alt={resolved.alt}
      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
      decoding="async"
    />
  );
}

function getGridClass(count: number, idx: number): string {
  if (count === 1) return "sm:col-span-2 lg:col-span-3";
  if (count === 2 && idx === 0) return "lg:col-span-2";
  if (count >= 3 && idx === 0) return "sm:col-span-2 lg:col-span-2 lg:row-span-2";
  return "";
}
