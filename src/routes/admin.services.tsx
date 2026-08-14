import { createFileRoute } from "@tanstack/react-router";
import { useAdminTenant } from "@/hooks/use-tenant";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { ServicesManager } from "@/components/admin/ServicesManager";

export const Route = createFileRoute("/admin/services")({
  component: AdminServices,
});

function AdminServices() {
  const { tenant } = useAdminTenant();

  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Mes services" description="Gérez les services proposés" />
      <ServicesManager tenantId={tenant.id} tradeTemplateId={tenant.trade_template_id} />
    </div>
  );
}
