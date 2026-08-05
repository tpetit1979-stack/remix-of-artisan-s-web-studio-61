import type { Tenant, Service, SiteSettings } from "@/lib/tenant";
import { resolveCommercialPromises } from "@/lib/commercial-promises";

interface SeoLongTextProps {
  tenant: Tenant;
  services: Service[];
  cities: string[];
  settings?: SiteSettings | null;
}

function toSentence(items: string[]): string {
  if (items.length === 0) return "";
  if (items.length === 1) return items[0];
  return `${items.slice(0, -1).join(", ")} et ${items[items.length - 1]}`;
}

function generateEditorial(
  tenant: Tenant,
  services: Service[],
  cities: string[],
  settings: SiteSettings | null | undefined,
): string {
  const company = tenant.company_name ?? "Notre entreprise";
  const city = tenant.city ?? "votre région";
  const years = tenant.years_experience;
  const serviceNames = services.map((s) => s.name).filter(Boolean);
  const cityNames = cities.filter(Boolean);

  const paragraphs: string[] = [];

  const p1Parts: string[] = [
    `${company} est votre entreprise de référence à ${city}${cityNames.length > 1 ? ` et dans les communes environnantes` : ""}.`,
  ];

  if (serviceNames.length > 0) {
    p1Parts.push(
      `Nous mettons notre savoir-faire au service de vos projets de ${toSentence(serviceNames)}.`
    );
  }

  p1Parts.push(
    "Chaque intervention est réalisée dans les règles de l'art, avec du matériel professionnel et un respect strict des normes en vigueur."
  );
  paragraphs.push(p1Parts.join(" "));

  const p2Parts: string[] = [];
  if (years && years > 0) {
    p2Parts.push(
      `Forts de ${years} ans d'expérience, nous accompagnons particuliers et professionnels depuis la conception jusqu'à la réalisation finale.`
    );
  } else {
    p2Parts.push(
      "Nous accompagnons particuliers et professionnels depuis la conception jusqu'à la réalisation finale."
    );
  }

  if (cityNames.length > 0) {
    p2Parts.push(
      `Nous intervenons notamment à ${toSentence(cityNames.slice(0, 8))}.`
    );
  }

  const { seoCtaSuffix } = resolveCommercialPromises({
    quoteIsFree: settings?.quote_is_free ?? null,
    quoteResponseDelayHours: settings?.quote_response_delay_hours ?? null,
    emergencyServiceAvailable: settings?.emergency_service_available ?? null,
    ctaText: settings?.cta_text ?? null,
  });
  p2Parts.push(
    `Demandez un devis personnalisé.${seoCtaSuffix ? ` ${seoCtaSuffix}` : ""}`
  );
  paragraphs.push(p2Parts.join(" "));

  return paragraphs.join("\n\n");
}

export function SeoLongText({ tenant, services, cities, settings }: SeoLongTextProps) {
  const rawText = tenant.seo_boost_text;
  const hasCustomText = typeof rawText === "string" && rawText.trim().length > 0;
  const text = hasCustomText ? rawText.trim() : generateEditorial(tenant, services, cities, settings);

  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);

  if (paragraphs.length === 0) return null;

  return (
    <section className="border-t border-border bg-muted/20 py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="space-y-5 text-base leading-relaxed text-muted-foreground">
          {paragraphs.map((paragraph, idx) => (
            <p key={idx}>{paragraph}</p>
          ))}
        </div>
      </div>
    </section>
  );
}
