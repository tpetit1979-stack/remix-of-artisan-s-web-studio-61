import type { PublicTenant, PublicService, PublicServiceArea, PublicSiteSettings } from "./tenant";
import { resolveCommercialPromises } from "./commercial-promises";

/**
 * Generate dynamic SEO title for a service+city page.
 * Uses the service's custom template if available, otherwise builds one.
 */
export function generateSeoTitle(
  service: PublicService,
  city: string,
  tenant: PublicTenant,
): string {
  if (service.seo_title_template) {
    return service.seo_title_template
      .replace(/\{\{city\}\}/g, city)
      .replace(/\{\{company_name\}\}/g, tenant.company_name)
      .replace("{service}", service.name)
      .replace("{city}", city)
      .replace("{company}", tenant.company_name);
  }
  return `${service.name} à ${city} — ${tenant.company_name}`;
}

/**
 * Generate dynamic SEO description for a service+city page.
 * Uses the service's custom template, then enriches with seo_boost_text.
 * The closing CTA line only asserts "devis gratuit" when the tenant has
 * confirmed it (settings.quote_is_free === true) — see commercial-promises.ts.
 */
export function generateSeoDescription(
  service: PublicService,
  city: string,
  tenant: PublicTenant,
  settings: PublicSiteSettings | null,
): string {
  if (service.seo_description_template) {
    return service.seo_description_template
      .replace(/\{\{city\}\}/g, city)
      .replace(/\{\{company_name\}\}/g, tenant.company_name)
      .replace("{service}", service.name)
      .replace("{city}", city)
      .replace("{company}", tenant.company_name);
  }
  const base = `${tenant.company_name}, votre expert en ${service.name.toLowerCase()} à ${city}.`;
  const boost = tenant.seo_boost_text ? ` ${tenant.seo_boost_text}` : "";
  const { seoCtaSuffix } = resolveCommercialPromises({
    quoteIsFree: settings?.quote_is_free ?? null,
    quoteResponseDelayHours: settings?.quote_response_delay_hours ?? null,
    emergencyServiceAvailable: settings?.emergency_service_available ?? null,
    ctaText: settings?.cta_text ?? null,
  });
  const cta = seoCtaSuffix ? ` ${seoCtaSuffix}` : "";
  return `${base}${boost}${cta}`.slice(0, 160);
}

/**
 * Generate dynamic H1 for a service+city page.
 */
export function generateH1(service: PublicService, city: string, tenant: PublicTenant): string {
  return `${service.name} à ${city}`;
}

/**
 * Generate introductory paragraph, differentiated per service+city+tenant.
 */
