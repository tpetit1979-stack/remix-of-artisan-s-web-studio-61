import { Wrench, Flame, Droplets, Zap, Wind, Settings } from "lucide-react";
import { useResolvedMedia } from "@/lib/media-resolver";
import { useTenant } from "@/hooks/use-tenant";
import type { Service } from "@/lib/tenant";

function normalize(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function getServiceIcon(name: string): React.ComponentType<{ className?: string }> {
  const n = normalize(name);
  // Order matters: more specific keywords first.
  if (/(ramon|poele|cheminee)/.test(n)) return Flame;
  if (/(clim|climatisation|froid)/.test(n)) return Wind;
  if (/(plomb|eau)/.test(n)) return Droplets;
  if (/(electr|elec)/.test(n)) return Zap;
  if (/(entretien|maintenance|sav)/.test(n)) return Wrench;
  if (/(installation|pose)/.test(n)) return Settings;
  return Wrench;
}

/**
 * Canonical visual representation of a service, shared across every public
 * surface that shows a service card: resolves via the 3-tier media resolver
 * (tenant override → trade template default → icon fallback), never a blank
 * box. Do not duplicate this logic elsewhere — extend this component instead.
 */
export function ServiceMedia({ service }: { service: Service }) {
  const { tenant } = useTenant();
  const resolved = useResolvedMedia({
    tenantId: tenant?.id ?? null,
    tradeTemplateId: tenant?.trade_template_id ?? null,
    category: "service",
    targetId: service.id,
    altFallback: service.name,
    tradeServiceTemplateId: service.trade_service_template_id ?? null,
  });

  const Icon = getServiceIcon(service.name);

  if (resolved.source === "placeholder") {
    return (
      <div className="relative flex aspect-[16/10] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
        <div
          className="absolute inset-0 text-primary opacity-[0.06] [background-image:radial-gradient(currentColor_1px,transparent_1px)] [background-size:18px_18px]"
          aria-hidden="true"
        />
        <div className="relative flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 ring-1 ring-inset ring-primary/15 transition-transform duration-500 group-hover:scale-110">
          <Icon className="h-7 w-7 text-primary/70" />
        </div>
      </div>
    );
  }

  return (
    <img
      src={resolved.url}
      alt={resolved.alt}
      className="aspect-[16/10] w-full object-cover transition-transform duration-500 group-hover:scale-105"
      loading="lazy"
      decoding="async"
    />
  );
}
