import { createFileRoute } from "@tanstack/react-router";
import { useAdminTenant } from "@/hooks/use-tenant";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { PartnersManager } from "@/components/admin/PartnersManager";

export const Route = createFileRoute("/admin/partners")({
  component: AdminPartnersPage,
});

function AdminPartnersPage() {
  const { tenant } = useAdminTenant();
  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Marques & certifications"
        description="Ajoutez les logos de vos marques et partenaires pour renforcer votre crédibilité."
      />
      <PartnersManager tenantId={tenant.id} />
    </div>
  );
}
