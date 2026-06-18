import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Phone, CheckCircle, Clock, Star, Shield } from "lucide-react";
import { CertificationBadges } from "./CertificationBadges";
import { getTradeTagline } from "@/lib/trade-wording";
import { useResolvedImageUrl } from "./ResolvedImage";

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
  const hasHeroImage = true;

  if (!tenant) return null;

  return (
    <section className="relative overflow-hidden">
      {/* Background — always an image (tenant upload or trade default) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: `url(${heroImageUrl})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-br from-foreground/80 via-foreground/65 to-foreground/50" />
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
              <Button size="lg" className="h-14 text-base px-10 shadow-lg shadow-primary/25">
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

          {/* Trust indicators */}
          <div
            className={`mt-12 flex flex-wrap items-center justify-center gap-x-8 gap-y-3 text-sm font-medium ${
              hasHeroImage ? "text-white/80" : "text-muted-foreground"
            }`}
          >
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                <CheckCircle className="h-3.5 w-3.5 text-primary" />
              </span>
              Devis gratuit
            </span>
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                <Clock className="h-3.5 w-3.5 text-primary" />
              </span>
              Intervention rapide
            </span>
            <span className="flex items-center gap-2">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/15">
                <Star className="h-3.5 w-3.5 text-primary" />
              </span>
              Technicien certifié
            </span>
          </div>

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
