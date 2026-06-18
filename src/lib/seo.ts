import type { Tenant, Service, SiteSettings } from "./tenant";

/**
 * Generate dynamic SEO title for a service+city page.
 * Uses the service's custom template if available, otherwise builds one.
 */
export function generateSeoTitle(
  service: Service,
  city: string,
  tenant: Tenant,
): string {
  if (service.seo_title_template) {
    return service.seo_title_template
      .replace("{service}", service.name)
      .replace("{city}", city)
      .replace("{company}", tenant.company_name);
  }
  return `${service.name} à ${city} — ${tenant.company_name}`;
}

/**
 * Generate dynamic SEO description for a service+city page.
 * Uses the service's custom template, then enriches with seo_boost_text.
 */
export function generateSeoDescription(
  service: Service,
  city: string,
  tenant: Tenant,
): string {
  if (service.seo_description_template) {
    return service.seo_description_template
      .replace("{service}", service.name)
      .replace("{city}", city)
      .replace("{company}", tenant.company_name);
  }
  const base = `${tenant.company_name}, votre expert en ${service.name.toLowerCase()} à ${city}.`;
  const boost = tenant.seo_boost_text ? ` ${tenant.seo_boost_text}` : "";
  const cta = " Demandez votre devis gratuit.";
  return `${base}${boost}${cta}`.slice(0, 160);
}

/**
 * Generate dynamic H1 for a service+city page.
 */
export function generateH1(
  service: Service,
  city: string,
  tenant: Tenant,
): string {
  return `${service.name} à ${city}`;
}

/**
 * Generate introductory paragraph, differentiated per service+city+tenant.
 */
export function generateIntroText(
  service: Service,
  city: string,
  tenant: Tenant,
): string {
  const lines: string[] = [];
  lines.push(
    `Vous recherchez un professionnel en ${service.name.toLowerCase()} à ${city} ? ${tenant.company_name} intervient rapidement dans votre secteur.`,
  );
  if (service.description) {
    lines.push(service.description);
  }
  if (tenant.seo_boost_text) {
    lines.push(tenant.seo_boost_text);
  }
  return lines.join(" ");
}

/**
 * Generate JSON-LD LocalBusiness + Service structured data.
 */
export function generateJsonLd(
  service: Service,
  city: string,
  tenant: Tenant,
  settings: SiteSettings | null,
  url: string,
) {
  const localBusiness: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenant.company_name,
    url,
    ...(tenant.phone && { telephone: tenant.phone }),
    ...(tenant.email && { email: tenant.email }),
    ...(settings?.logo_url && { image: settings.logo_url }),
    address: {
      "@type": "PostalAddress",
      addressLocality: city,
      ...(tenant.address && { streetAddress: tenant.address }),
      addressCountry: "FR",
    },
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: `Services de ${tenant.company_name}`,
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: service.name,
            ...(service.description && { description: service.description }),
            areaServed: {
              "@type": "City",
              name: city,
            },
          },
        },
      ],
    },
  };

  return localBusiness;
}
