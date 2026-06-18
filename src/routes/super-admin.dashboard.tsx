import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Building2, Users, Wrench, MapPin, Shield, AlertTriangle, Wand2, ArrowRight } from "lucide-react";

export const Route = createFileRoute("/super-admin/dashboard")({
  component: SuperAdminDashboard,
});

function SuperAdminDashboard() {
  const { data: tenants = [] } = useQuery({
    queryKey: ["sa-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenants").select("*").order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  const { data: allServices = [] } = useQuery({
    queryKey: ["sa-all-services"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("tenant_id");
      if (error) throw error;
      return data;
    },
  });

  const { data: allAreas = [] } = useQuery({
    queryKey: ["sa-all-areas"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_areas").select("tenant_id");
      if (error) throw error;
      return data;
    },
  });

  const { data: allCerts = [] } = useQuery({
    queryKey: ["sa-all-certs"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenant_certifications").select("tenant_id");
      if (error) throw error;
      return data;
    },
  });

  const { data: recentContacts = [] } = useQuery({
    queryKey: ["sa-recent-contacts"],
    queryFn: async () => {
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const { data, error } = await supabase
        .from("contacts")
        .select("tenant_id")
        .gte("created_at", thirtyDaysAgo.toISOString());
      if (error) throw error;
      return data;
    },
  });

  const activeCount = tenants.filter((t) => t.is_active).length;
  const ligniaCount = tenants.filter((t) => t.has_lignia).length;
  const tenantsWithServices = new Set(allServices.map((s) => s.tenant_id));
  const tenantsWithAreas = new Set(allAreas.map((a) => a.tenant_id));
  const tenantsWithCerts = new Set(allCerts.map((c) => c.tenant_id));
  const incompleteTenants = tenants.filter(
    (t) => !tenantsWithServices.has(t.id) || !tenantsWithAreas.has(t.id)
  );

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Dashboard"
        description="Vue d'ensemble de la plateforme"
        actions={
          <div className="flex gap-2">
            <Link to="/super-admin/onboarding">
              <Button variant="default">
                <Wand2 className="h-4 w-4 mr-1" />
                Onboarding IA
              </Button>
            </Link>
          </div>
        }
      />

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{activeCount}</p>
                <p className="text-xs text-muted-foreground">Tenants actifs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Users className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{recentContacts.length}</p>
                <p className="text-xs text-muted-foreground">Contacts (30j)</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <Wrench className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{allServices.length}</p>
                <p className="text-xs text-muted-foreground">Services total</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent">
                <Shield className="h-5 w-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{tenantsWithCerts.size}</p>
                <p className="text-xs text-muted-foreground">Certifiés RGE</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Incomplete tenants */}
      {incompleteTenants.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              Tenants incomplets ({incompleteTenants.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {incompleteTenants.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border px-3 py-2">
                  <div className="flex items-center gap-3">
                    <span className="font-medium text-sm">{t.company_name}</span>
                    <div className="flex gap-1.5">
                      {!tenantsWithServices.has(t.id) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          <Wrench className="h-3 w-3" /> Services
                        </span>
                      )}
                      {!tenantsWithAreas.has(t.id) && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-700">
                          <MapPin className="h-3 w-3" /> Zones
                        </span>
                      )}
                    </div>
                  </div>
                  <Link to="/super-admin/tenants/$tenantId" params={{ tenantId: t.id }}>
                    <Button variant="ghost" size="sm">
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </Link>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/super-admin/tenants">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="font-medium">Gérer les tenants</p>
                <p className="text-sm text-muted-foreground">{tenants.length} client(s) enregistré(s)</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
        <Link to="/super-admin/onboarding">
          <Card className="hover:border-primary/50 transition-colors cursor-pointer">
            <CardContent className="pt-6 flex items-center justify-between">
              <div>
                <p className="font-medium">Onboarding IA</p>
                <p className="text-sm text-muted-foreground">Créer un nouveau site en quelques clics</p>
              </div>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
