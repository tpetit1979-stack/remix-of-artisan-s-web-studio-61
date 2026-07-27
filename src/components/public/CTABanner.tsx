import { Link } from "@tanstack/react-router";
import { useTenant, usePreviewTenantSearch } from "@/hooks/use-tenant";
import { Button } from "@/components/ui/button";
import { Phone } from "lucide-react";

interface CTABannerProps {
  title?: string;
  subtitle?: string;
  serviceId?: string;
}

export function CTABanner({ title, subtitle, serviceId }: CTABannerProps) {
  const { tenant, settings } = useTenant();
  const previewTenant = usePreviewTenantSearch();

  if (!tenant) return null;

  return (
    <section className="relative overflow-hidden bg-primary py-14 text-primary-foreground sm:py-20">
      {/* Decorative elements */}
      <div className="absolute -left-20 -top-20 h-60 w-60 rounded-full bg-primary-foreground/5 blur-3xl" />
      <div className="absolute -bottom-10 -right-10 h-48 w-48 rounded-full bg-primary-foreground/5 blur-3xl" />

      <div className="relative mx-auto max-w-7xl px-4 text-center">
        <h2 className="text-2xl font-bold sm:text-3xl lg:text-4xl">
          {title ?? settings?.cta_text ?? "Demandez votre devis gratuit"}
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-lg text-primary-foreground/80">
          {subtitle ?? `Contactez ${tenant.company_name} dès maintenant. Intervention rapide et devis gratuit.`}
        </p>
        <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
          <Link to="/contact" search={{ ...(serviceId ? { service: serviceId } : {}), ...previewTenant }}>
            <Button size="lg" variant="secondary" className="h-14 px-10 text-base shadow-elegant">
              {settings?.cta_text ?? "Demander un devis"}
            </Button>
          </Link>
          {tenant.phone && (
            <a href={`tel:${tenant.phone.replace(/\s/g, "")}`}>
              <Button
                size="lg"
                variant="outline"
                className="h-14 px-10 text-base border-primary-foreground/30 text-primary-foreground hover:bg-primary-foreground/10"
              >
                <Phone className="mr-2 h-5 w-5" />
                {tenant.phone}
              </Button>
            </a>
          )}
        </div>
      </div>
    </section>
  );
}