export function generateIntroText(
  service: PublicService,
  city: string,
  tenant: PublicTenant,
): string {
  const lines: string[] = [];
  lines.push(
    `Vous recherchez un professionnel pour ${service.name.toLowerCase()} à ${city} ? ${tenant.company_name} intervient dans votre secteur.`,
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
 * Generate JSON-LD LocalBusiness + PublicService structured data.
 */
export function generateJsonLd(
  service: PublicService,
  city: string,
  tenant: PublicTenant,
  settings: PublicSiteSettings | null,
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
            "@type": "PublicService",
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

/**
 * Generate a standalone PublicService JSON-LD (schema.org) for a service+city page,
 * distinct from the LocalBusiness+Offer blob above — a dedicated PublicService
 * entity with its provider and every city it's offered in.
 */
export function generateServiceJsonLd(
  service: PublicService,
  tenant: PublicTenant,
  areas: PublicServiceArea[],
) {
  const areaServed = Array.from(
    new Set(areas.filter((a) => a.service_id === service.id).map((a) => a.city)),
  );

  return {
    "@context": "https://schema.org",
    "@type": "PublicService",
    name: service.name,
    provider: {
      "@type": "LocalBusiness",
      name: tenant.company_name,
      ...(tenant.phone && { telephone: tenant.phone }),
    },
    ...(areaServed.length > 0 && { areaServed }),
    ...(service.description && { description: service.description }),
  };
}

/**
 * Build the <title> for a page. Homepage uses the tenant's configured SEO
 * title (falling back to company name); other pages append a suffix.
 */
export function buildPageTitle(
  settings: PublicSiteSettings | null,
  tenant: PublicTenant,
  pageSuffix?: string,
): string {
  if (pageSuffix) return `${pageSuffix} | ${tenant.company_name}`;
  return (
    settings?.seo_meta_title || `${tenant.company_name}${tenant.city ? ` — ${tenant.city}` : ""}`
  );
}

/**
 * Build the meta description for a page, falling back to the tagline
 * then a generic sentence built from tenant data.
 */
export function buildPageDescription(
  settings: PublicSiteSettings | null,
  tenant: PublicTenant,
): string {
  return (
    settings?.seo_meta_description ||
    tenant.tagline ||
    `${tenant.company_name}, votre expert de confiance${tenant.city ? ` à ${tenant.city}` : ""}.`
  );
}

const FR_DAY_TO_SCHEMA: Record<string, string> = {
  lundi: "Mo",
  mardi: "Tu",
  mercredi: "We",
  jeudi: "Th",
  vendredi: "Fr",
  samedi: "Sa",
  dimanche: "Su",
};

/**
 * Parse a single free-text time range like "9h-12h" or "9h30-18h" into
 * "09:00-12:00". Returns null on anything that doesn't match — callers
 * should skip the entry rather than let a malformed value break the JSON-LD.
 */
function parseOpeningHoursRange(range: string): string | null {
  const match = range.trim().match(/^(\d{1,2})h(\d{2})?\s*-\s*(\d{1,2})h(\d{2})?$/i);
  if (!match) return null;
  const [, h1, m1, h2, m2] = match;
  const pad = (n: string) => n.padStart(2, "0");
  return `${pad(h1)}:${pad(m1 ?? "00")}-${pad(h2)}:${pad(m2 ?? "00")}`;
}

/**
 * Convert the site_settings.opening_hours jsonb (French day names, free-text
 * ranges, e.g. `{ lundi: "9h-12h, 14h-18h", samedi: "Fermé" }`) into
 * schema.org-style `openingHours` strings (e.g. "Mo 09:00-12:00,14:00-18:00").
 * Unparseable or closed days are silently skipped — never throws.
 */
export function buildOpeningHoursSchema(
  oh: Record<string, string | null | undefined> | null | undefined,
): string[] {
  if (!oh) return [];
  const lines: string[] = [];
  for (const [frDay, value] of Object.entries(oh)) {
    const dayCode = FR_DAY_TO_SCHEMA[frDay.trim().toLowerCase()];
    if (!dayCode || !value) continue;
    const ranges = value
      .split(",")
      .map((r) => parseOpeningHoursRange(r))
      .filter((r): r is string => !!r);
    if (ranges.length === 0) continue;
    lines.push(`${dayCode} ${ranges.join(",")}`);
  }
  return lines;
}

type CertificationLike = {
  certification_name: string;
  organisme?: string | null;
};

/**
 * Build the sitewide LocalBusiness JSON-LD (home page, richer than the
 * per-service+city variant above): opening hours, areas served, known
 * services and RGE-style credentials.
 */
export function buildSiteJsonLd(
  tenant: PublicTenant,
  settings: PublicSiteSettings | null,
  services: PublicService[],
  areas: PublicServiceArea[],
  certifications: CertificationLike[],
  baseUrl: string,
) {
  const openingHours = buildOpeningHoursSchema(
    (settings as { opening_hours?: Record<string, string | null> | null } | null)?.opening_hours,
  );
  const uniqueCities = Array.from(new Set(areas.map((a) => a.city)));

  const data: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: tenant.company_name,
    url: baseUrl,
    ...(settings?.logo_url && { logo: settings.logo_url, image: settings.logo_url }),
    ...(tenant.phone && { telephone: tenant.phone }),
    ...(tenant.email && { email: tenant.email }),
    ...(openingHours.length > 0 && { openingHours }),
  };

  if (tenant.address || tenant.city) {
    data.address = {
      "@type": "PostalAddress",
      ...(tenant.address && { streetAddress: tenant.address }),
      ...(tenant.city && { addressLocality: tenant.city }),
      addressCountry: "FR",
    };
  }

  if (uniqueCities.length > 0) {
    data.areaServed = uniqueCities.map((city) => ({ "@type": "City", name: city }));
  }

  if (services.length > 0) {
    data.knowsAbout = services.map((s) => s.name);
  }

  if (certifications.length > 0) {
    data.hasCredential = certifications.map((c) => ({
      "@type": "EducationalOccupationalCredential",
      name: c.certification_name,
      ...(c.organisme && { credentialCategory: c.organisme }),
    }));
  }

  return data;
}

/**
 * Build a minimal sitemap.xml body covering the static pages, every active
 * service, and every service+city page.
 */
export function buildSitemapXml(
  services: PublicService[],
  areas: PublicServiceArea[],
  hasPortfolio: boolean,
  baseUrl: string,
): string {
  const paths: string[] = ["", "/services", "/contact"];
  if (hasPortfolio) paths.push("/realisations");
  services.forEach((s) => paths.push(`/services/${s.slug}`));
  areas.forEach((a) => {
    const service = services.find((s) => s.id === a.service_id);
    if (service) paths.push(`/${service.slug}-${a.city_slug}`);
  });

  return buildSitemapXmlFromPaths(paths, baseUrl);
}

/**
 * Rendu XML d'une liste de chemins. Extrait de `buildSitemapXml` pour que le
 * sitemap de l'hôte SUPORDO passe par le même rendu que celui d'un tenant :
 * un seul format, un seul endroit à corriger.
 *
 * Sans ça, l'hôte SUPORDO servait le sitemap « d'un tenant vide » — donc
 * `/services` et `/contact`, deux chemins qui n'existent pas sur supordo.com.
 */
export function buildSitemapXmlFromPaths(paths: readonly string[], baseUrl: string): string {
  const urlEntries = paths
    .map((path) => `  <url><loc>${baseUrl}${path === "/" ? "" : path}</loc></url>`)
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlEntries}\n</urlset>\n`;
}

/**
 * En-tête d'une page marketing SUPORDO : titre, description, OpenGraph et
 * canonique, au format attendu par `head()` de TanStack Router.
 *
 * Le canonique n'est émis que lorsque l'origine officielle est connue —
 * c'est-à-dire sur l'hôte de la plateforme. Sur un hôte de prévisualisation,
 * annoncer une URL canonique reviendrait à désigner une page de production
 * qui n'a pas encore le même contenu.
 *
 * Capacité technique, pas promesse : ces balises rendent la page correctement
 * indexable. Elles ne garantissent aucun positionnement, et rien dans la copy
 * du site ne doit le laisser entendre.
 */
export function buildMarketingHead(input: {
  title: string;
  description: string;
  path: string;
  canonicalOrigin: string | null;
}) {
  const meta = [
    { title: input.title },
    { name: "description", content: input.description },
    { property: "og:title", content: input.title },
    { property: "og:description", content: input.description },
    { property: "og:type", content: "website" },
  ];
  if (!input.canonicalOrigin) return { meta };
  const href = `${input.canonicalOrigin}${input.path === "/" ? "" : input.path}`;
  return {
    meta: [...meta, { property: "og:url", content: href }],
    links: [{ rel: "canonical", href }],
  };
}

/** Build robots.txt pointing crawlers at the sitemap. */
export function buildRobotsTxt(baseUrl: string): string {
  return `User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap.xml\n`;
}

/**
 * Build llms.txt — a plain-language summary of the tenant for LLM crawlers,
 * covering services, coverage area, certifications and contact details.
 */
export function buildLlmsTxt(
  tenant: PublicTenant,
  settings: PublicSiteSettings | null,
  services: PublicService[],
  areas: PublicServiceArea[],
  certifications: CertificationLike[],
): string {
  const lines: string[] = [`# ${tenant.company_name}`];

  if (tenant.tagline) lines.push("", `> ${tenant.tagline}`);
  lines.push("", buildPageDescription(settings, tenant));

  if (services.length > 0) {
    lines.push("", "## Services");
    services.forEach((s) => lines.push(`- ${s.name}${s.description ? `: ${s.description}` : ""}`));
  }

  const cities = Array.from(new Set(areas.map((a) => a.city)));
  if (cities.length > 0) {
    lines.push("", "## Zones d'intervention", cities.join(", "));
  }

  if (certifications.length > 0) {
    lines.push("", "## Certifications");
    certifications.forEach((c) => lines.push(`- ${c.certification_name}`));
  }

  if (tenant.phone || tenant.email) {
    lines.push("", "## Contact");
    if (tenant.phone) lines.push(`Téléphone : ${tenant.phone}`);
    if (tenant.email) lines.push(`Email : ${tenant.email}`);
  }

  return lines.join("\n") + "\n";
}
