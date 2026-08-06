import { Link } from "@tanstack/react-router";
import { useTenant, usePreviewTenantSearch } from "@/hooks/use-tenant";
import { useQuery } from "@tanstack/react-query";
import { fetchServices, fetchPublicServiceAreas, fetchPortfolio } from "@/lib/tenant";
import { InstagramIcon, FacebookIcon, LinkedinIcon } from "@/components/public/SocialIcons";

/** Only platforms with a non-empty, agency-set URL — never a dead icon. */
function SocialLinks({ socialLinks }: { socialLinks: unknown }) {
  const links = (socialLinks ?? {}) as Record<string, string | undefined>;
  const items = [
    { key: "instagram", href: links.instagram, label: "Instagram", Icon: InstagramIcon },
    { key: "facebook", href: links.facebook, label: "Facebook", Icon: FacebookIcon },
    { key: "linkedin", href: links.linkedin, label: "LinkedIn", Icon: LinkedinIcon },
  ].filter((item) => !!item.href?.trim());

  if (items.length === 0) return null;

  return (
    <div className="flex items-center justify-center gap-3">
      {items.map(({ key, href, label, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={label}
          className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-primary hover:text-primary"
        >
          <Icon className="h-4 w-4" />
        </a>
      ))}
    </div>
  );
}

export function PublicFooter() {
  const { tenant, settings } = useTenant();
  const previewTenant = usePreviewTenantSearch();

  const { data: services = [] } = useQuery({
    queryKey: ["services", tenant?.id],
    queryFn: () => fetchServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: areas = [] } = useQuery({
    queryKey: ["service-areas", tenant?.id],
    queryFn: () => fetchPublicServiceAreas(tenant!.id),
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
                  search={previewTenant}
                  className="text-sm leading-relaxed text-muted-foreground hover:text-foreground"
                >
                  {s.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {uniqueCities.length > 0 && (
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Zones d'intervention</h3>
            <ul className="space-y-2">
              {uniqueCities.slice(0, 10).map((city) => {
                const area = areas.find((a) => a.city === city);
                const service = area ? services.find((s) => s.id === area.service_id) : null;
                if (!area || !service) return null;
                return (
                  <li key={city}>
                    <Link
                      to="/$slug"
                      params={{ slug: `${service.slug}-${area.city_slug}` }}
                      search={previewTenant}
                      className="text-sm leading-relaxed text-muted-foreground hover:text-foreground"
                    >
                      {city}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        <div>
          <h3 className="mb-3 text-sm font-semibold text-foreground">Navigation</h3>
          <ul className="space-y-1.5">
            <li>
              <Link to="/" search={previewTenant} className="text-sm leading-relaxed text-muted-foreground hover:text-foreground">Accueil</Link>
            </li>
            <li>
              <Link to="/services" search={previewTenant} className="text-sm leading-relaxed text-muted-foreground hover:text-foreground">Services</Link>
            </li>
            {hasPortfolio && (
              <li>
                <Link to="/realisations" search={previewTenant} className="text-sm leading-relaxed text-muted-foreground hover:text-foreground">Réalisations</Link>
              </li>
            )}
            <li>
              <Link to="/contact" search={previewTenant} className="text-sm leading-relaxed text-muted-foreground hover:text-foreground">Contact</Link>
            </li>
            <li>
              <Link to="/mentions-legales" search={previewTenant} className="text-sm leading-relaxed text-muted-foreground hover:text-foreground">Mentions légales</Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="mx-auto mt-8 max-w-7xl border-t border-border px-4 pt-6">
        <SocialLinks socialLinks={settings?.social_links} />
        <p className="mt-4 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} {tenant.company_name}. Tous droits réservés.
        </p>
      </div>
    </footer>
  );
}
