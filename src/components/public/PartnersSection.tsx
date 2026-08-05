import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import { fetchActivePartners, type Partner } from "@/lib/partners";

export function PartnersSection() {
  const { tenant } = useTenant();

  const { data: partners = [] } = useQuery({
    queryKey: ["public-partners", tenant?.id],
    queryFn: () => fetchActivePartners(tenant!.id),
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 10,
  });

  if (partners.length === 0) return null;

  const useMarquee = partners.length > 6;

  return (
    <section className="border-t border-border bg-muted/20 py-12 lg:py-16">
      <div className="mx-auto max-w-7xl px-4">
        <p className="text-center text-xs font-semibold uppercase tracking-widest text-muted-foreground">
          Ils nous font confiance
        </p>

        {useMarquee ? (
          <div className="mt-8 overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
            <div className="flex w-max animate-partners-marquee gap-12">
              {[...partners, ...partners].map((p, i) => (
                <PartnerItem key={`${p.id}-${i}`} partner={p} />
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-8 flex flex-wrap items-center justify-center gap-x-12 gap-y-8">
            {partners.map((p) => (
              <PartnerItem key={p.id} partner={p} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function PartnerItem({ partner }: { partner: Partner }) {
  // Neutral plate behind every logo, not just the CSS filter fix — a source
  // file that's genuinely white/transparent (drawn for a dark background)
  // would still vanish against the section's own background otherwise. The
  // border gives the logo's footprint a visible edge even in that case.
  const content = partner.logo_url ? (
    <div className="flex h-16 w-36 items-center justify-center rounded-lg border border-border bg-card px-4 py-2.5 shadow-sm transition duration-300 hover:shadow-md sm:h-[4.5rem] sm:w-40">
      <img
        src={partner.logo_url}
        alt={partner.name}
        loading="lazy"
        decoding="async"
        className="max-h-full max-w-full object-contain"
      />
    </div>
  ) : (
    <span className="font-semibold text-muted-foreground">{partner.name}</span>
  );

  if (partner.website_url) {
    return (
      <a
        href={partner.website_url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label={partner.name}
        className="shrink-0"
      >
        {content}
      </a>
    );
  }
  return <div className="shrink-0">{content}</div>;
}
