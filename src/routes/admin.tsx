import { createFileRoute, Outlet, useNavigate, useLocation } from "@tanstack/react-router";
import { useEffect } from "react";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { useAuth } from "@/hooks/use-auth";
import { useImpersonation } from "@/stores/impersonation";
import { useAdminTenant } from "@/hooks/use-tenant";
import { TenantAdminBanner, ImpersonationBanner } from "@/components/admin/RoleBanner";
import { AccessDenied } from "@/components/AccessDenied";
import { resolveAdminAccess } from "@/lib/access-guard";
import { safeRedirect } from "@/lib/safe-redirect";
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
  const effectiveTenantId = isSuperAdmin ? impersonatedId : tenantId;

  const access = isLoading
    ? ({ kind: "ok" } as const) // loading: fall through to the spinner below, don't decide yet
    : resolveAdminAccess({ isAuthenticated, role, tenantId, impersonatedId });

  useEffect(() => {
    if (isLoading) return;
    if (access.kind === "redirect-login") {
      const current = location.href;
      navigate({ to: "/login", search: { redirect: safeRedirect(current) ?? location.pathname } });
      return;
    }
    if (access.kind === "redirect-super-admin-tenants") {
      navigate({ to: "/super-admin/tenants" });
    }
    // denied-no-tenant / denied-role: no navigation, AccessDenied renders below.
  }, [isLoading, access.kind, navigate, location.pathname, location.search]);

  // Single source of truth for "which tenant does this admin session
  // manage" — same hook every /admin/* page uses, so the banner always
  // agrees with the page content underneath it.
  const { tenant: ownTenant } = useAdminTenant();

  if (isLoading || !isAuthenticated || access.kind === "redirect-login" || access.kind === "redirect-super-admin-tenants") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (access.kind === "denied-no-tenant") {
    return (
      <AccessDenied
        title="Compte non rattaché"
        description="Ce compte n'est rattaché à aucune entreprise. Contactez votre agence."
      />
    );
  }

  if (access.kind === "denied-role") {
    return (
      <AccessDenied
        title="Accès non autorisé"
        description="Votre compte ne dispose pas des droits nécessaires pour accéder à cet espace."
      />
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
        <AdminSidebar tenant={ownTenant} />
        <main className="flex-1 overflow-auto">
          <div className="mx-auto max-w-5xl p-4 pt-16 md:p-8 md:pt-8">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
