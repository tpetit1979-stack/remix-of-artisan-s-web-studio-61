import { createFileRoute } from "@tanstack/react-router";
import { useAdminTenant } from "@/hooks/use-tenant";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PortfolioManager } from "@/components/admin/PortfolioManager";

export const Route = createFileRoute("/admin/portfolio")({
  component: AdminPortfolio,
});

function AdminPortfolio() {
  const { tenant } = useAdminTenant();

  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader title="Mes réalisations" description="Gérez vos réalisations" />
      <PortfolioManager tenantId={tenant.id} />
    </div>
  );
}
