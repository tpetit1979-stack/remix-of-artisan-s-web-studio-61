import { createFileRoute, Outlet, Link, useLocation, useNavigate } from "@tanstack/react-router";
import { Building2, ArrowLeft, Menu, X, Wand2, LogOut, Loader2, Image as ImageIcon, Tag, Inbox } from "lucide-react";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { SuperAdminBanner } from "@/components/admin/RoleBanner";
import { AccessDenied } from "@/components/AccessDenied";
import { resolveSuperAdminAccess } from "@/lib/access-guard";
import { safeRedirect } from "@/lib/safe-redirect";

export const Route = createFileRoute("/super-admin")({
  component: SuperAdminLayout,
});

function SuperAdminLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isAuthenticated, role, isLoading, signOut, user } = useAuth();

  const access = isLoading ? ({ kind: "ok" } as const) : resolveSuperAdminAccess({ isAuthenticated, role });

  useEffect(() => {
    if (isLoading) return;
    if (access.kind === "redirect-login") {
      const current = location.href;
      navigate({ to: "/login", search: { redirect: safeRedirect(current) ?? location.pathname } });
    }
    // denied-role: no navigation, AccessDenied renders below — this is the
    // branch that used to bounce back to /login and feed the redirect loop.
  }, [isLoading, access.kind, navigate, location.pathname, location.search]);

  if (isLoading || !isAuthenticated || access.kind === "redirect-login") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (access.kind === "denied-role") {
    return (
      <AccessDenied
        title="Accès non autorisé"
        description="Votre compte n'a pas les droits Super Admin."
      />
    );
  }

  const path = location.pathname;

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SuperAdminBanner />
      <div className="flex flex-1">
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-md bg-primary p-2 text-primary-foreground md:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {mobileOpen && (
        <div className="fixed inset-0 z-40 bg-foreground/20 md:hidden" onClick={() => setMobileOpen(false)} />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Building2 className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-semibold text-foreground">Super Admin</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          <Link
            to="/super-admin/tenants"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              path.startsWith("/super-admin/tenants") || path === "/super-admin"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Building2 className="h-4 w-4" />
            Pilotage
          </Link>
          {/* Placée juste après le pilotage : c'est l'écran qu'on ouvre en
              premier le lundi matin, avant tout le reste. */}
          <Link
            to="/super-admin/demandes"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              path === "/super-admin/demandes"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Inbox className="h-4 w-4" />
            Demandes
          </Link>
          <Link
            to="/super-admin/onboarding"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              path === "/super-admin/onboarding"
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Wand2 className="h-4 w-4" />
            Onboarding IA
          </Link>
          <Link
            to="/super-admin/media-library"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              path.startsWith("/super-admin/media-library")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <ImageIcon className="h-4 w-4" />
            Bibliothèque images
          </Link>
          <Link
            to="/super-admin/brands"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
              path.startsWith("/super-admin/brands")
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            )}
          >
            <Tag className="h-4 w-4" />
            Catalogue des marques
          </Link>
        </nav>

        <div className="space-y-1 border-t p-3">
          {user?.email && (
            <div className="truncate px-3 py-1 text-xs text-muted-foreground" title={user.email}>
              {user.email}
            </div>
          )}
          <Link
            to="/"
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Retour au site
          </Link>
          <button
            onClick={() => signOut().then(() => navigate({ to: "/login", search: { redirect: "" } }))}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto">
        <div className="mx-auto max-w-6xl p-4 pt-16 md:p-8 md:pt-8">
          <Outlet />
        </div>
      </main>
      </div>
    </div>
  );
}
