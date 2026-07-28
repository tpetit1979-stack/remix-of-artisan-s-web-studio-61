import { createFileRoute } from "@tanstack/react-router";
import { useAdminTenant } from "@/hooks/use-tenant";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { TeamManager } from "@/components/admin/TeamManager";

export const Route = createFileRoute("/admin/team")({
  component: AdminTeamPage,
});

function AdminTeamPage() {
  const { tenant } = useAdminTenant();
  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mon équipe"
        description="Présentez les visages de votre entreprise sur la page d'accueil."
      />
      <TeamManager tenantId={tenant.id} />
    </div>
  );
}
