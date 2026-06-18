import { Link, useNavigate } from "@tanstack/react-router";
import { ShieldAlert, UserCog, X } from "lucide-react";
import { useImpersonation } from "@/stores/impersonation";

export function SuperAdminBanner() {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-red-600 px-4 py-1.5 text-xs font-semibold text-white">
      <ShieldAlert className="h-3.5 w-3.5" />
      MODE SUPER ADMIN — vous voyez les données de tous les tenants
    </div>
  );
}

export function TenantAdminBanner({ companyName }: { companyName?: string }) {
  return (
    <div className="sticky top-0 z-30 flex items-center justify-center gap-2 bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white">
      <UserCog className="h-3.5 w-3.5" />
      Espace client{companyName ? ` — ${companyName}` : ""}
    </div>
  );
}

export function ImpersonationBanner() {
  const { tenantId, tenantName, stopImpersonation } = useImpersonation();
  const navigate = useNavigate();
  if (!tenantId) return null;

  const handleStop = () => {
    stopImpersonation();
    navigate({ to: "/super-admin/tenants" });
  };

  return (
    <div className="sticky top-0 z-40 flex items-center justify-between gap-3 bg-red-600 px-4 py-2 text-xs font-semibold text-white">
      <div className="flex items-center gap-2">
        <ShieldAlert className="h-4 w-4 animate-pulse" />
        MODE IMPERSONATION — vous gérez le site de <span className="underline">{tenantName}</span>
      </div>
      <div className="flex items-center gap-2">
        <Link
          to="/super-admin/tenants/$tenantId"
          params={{ tenantId }}
          className="rounded bg-white/20 px-2 py-0.5 hover:bg-white/30"
        >
          Fiche tenant
        </Link>
        <button
          onClick={handleStop}
          className="flex items-center gap-1 rounded bg-white px-2 py-0.5 text-red-700 hover:bg-white/90"
        >
          <X className="h-3 w-3" /> Quitter
        </button>
      </div>
    </div>
  );
}
