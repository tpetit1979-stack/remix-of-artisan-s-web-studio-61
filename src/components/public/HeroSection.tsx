import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Phone, Shield, ArrowRight } from "lucide-react";
import { CertificationBadges } from "./CertificationBadges";
import { getTradeTagline } from "@/lib/trade-wording";
import { useResolvedImageUrl } from "./ResolvedImage";
import type { Tenant } from "@/lib/tenant";

function getGoogleMapsUrl(placeId: string) {
  return `https://www.google.com/maps/place/?q=place_id:${encodeURIComponent(placeId)}`;
}

type TenantWithGoogle = Tenant & {
  google_place_id?: string | null;
  google_rating?: number | null;
  google_review_count?: number | null;
};

export function HeroSection() {
  const { tenant, settings } = useTenant();

  // Resolve trade slug ONLY for tagline copy (image is now handled by the resolver).
  const { data: tradeSlug } = useQuery({
    queryKey: ["trade-slug", tenant?.trade_template_id],
    queryFn: async () => {
      if (!tenant?.trade_template_id) return null;
      const { data } = await supabase
        .from("trade_templates")
        .select("slug")
        .eq("id", tenant.trade_template_id)
        .maybeSingle();
      return data?.slug ?? null;
    },
    enabled: !!tenant?.trade_template_id,
    staleTime: 1000 * 60 * 30,
  });

  // Hero image via 3-level resolver: tenant_media > trade template > placeholder.
  const hero = useResolvedImageUrl("hero", null, tenant?.company_name ?? "");
  const heroImageUrl = hero.url;
  const heroAlt = hero.alt || `${tenant?.company_name ?? ""} — atelier`;
  const hasHeroImage = true;

  if (!tenant) return null;

  const t = tenant as TenantWithGoogle;

  return (
    <section className="relative overflow-hidden">
      {/* Background image — rendered as <img> so we can prioritise the LCP. */}
      <div className="absolute inset-0">
        <img
          src={heroImageUrl}
          alt={heroAlt}
          className="h-full w-full object-cover"
          loading="eager"
          // @ts-expect-error - fetchpriority is a valid HTML attribute, React types lag.
          fetchpriority="high"
          decoding="async"
        />
        <div className="absolute inset-0 bg-foreground/55" />
      </div>

      <div className="relative mx-auto max-w-7xl px-4 py-20 sm:py-24 lg:py-32">
        <div className="mx-auto max-w-3xl text-center">
          {/* Badge */}
          {tenant.tagline && (
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-1.5 text-sm font-medium text-primary">
              <Shield className="h-3.5 w-3.5" />
              {tenant.tagline}
            </div>
          )}

          <h1
            className={`text-4xl font-extrabold tracking-tight sm:text-5xl lg:text-6xl ${
              hasHeroImage ? "text-white" : "text-foreground"
            }`}
          >
            {settings?.hero_title ?? tenant.company_name}
          </h1>

          {(settings?.hero_subtitle || getTradeTagline(tradeSlug)) && (
            <p
              className={`mx-auto mt-6 max-w-2xl text-lg leading-relaxed sm:text-xl ${
                hasHeroImage ? "text-white/85" : "text-muted-foreground"
              }`}
            >
              {settings?.hero_subtitle ?? getTradeTagline(tradeSlug)}
            </p>
          )}

          {/* CTA buttons */}
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link to="/contact">
              <Button size="lg" className="h-14 text-base px-10 shadow-elegant">
                {settings?.cta_text ?? "Demander un devis gratuit"}
              </Button>
            </Link>
            {tenant.phone && (
              <a href={`tel:${tenant.phone.replace(/\s/g, "")}`}>
                <Button
                  variant={hasHeroImage ? "secondary" : "outline"}
                  size="lg"
                  className="h-14 text-base px-10"
                >
                  <Phone className="mr-2 h-5 w-5" />
                  {tenant.phone}
                </Button>
              </a>
            )}
          </div>

          {/* Google reviews badge */}
          {t.google_place_id && (
            <a
              href={getGoogleMapsUrl(t.google_place_id)}
              target="_blank"
              rel="noopener noreferrer"
              className={`mt-6 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                hasHeroImage
                  ? "border-white/20 bg-white/10 text-white hover:bg-white/20"
                  : "border-border bg-background/80 text-foreground hover:bg-background"
              }`}
            >
              {t.google_rating != null ? (
                <>
                  <span aria-hidden>⭐</span>
                  <span>{Number(t.google_rating).toFixed(1)}</span>
                  <span className="mx-1 opacity-60">·</span>
                  <span>
                    {t.google_review_count && t.google_review_count > 0
                      ? `${t.google_review_count} avis Google`
                      : "Voir sur Google"}
                  </span>
                </>
              ) : (
                <>
                  <span>Voir nos avis Google</span>
                  <span aria-hidden>→</span>
                </>
              )}
            </a>
          )}

          {/* Single strong trust signal — only when we have a real value to show. */}
          {tenant.years_experience && tenant.years_experience > 0 && (
            <div
              className={`mt-10 inline-flex items-baseline gap-2 ${
                hasHeroImage ? "text-white" : "text-foreground"
              }`}
            >
              <span className="text-4xl font-extrabold tracking-tight sm:text-5xl">
                {tenant.years_experience}+
              </span>
              <span
                className={`text-sm font-medium uppercase tracking-wider ${
                  hasHeroImage ? "text-white/75" : "text-muted-foreground"
                }`}
              >
                ans d'expérience
              </span>
            </div>
          )}

          {/* Certification badges */}
          {hasHeroImage && (
            <div className="mt-8">
              <CertificationBadges variant="hero" />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
