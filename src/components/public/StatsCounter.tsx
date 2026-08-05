import { useTenant } from "@/hooks/use-tenant";
import { useQuery } from "@tanstack/react-query";
import { fetchServices, fetchServiceAreas, fetchPortfolio } from "@/lib/tenant";
import { Briefcase, MapPin, Image, Calendar } from "lucide-react";

interface StatsCounterProps {
  variant?: "card" | "hero-band";
}

export function StatsCounter({ variant = "card" }: StatsCounterProps) {
  const { tenant } = useTenant();

  const { data: services = [] } = useQuery({
    queryKey: ["services", tenant?.id],
    queryFn: () => fetchServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["service-areas", tenant?.id],
    queryFn: () => fetchServiceAreas(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: portfolio = [] } = useQuery({
    queryKey: ["portfolio", tenant?.id],
    queryFn: () => fetchPortfolio(tenant!.id),
    enabled: !!tenant?.id,
  });

  if (!tenant) return null;

  const uniqueCities = new Set(areas.map((a) => a.city)).size;
  const publishedCount = portfolio.filter((p) => p.is_published).length;

  // Google rating/reviews are shown only as the Hero badge (HeroSection.tsx)
  // — never here too, to avoid the same figure appearing twice on one page.
  const stats = [
    tenant.years_experience
      ? { icon: Calendar, value: `${tenant.years_experience}+`, label: "Ans d'expérience" }
      : null,
    services.length > 0
      ? { icon: Briefcase, value: `${services.length}`, label: "Services" }
      : null,
    uniqueCities > 0
      ? { icon: MapPin, value: `${uniqueCities}`, label: "Villes desservies" }
      : null,
    publishedCount > 0
      ? { icon: Image, value: `${publishedCount}`, label: "Réalisations" }
      : null,
  ].filter(Boolean) as { icon: typeof Calendar; value: string; label: string }[];

  // Visibility guard: the filtered stats array is the source of truth — years
  // and services aren't the only real signals (cities, portfolio count too).
  if (stats.length === 0) return null;

  const gridClass =
    stats.length === 4
      ? "grid-cols-2 lg:grid-cols-4"
      : stats.length === 3
        ? "grid-cols-3"
        : stats.length === 2
          ? "grid-cols-2"
          : "grid-cols-1";

  if (variant === "hero-band") {
    return (
      <div className="relative w-full border-t border-white/10 bg-black/20 py-2 text-white backdrop-blur-sm">
        <div className="mx-auto max-w-5xl px-4">
          <div className={`grid gap-6 ${gridClass}`}>
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center text-white">
                <stat.icon className="mb-1 h-5 w-5 text-white/80" />
                <span className="text-3xl font-extrabold tracking-tight sm:text-4xl">
                  {stat.value}
                </span>
                <span className="mt-0.5 text-xs font-medium uppercase tracking-wider text-white/75 sm:text-sm">
                  {stat.label}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <section className="relative -mt-8 z-10 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-foreground/5">
          <div className={`grid gap-8 ${gridClass}`}>
            {stats.map((stat) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-4xl font-extrabold tracking-tight text-foreground">
                  {stat.value}
                </span>
                <span className="mt-1 text-sm font-medium text-muted-foreground">{stat.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
