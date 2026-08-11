import { createFileRoute } from "@tanstack/react-router";
import { useAdminTenant } from "@/hooks/use-tenant";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ZonesManager } from "@/components/admin/ZonesManager";

export const Route = createFileRoute("/admin/service-areas")({
  component: AdminServiceAreas,
});

function AdminServiceAreas() {
  const { tenant } = useAdminTenant();

  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Zones d'intervention" description="Gérez les villes couvertes par chaque service" />
      <ZonesManager tenantId={tenant.id} />
    </div>
  );
}
