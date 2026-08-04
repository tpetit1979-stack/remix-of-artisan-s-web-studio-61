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
        title="Logos partenaires"
        description="Logos affichés en bannière de confiance (partenaires, certifications visuelles). Pour les marques d'équipement que vous installez, voir « Mes marques »."
      />
      <PartnersManager tenantId={tenant.id} />
    </div>
  );
}
