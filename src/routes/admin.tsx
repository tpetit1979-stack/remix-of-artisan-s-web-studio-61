import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/hooks/use-auth";
import { useImpersonation } from "@/stores/impersonation";
import { TenantAdminBanner, ImpersonationBanner } from "@/components/admin/RoleBanner";
import { supabase } from "@/integrations/supabase/client";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/admin")({
  component: AdminLayout,
});

function AdminLayout() {
  const { isAuthenticated, role, tenantId, isLoading } = useAuth();
  const { tenantId: impersonatedId, tenantName: impersonatedName } = useImpersonation();
  const navigate = useNavigate();
  const location = useLocation();

  const isSuperAdmin = role === "super_admin";
  const isTenantAdmin = role === "tenant_admin";
  const effectiveTenantId = isSuperAdmin ? impersonatedId : tenantId;
  const canAccess = isTenantAdmin || (isSuperAdmin && !!impersonatedId);

  useEffect(() => {
    if (isLoading) return;
    if (!isAuthenticated) {
      navigate({ to: "/login", search: { redirect: location.pathname } });
      return;
    }
    if (!canAccess) {
      // super_admin without impersonation → bounce to super-admin
      if (isSuperAdmin) {
        navigate({ to: "/super-admin/tenants" });
      } else {
        navigate({ to: "/login", search: { redirect: location.pathname } });
      }
    }
  }, [isAuthenticated, isLoading, canAccess, isSuperAdmin, navigate, location.pathname]);

  // Fetch own tenant name for tenant_admin banner
  const { data: ownTenant } = useQuery({
    queryKey: ["own-tenant", tenantId],
    enabled: !!tenantId && isTenantAdmin,
    queryFn: async () => {
      const { data } = await supabase.from("tenants").select("company_name").eq("id", tenantId!).maybeSingle();
      return data;
    },
  });

  if (isLoading || !isAuthenticated || !canAccess) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {isSuperAdmin && impersonatedId ? (
        <ImpersonationBanner />
      ) : (
        <TenantAdminBanner companyName={ownTenant?.company_name} />
      )}
      <div className="flex flex-1">
        <AdminSidebar />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl p-4 pt-16 md:p-8 md:pt-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
