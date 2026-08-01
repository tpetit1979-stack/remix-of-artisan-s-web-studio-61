import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useTenant } from "@/hooks/use-tenant";
import { getRgeFamilyDescriptor, type RgeFamilyDescriptor } from "@/lib/rge-labels";
import { Check, Shield } from "lucide-react";

type CertificationRow = {
  id: string;
  certification_name: string;
  qualification_name: string | null;
  qualification_code: string | null;
  domaine: string | null;
  logo_url: string | null;
  url_qualification: string | null;
};

/** True only if `label` already contains the code in parenthesised form,
 *  e.g. "...pole et insert) (21)" already contains "(21)" — a plain
 *  substring check on bare digits would false-positive on short codes
 *  appearing anywhere else in the text. */
function labelContainsCode(label: string, code: string): boolean {
  return label.toLowerCase().includes(`(${code.toLowerCase()})`);
}

function qualificationKey(q: CertificationRow): string {
  return [q.qualification_name ?? "", q.qualification_code ?? "", q.url_qualification ?? ""].join("|");
}

/** The RGE import can contain exact duplicate qualification rows (confirmed
 *  on real data: same qualification_name + code + url repeated 2-3x for the
 *  same certification_name group). Dedupe on that composite key before
 *  render — `id` alone would never dedupe anything, since each duplicate is
 *  still a distinct DB row. */
function dedupeQualifications(quals: CertificationRow[]): CertificationRow[] {
  const seen = new Set<string>();
  const result: CertificationRow[] = [];
  for (const q of quals) {
    const key = qualificationKey(q);
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(q);
  }
  return result;
}

// Certifications are a reassurance block, not decoration — they live only in
// this dedicated section (rendered once, on the homepage). Previously also
// squeezed into the header (next to the tenant's own logo) and the Hero,
// competing with the tenant's identity and the commercial pitch respectively
// — both removed. This is now the only place they exist.
//
// Rows are grouped by their resolved public family (getRgeFamilyDescriptor),
// not by raw certification_name — real data has cases where two distinct
// certification_name values belong to the same public family (e.g. a tenant
// with both "Qualibois Air" and "Qualibois Eau" as separate certification_name
// rows, which must render as ONE "Chauffage au bois" card, not two identically
// titled cards). Grouping by certification_name directly would duplicate the
// title in that case.
export function CertificationBadges() {
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
      return (data ?? []) as CertificationRow[];
    },
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 10,
  });

  if (certifications.length === 0) return null;

  const groups = new Map<string, { descriptor: RgeFamilyDescriptor; rows: CertificationRow[] }>();
  for (const c of certifications) {
    const descriptor = getRgeFamilyDescriptor(c.certification_name, c.qualification_name);
    const existing = groups.get(descriptor.familyKey);
    if (existing) {
      existing.rows.push(c);
    } else {
      groups.set(descriptor.familyKey, { descriptor, rows: [c] });
    }
  }

  return (
    <section className="border-t border-border bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-3xl space-y-5">
          <div className="text-center">
            <span className="text-sm font-semibold uppercase tracking-wider text-primary">
              Certifications officielles
            </span>
            <h3 className="mt-2 text-2xl font-bold text-foreground sm:text-3xl">
              Artisan certifié RGE
            </h3>
          </div>

          <div className="space-y-4">
            {Array.from(groups.entries()).map(([familyKey, { descriptor, rows: rawQuals }]) => {
              const quals = dedupeQualifications(rawQuals);
              const logoUrl = quals.find((q) => q.logo_url)?.logo_url ?? null;
              return (
                <div key={familyKey} className="rounded-2xl border border-border bg-card p-5 sm:p-6">
                  <div className="flex items-center gap-3">
                    {logoUrl ? (
                      <img
                        src={logoUrl}
                        alt={descriptor.titreCarte}
                        loading="lazy" decoding="async"
                        className="h-10 w-auto shrink-0 object-contain"
                      />
                    ) : (
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-green-100">
                        <Shield className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    <div className="min-w-0">
                      <span className="text-base font-semibold text-foreground">{descriptor.titreCarte}</span>
                      {descriptor.explication && (
                        <p className="text-sm text-muted-foreground">{descriptor.explication}</p>
                      )}
                    </div>
                  </div>

                  <ul className="mt-4 space-y-3">
                    {quals.map((q) => {
                      // The raw import text (qualification_name) can be verbose
                      // and, in real data, carries encoding artefacts from the
                      // RGE API (missing accents) — not fixed here (out of
                      // scope: the import, not this display). `domaine`, when
                      // present, is short and human-written, so it takes the
                      // primary slot; the technical name becomes secondary.
                      const rawName = q.qualification_name ?? q.qualification_code ?? "Qualification";
                      const primaryLabel = q.domaine ?? rawName;
                      const secondaryLabel = q.domaine ? rawName : null;
                      const showCode = !!q.qualification_code && !labelContainsCode(rawName, q.qualification_code);
                      return (
                        <li key={qualificationKey(q)} className="flex items-start gap-2.5">
                          <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" aria-hidden />
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-foreground">
                              {primaryLabel}
                              {showCode && <span className="ml-1.5 text-xs text-muted-foreground">({q.qualification_code})</span>}
                            </p>
                            {secondaryLabel && (
                              <p className="text-xs text-muted-foreground">{secondaryLabel}</p>
                            )}
                            {q.url_qualification && (
                              <a
                                href={q.url_qualification}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-xs font-medium text-primary hover:underline"
                              >
                                Voir la qualification officielle →
                              </a>
                            )}
                          </div>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
