import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Wrench,
  MapPin,
  Image,
  Users,
  Handshake,
  Settings,
  Mail,
  ArrowLeft,
  Menu,
  X,
  LogOut,
  Tag,
} from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { buildPublicSiteUrl, type Tenant } from "@/lib/tenant";

const navItems = [
  { label: "Tableau de bord", to: "/admin", icon: LayoutDashboard },
  { label: "Mes services", to: "/admin/services", icon: Wrench },
  { label: "Zones d'intervention", to: "/admin/service-areas", icon: MapPin },
  { label: "Mes réalisations", to: "/admin/portfolio", icon: Image },
  { label: "Mon équipe", to: "/admin/team", icon: Users },
  { label: "Mes marques", to: "/admin/brands", icon: Tag },
  { label: "Logos partenaires", to: "/admin/partners", icon: Handshake },
  { label: "Mon site", to: "/admin/settings", icon: Settings },
  { label: "Demandes reçues", to: "/admin/contacts", icon: Mail },
];

export function AdminSidebar({ tenant }: { tenant: Tenant | null }) {
  const location = useLocation();
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setMobileOpen(!mobileOpen)}
        className="fixed top-4 left-4 z-50 rounded-md bg-primary p-2 text-primary-foreground md:hidden"
      >
        {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
      </button>

      {/* Overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/20 md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r bg-card transition-transform md:static md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <Settings className="h-5 w-5 text-primary" />
          <span className="font-semibold text-foreground">Administration</span>
        </div>

        <nav className="flex-1 space-y-1 p-3">
          {navItems.map((item) => {
            const isActive =
              item.to === "/admin"
                ? location.pathname === "/admin" || location.pathname === "/admin/"
                : location.pathname.startsWith(item.to);
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="space-y-1 border-t p-3">
          {user?.email && (
            <div className="truncate px-3 py-1 text-xs text-muted-foreground" title={user.email}>
              {user.email}
            </div>
          )}
          {tenant && (
            <a
              href={buildPublicSiteUrl(tenant)}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Voir mon site
            </a>
          )}
          <button
            onClick={() => signOut().then(() => navigate({ to: "/login", search: { redirect: "" } }))}
            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm text-muted-foreground hover:bg-accent hover:text-accent-foreground"
          >
            <LogOut className="h-4 w-4" />
            Déconnexion
          </button>
        </div>
      </aside>
    </>
  );
}
