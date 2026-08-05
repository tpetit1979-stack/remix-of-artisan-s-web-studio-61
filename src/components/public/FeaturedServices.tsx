import { Link } from "@tanstack/react-router";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";
import { usePreviewTenantSearch } from "@/hooks/use-tenant";
import { ServiceMedia } from "@/components/public/ServiceMedia";
import { resolveEditorialTexts } from "@/lib/editorial-texts";
import type { Service, Tenant, SiteSettings } from "@/lib/tenant";

interface FeaturedServicesProps {
  services: Service[];
  tenant: Tenant;
  settings?: SiteSettings | null;
}

export function FeaturedServices({ services, tenant, settings }: FeaturedServicesProps) {
  const previewTenant = usePreviewTenantSearch();
  const { buttonLabel } = resolveEditorialTexts(settings?.cta_text ?? null);
  const featured = services.filter((s) => s.is_featured);
  const regular = services.filter((s) => !s.is_featured);
  const items = [...featured, ...regular].slice(0, 5);
  if (items.length === 0) return null;

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
              search={previewTenant}
              className={getGridClass(items.length, idx)}
            >
              <Card className="group h-full overflow-hidden border-border transition-all duration-200 hover:border-primary/30 hover:shadow-elegant lg:hover:shadow-md lg:hover:scale-[1.01]">
                <div className="relative overflow-hidden">
                  <ServiceMedia service={s} />
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
          <Link to="/contact" search={previewTenant}>
            <Button size="lg" className="h-12 px-8">
              {buttonLabel}
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function getGridClass(count: number, idx: number): string {
  if (count === 1) return "sm:col-span-2 lg:col-span-3";
  if (count === 2 && idx === 0) return "lg:col-span-2";
  if (count >= 3 && idx === 0) return "sm:col-span-2 lg:col-span-2 lg:row-span-2";
  return "";
}
