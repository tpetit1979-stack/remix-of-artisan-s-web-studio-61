import { useTenant } from "@/hooks/use-tenant";
import { useQuery } from "@tanstack/react-query";
import { fetchServices, fetchServiceAreas, fetchPortfolio } from "@/lib/tenant";
import { Briefcase, MapPin, Image, Calendar } from "lucide-react";

export function StatsCounter() {
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

  if (stats.length === 0) return null;

  return (
    <section className="relative -mt-8 z-10 px-4">
      <div className="mx-auto max-w-4xl">
        <div className="rounded-2xl border border-border bg-card p-8 shadow-xl shadow-foreground/5">
          <div
            className={`grid gap-8 ${
              stats.length === 4
                ? "grid-cols-2 lg:grid-cols-4"
                : stats.length === 3
                  ? "grid-cols-3"
                  : "grid-cols-2"
            }`}
          >
            {stats.map((stat, i) => (
              <div key={stat.label} className="flex flex-col items-center text-center">
                <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                  <stat.icon className="h-6 w-6 text-primary" />
                </div>
                <span className="text-3xl font-extrabold tracking-tight text-foreground">
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
