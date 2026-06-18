import { Link } from "@tanstack/react-router";
import { useTenant } from "@/hooks/use-tenant";
import { useQuery } from "@tanstack/react-query";
import { fetchServices, fetchServiceAreas, fetchPortfolio } from "@/lib/tenant";

export function PublicFooter() {
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

  const hasPortfolio = portfolio.some((p) => p.is_published);

  // Unique cities for footer links
  const uniqueCities = Array.from(new Set(areas.map((a) => a.city)));

  return (
    <footer className="border-t border-border bg-muted/30 py-12">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">{tenant.company_name}</h3>
          {tenant.address && <p className="text-sm text-muted-foreground">{tenant.address}</p>}
          {tenant.city && <p className="text-sm text-muted-foreground">{tenant.city}</p>}
          {tenant.phone && (
            <a href={`tel:${tenant.phone}`} className="mt-2 block text-sm text-foreground hover:underline">
              {tenant.phone}
            </a>
          )}
          {tenant.email && (
            <a href={`mailto:${tenant.email}`} className="block text-sm text-muted-foreground hover:underline">
              {tenant.email}
            </a>
          )}
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Services</h3>
          <ul className="space-y-1.5">
            {services.slice(0, 8).map((s) => (
              <li key={s.id}>
                <Link
                  to="/services/$serviceSlug"
                  params={{ serviceSlug: s.slug }}
                  className="text-sm text-muted-foreground hover:text-foreground"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Zones d'intervention</h3>
          <ul className="space-y-1.5">
            {uniqueCities.slice(0, 10).map((city) => {
              const area = areas.find((a) => a.city === city);
              const service = area ? services.find((s) => s.id === area.service_id) : null;
              if (!area || !service) return null;
              return (
                <li key={city}>
                  <Link
                    to="/$slug"
                    params={{ slug: `${service.slug}-${area.city_slug}` }}
                    className="text-sm text-muted-foreground hover:text-foreground"
                  >
                    {city}
                  </Link>
                </li>
              );
            })}
          </ul>
        </div>

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Navigation</h3>
          <ul className="space-y-1.5">
            <li>
              <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">Accueil</Link>
            </li>
            <li>
              <Link to="/services" className="text-sm text-muted-foreground hover:text-foreground">Services</Link>
            </li>
            <li>
              <Link to="/realisations" className="text-sm text-muted-foreground hover:text-foreground">Réalisations</Link>
            </li>
            <li>
              <Link to="/contact" className="text-sm text-muted-foreground hover:text-foreground">Contact</Link>
            </li>
            <li>
              <Link to="/mentions-legales" className="text-sm text-muted-foreground hover:text-foreground">Mentions légales</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-border px-4 pt-6">
        <p className="text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {tenant.company_name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
