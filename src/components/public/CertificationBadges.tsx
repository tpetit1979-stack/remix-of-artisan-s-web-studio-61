import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { Shield } from "lucide-react";

export function CertificationBadges({ variant = "header" }: { variant?: "header" | "hero" | "full" }) {
  const { tenant } = useTenant();

  const { data: certifications = [] } = useQuery({
    queryKey: ["certifications", tenant?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("tenant_certifications")
        .select("*")
        .eq("tenant_id", tenant!.id)
        .eq("is_active", true)
        .order("certification_name");
      return data ?? [];
    },
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 10,
  });

  if (certifications.length === 0) return null;

  // Deduplicate by certification_name for logo display
  const uniqueCerts = certifications.filter(
    (c, i, arr) => arr.findIndex((x) => x.certification_name === c.certification_name) === i,
  );

  if (variant === "header") {
    return (
      <div className="flex shrink-0 items-center gap-1.5">
        {uniqueCerts.slice(0, 3).map((c) =>
          c.logo_url ? (
            <img
              key={c.id}
              src={c.logo_url}
              alt={c.certification_name}
              title={c.certification_name}
              loading="lazy" decoding="async" className="h-8 w-auto object-contain"
            />
          ) : (
            <span
              key={c.id}
              className="inline-flex items-center gap-1 rounded bg-green-100 px-1.5 py-1 text-[10px] font-semibold text-green-800"
              title={c.certification_name}
            >
              <Shield className="h-3 w-3" />
              RGE
            </span>
          ),
        )}
      </div>
    );
  }

  if (variant === "hero") {
    return (
      <div className="flex flex-wrap items-center justify-center gap-3">
        {uniqueCerts.map((c) =>
          c.logo_url ? (
            <img
              key={c.id}
              src={c.logo_url}
              alt={c.certification_name}
              title={c.qualification_name ?? c.certification_name}
              loading="lazy" decoding="async" className="h-10 w-auto object-contain rounded bg-white/90 px-2 py-1"
            />
          ) : (
            <span
              key={c.id}
              className="inline-flex items-center gap-1.5 rounded-full bg-green-500/20 px-3 py-1 text-xs font-semibold text-green-300"
            >
              <Shield className="h-3.5 w-3.5" />
              {c.certification_name}
            </span>
          ),
        )}
      </div>
    );
  }

  // variant === "full" — compact 1-line layout per qualification.
  // Goal: reassure at a glance, not inform in detail.
  // Each row: logo + short name + domain + verification link.
  return (
    <div className="space-y-5">
      <div className="text-center">
        <span className="text-sm font-semibold uppercase tracking-wider text-primary">
          Certifications officielles
        </span>
        <h3 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
          Artisan certifié RGE
        </h3>
      </div>
      <ul className="divide-y divide-border overflow-hidden rounded-2xl border border-border bg-card">
        {certifications.map((c) => (
          <li
            key={c.id}
            className="flex items-center gap-4 px-4 py-3 sm:px-6"
          >
            {c.logo_url ? (
              <img
                src={c.logo_url}
                alt={c.certification_name}
                loading="lazy" decoding="async" className="h-10 w-12 shrink-0 object-contain"
              />
            ) : (
              <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded-md bg-green-100">
                <Shield className="h-5 w-5 text-green-600" />
              </div>
            )}
            <div className="flex min-w-0 flex-1 flex-col sm:flex-row sm:items-center sm:gap-3">
              <span className="truncate text-sm font-semibold text-foreground">
                {c.qualification_code ?? c.qualification_name ?? c.certification_name}
              </span>
              {c.domaine && (
                <span className="truncate text-xs text-muted-foreground">
                  · {c.domaine}
                </span>
              )}
            </div>
            <span className="hidden shrink-0 items-center gap-1 rounded-full bg-green-100 px-2.5 py-1 text-xs font-semibold text-green-800 sm:inline-flex">
              <Shield className="h-3 w-3" />
              Certifié
            </span>
            {c.url_qualification && (
              <a
                href={c.url_qualification}
                target="_blank"
                rel="noopener noreferrer"
                className="shrink-0 text-xs font-medium text-primary hover:underline"
                aria-label={`Vérifier la certification ${c.qualification_code ?? c.certification_name}`}
              >
                Vérifier
              </a>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
}
