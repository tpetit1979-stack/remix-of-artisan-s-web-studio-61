import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/hooks/use-auth";
import { useImpersonation } from "@/stores/impersonation";
import { useAdminTenant } from "@/hooks/use-tenant";
import { TenantAdminBanner, ImpersonationBanner } from "@/components/admin/RoleBanner";
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

  // Single source of truth for "which tenant does this admin session
  // manage" — same hook every /admin/* page uses, so the banner always
  // agrees with the page content underneath it.
  const { tenant: ownTenant } = useAdminTenant();

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
