import { useTenant } from "@/hooks/use-tenant";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { fetchPortfolio, fetchPublicServiceAreas } from "@/lib/tenant";
import { isAuthenticPublicPortfolioItem } from "@/lib/portfolio";
import { Hammer, Calendar, MapPin, ShieldCheck } from "lucide-react";

/**
 * Data-driven social proof section.
 * Replaces generic "why choose us" arguments with real metrics
 * computed from the tenant's actual data.
 *
 * Stats sources (all live, zero manual input from the artisan):
 * - Chantiers: COUNT(portfolio WHERE is_published)
 * - Années: tenants.years_experience
 * - Villes: COUNT(DISTINCT city FROM service_areas)
 * - Certifs RGE: COUNT(tenant_certifications WHERE is_active)
 *
 * Component hides itself if there is nothing meaningful to show
 * (no portfolio + no years + no cities + no certs). It also
 * gracefully degrades to whatever subset is available.
 */
export function WhyChooseUs() {
  const { tenant } = useTenant();

  const { data: portfolio = [] } = useQuery({
    queryKey: ["portfolio", tenant?.id],
    queryFn: () => fetchPortfolio(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["service-areas", tenant?.id],
    queryFn: () => fetchPublicServiceAreas(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: certCount = 0 } = useQuery({
    queryKey: ["certifications-count", tenant?.id],
    queryFn: async () => {
      const { count } = await supabase
        .from("tenant_certifications")
        .select("id", { count: "exact", head: true })
        .eq("tenant_id", tenant!.id)
        .eq("is_active", true);
      return count ?? 0;
    },
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 10,
  });

  if (!tenant) return null;

  const publishedCount = portfolio.filter(isAuthenticPublicPortfolioItem).length;
  const cityCount = new Set(areas.map((a) => a.city)).size;
  const hasYears = typeof tenant.years_experience === "number" && tenant.years_experience > 0;

  // Count REAL signals only (years_experience excluded — it's a fallback).
  // The years line is shown only when at least one real stat is present,
  // so it never appears alone on a giant empty section.
  const realSignalCount =
    (publishedCount > 0 ? 1 : 0) +
    (cityCount > 0 ? 1 : 0) +
    (certCount > 0 ? 1 : 0) +
    (hasYears ? 1 : 0);

  // Hard rule: at least 2 meaningful chiffres required to render the section.
  // A single number floating in whitespace looks worse than no section.
  if (realSignalCount < 2) return null;

  const years = tenant.years_experience ?? 0;

  const stats = [
    publishedCount > 0
      ? { icon: Hammer, value: `${publishedCount}`, label: publishedCount > 1 ? "Chantiers réalisés" : "Chantier réalisé" }
      : null,
    hasYears
      ? { icon: Calendar, value: `${years}+`, label: years > 1 ? "Ans d'expérience" : "An d'expérience" }
      : null,
    cityCount > 0
      ? { icon: MapPin, value: `${cityCount}`, label: cityCount > 1 ? "Villes desservies" : "Ville desservie" }
      : null,
    certCount > 0
      ? { icon: ShieldCheck, value: `${certCount}`, label: certCount > 1 ? "Certifications RGE" : "Certification RGE" }
      : null,
  ].filter(Boolean) as { icon: typeof Hammer; value: string; label: string }[];

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            La preuve par les chiffres
          </span>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            {tenant.company_name} en quelques chiffres
          </h2>
          <p className="mt-4 text-muted-foreground">
            Des données réelles, pas des promesses.
          </p>
        </div>

        <div
          className={`mx-auto mt-12 grid max-w-5xl gap-6 ${
            stats.length === 4
              ? "grid-cols-2 lg:grid-cols-4"
              : stats.length === 3
                ? "grid-cols-1 sm:grid-cols-3"
                : stats.length === 2
                  ? "grid-cols-1 sm:grid-cols-2"
                  : "grid-cols-1"
          }`}
        >
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="group flex flex-col items-center rounded-2xl border border-border bg-card p-8 text-center transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <div className="mb-4 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 transition-colors group-hover:bg-primary/15">
                <stat.icon className="h-7 w-7 text-primary" />
              </div>
              <span className="text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl">
                {stat.value}
              </span>
              <span className="mt-2 text-sm font-medium text-muted-foreground">
                {stat.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
