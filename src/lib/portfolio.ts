/**
 * Central definition of "authentic public réalisation" — a portfolio item
 * that may be shown as proof of real work: published AND not a catalog
 * illustration. Every public surface (homepage, header, footer, /realisations,
 * Service page, stats counters) must use this same predicate, never a bespoke
 * `is_published`-only check — that's precisely the gap this lot closes.
 */
export function isAuthenticPublicPortfolioItem(item: {
  is_published: boolean | null;
  content_kind: string;
}): boolean {
  return !!item.is_published && item.content_kind === "real_project";
}

/**
 * A réalisation counts as local proof for a Service×Ville page only when it
 * matches BOTH the service and the city — matching either alone previously
 * let a proof from another city/service leak onto the wrong local page.
 */
export function matchesServiceAndCity(
  item: { service_id: string | null; city: string | null },
  serviceId: string,
  city: string,
): boolean {
  return item.service_id === serviceId && item.city === city;
}
