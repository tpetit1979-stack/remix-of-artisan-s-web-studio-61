import { useQuery } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import {
  fetchActiveTeamMembers,
  resolveTeamPresentation,
  type TeamMember,
  type TeamPresentationMode,
} from "@/lib/team";
import { User } from "lucide-react";

function MemberCard({ member }: { member: TeamMember }) {
  return (
    <div className="flex flex-col items-center text-center">
      <div className="relative aspect-square w-full overflow-hidden rounded-full bg-muted ring-1 ring-border">
        {member.photo_url ? (
          <img
            src={member.photo_url}
            alt={member.full_name}
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
      <h3 className="mt-4 text-base font-semibold text-foreground">{member.full_name}</h3>
      <p className="text-sm text-muted-foreground">{member.role_title}</p>
    </div>
  );
}

/**
 * Public team section. Rendered from `resolveTeamPresentation` (lib/team.ts)
 * -- an explicit `site_settings.team_presentation_mode`, never inferred from
 * the member count (Lot 2 révisé, docs/product/execution-backlog.md). `null`
 * (not yet arbitrated) and `hidden` (explicit choice) both render nothing.
 */
export function TeamSection() {
  const { tenant, settings } = useTenant();

  const { data: members = [] } = useQuery({
    queryKey: ["public-team-members", tenant?.id],
    queryFn: () => fetchActiveTeamMembers(tenant!.id),
    enabled: !!tenant?.id,
    staleTime: 1000 * 60 * 5,
  });

  // The DB CHECK constraint on site_settings.team_presentation_mode guarantees
  // only these four values are ever stored; the generated Supabase type is
  // just `string | null` because Postgres doesn't surface CHECK as an enum.
  const mode = (settings?.team_presentation_mode ?? null) as TeamPresentationMode;
  const presentation = resolveTeamPresentation(mode, members);

  if (!presentation.visible) return null;

  return (
    <section className="border-t border-border bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            {presentation.eyebrow}
          </span>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            {presentation.title}
          </h2>
          <p className="mt-4 text-muted-foreground">{presentation.subtitle}</p>
        </div>

        {presentation.layout === "solo" ? (
          <div className="mt-12 flex justify-center">
            <div className="w-full max-w-[220px]">
              <MemberCard member={presentation.membersToShow[0]} />
            </div>
          </div>
        ) : (
          <div className="mt-12 grid gap-6 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
            {presentation.membersToShow.map((m) => (
              <MemberCard key={m.id} member={m} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
