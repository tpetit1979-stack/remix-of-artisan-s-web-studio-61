import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import { fetchActiveTeamMembers } from "@/lib/team";
import { User } from "lucide-react";

/**
 * Public team section. Hidden entirely when no active member — never
 * display an empty state, same pattern as portfolio.
 *
 * Solo vs team is inferred from the active member count, not a separate
 * config field (Lot 2, docs/product/execution-backlog.md — category A,
 * benefits every tenant with 0 or 1 active member, not just EASYDEP):
 * 0 -> hidden, 1 -> singular "Votre interlocuteur", 2+ -> unchanged plural.
 */
export function TeamSection() {
  const { tenant } = useTenant();

  const { data: members = [] } = useQuery({
    queryKey: ["public-team-members", tenant?.id],
    queryFn: () => fetchActiveTeamMembers(tenant!.id),
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 5,
  });

  if (members.length === 0) return null;

  const isSolo = members.length === 1;
  const firstName = isSolo ? members[0].full_name.trim().split(/\s+/)[0] : "";

  return (
    <section className="border-t border-border bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Qui sommes-nous
          </span>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            {isSolo ? "Votre interlocuteur" : "Notre équipe"}
          </h2>
          <p className="mt-4 text-muted-foreground">
            {isSolo
              ? `${firstName} vous accompagne personnellement de l'étude de votre projet jusqu'au suivi de vos équipements.`
              : "Des professionnels qualifiés à votre service."}
          </p>
        </div>

        <div className="mt-12 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
          {members.map((m) => (
            <div key={m.id} className="flex flex-col items-center text-center">
              <div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted ring-1 ring-border">
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.full_name}
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover"
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <User className="h-12 w-12 text-muted-foreground" />
                  </div>
                )}
              </div>
              <h3 className="mt-4 text-base font-semibold text-foreground">{m.full_name}</h3>
              <p className="text-sm text-muted-foreground">{m.role_title}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
