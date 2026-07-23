import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Plus, Globe, Phone, Mail, Zap, ExternalLink, Search,
  Wrench, MapPin, Shield, Image, Check, X as XIcon, ArrowRight, Trash2,
} from "lucide-react";
import { useState, useMemo } from "react";
import { CompanySearch } from "@/components/admin/CompanySearch";
import { TenantCreatedRecap, type TenantCreatedRecapTenant } from "@/components/admin/TenantCreatedRecap";
import { toast } from "sonner";
import { findExistingTenantByIdentity, generateSlug, toTenantMutationError } from "@/lib/tenant-admin";

export const Route = createFileRoute("/super-admin/tenants/")({
  component: TenantsIndex,
});

function TenantsIndex() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editing, setEditing] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [createdTenant, setCreatedTenant] = useState<TenantCreatedRecapTenant | null>(null);

  const { data: tenants = [], isLoading } = useQuery({
    queryKey: ["sa-tenants"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenants")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data;
    },
  });

  // Fetch completion data for badges
  const { data: servicesByTenant = {} } = useQuery({
    queryKey: ["sa-services-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("services").select("tenant_id");
      if (error) throw error;
      const map: Record<string, number> = {};
      data.forEach((s) => { map[s.tenant_id] = (map[s.tenant_id] || 0) + 1; });
      return map;
    },
  });

  const { data: areasByTenant = {} } = useQuery({
    queryKey: ["sa-areas-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("service_areas").select("tenant_id");
      if (error) throw error;
      const map: Record<string, number> = {};
      data.forEach((a) => { map[a.tenant_id] = (map[a.tenant_id] || 0) + 1; });
      return map;
    },
  });

  const { data: certsByTenant = {} } = useQuery({
    queryKey: ["sa-certs-count"],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenant_certifications").select("tenant_id");
      if (error) throw error;
      const map: Record<string, number> = {};
      data.forEach((c) => { map[c.tenant_id] = (map[c.tenant_id] || 0) + 1; });
      return map;
    },
  });

  const { data: settingsByTenant = {} } = useQuery({
    queryKey: ["sa-settings-logos"],
    queryFn: async () => {
      const { data, error } = await supabase.from("site_settings").select("tenant_id, logo_url");
      if (error) throw error;
      const map: Record<string, boolean> = {};
      data.forEach((s) => { map[s.tenant_id] = !!s.logo_url; });
      return map;
    },
  });

  // Filter tenants
  const filteredTenants = useMemo(() => {
    let result = tenants;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (t) =>
          t.company_name.toLowerCase().includes(q) ||
          (t.city && t.city.toLowerCase().includes(q)) ||
          (t.domain && t.domain.toLowerCase().includes(q)) ||
          (t.email && t.email.toLowerCase().includes(q))
      );
    }
    if (statusFilter === "active") result = result.filter((t) => t.is_active);
    if (statusFilter === "inactive") result = result.filter((t) => !t.is_active);
    if (statusFilter === "lignia") result = result.filter((t) => t.has_lignia);
    if (statusFilter === "incomplete") {
      result = result.filter((t) => !servicesByTenant[t.id] || !areasByTenant[t.id]);
    }
    return result;
  }, [tenants, searchQuery, statusFilter, servicesByTenant, areasByTenant]);

  const saveMutation = useMutation({
    mutationFn: async (t: any) => {
      const resolvedSlug = generateSlug(t.slug || t.company_name);
      const existingTenant = await findExistingTenantByIdentity({
        companyName: t.company_name,
        slug: resolvedSlug,
        siret: t.siret || null,
        excludeTenantId: t.id,
      });

      if (existingTenant) {
        throw new Error(`Client déjà existant : ${existingTenant.company_name} (${existingTenant.slug})`);
      }

      const { data: newTenant, error } = await supabase
        .from("tenants")
        .insert({
          company_name: t.company_name,
          slug: resolvedSlug,
          domain: t.domain?.trim() || null,
          phone: t.phone?.trim() || null,
          email: t.email?.trim() || null,
          city: t.city?.trim() || null,
          address: t.address?.trim() || null,
          siret: t.siret?.trim() || null,
          seo_boost_text: t.seo_boost_text?.trim() || null,
          is_active: t.is_active ?? true,
          has_lignia: t.has_lignia ?? false,
        })
        .select()
        .single();
      if (error) throw toTenantMutationError(error);

      const { error: settingsError } = await supabase.from("site_settings").insert({
        tenant_id: newTenant.id,
        hero_title: `Bienvenue chez ${t.company_name}`,
        hero_subtitle: "Votre artisan de confiance",
        cta_text: "Demander un devis",
        primary_color: "#2563eb",
      });
      if (settingsError) throw settingsError;
      return newTenant;
    },
    onSuccess: (newTenant: any) => {
      queryClient.invalidateQueries({ queryKey: ["sa-tenants"] });
      setIsDialogOpen(false);
      setEditing(null);
      toast.success("Tenant créé");
      setCreatedTenant({
        id: newTenant.id,
        company_name: newTenant.company_name,
        slug: newTenant.slug,
        domain: newTenant.domain,
      });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (tenantId: string) => {
      // Delete related data first (order matters for foreign keys)
      await supabase.from("contacts").delete().eq("tenant_id", tenantId);
      await supabase.from("portfolio").delete().eq("tenant_id", tenantId);
      await supabase.from("service_areas").delete().eq("tenant_id", tenantId);
      await supabase.from("services").delete().eq("tenant_id", tenantId);
      await supabase.from("tenant_certifications").delete().eq("tenant_id", tenantId);
      await supabase.from("analytics_monthly").delete().eq("tenant_id", tenantId);
      await supabase.from("site_settings").delete().eq("tenant_id", tenantId);
      const { error } = await supabase.from("tenants").delete().eq("id", tenantId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-tenants"] });
      queryClient.invalidateQueries({ queryKey: ["sa-services-count"] });
      queryClient.invalidateQueries({ queryKey: ["sa-areas-count"] });
      queryClient.invalidateQueries({ queryKey: ["sa-certs-count"] });
      queryClient.invalidateQueries({ queryKey: ["sa-settings-logos"] });
      toast.success("Tenant supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setEditing({
      company_name: "",
      slug: "",
      domain: "",
      phone: "",
      email: "",
      city: "",
      address: "",
      siret: "",
      seo_boost_text: "",
      is_active: true,
      has_lignia: false,
    });
    setIsDialogOpen(true);
  }

  function CompletionBadge({ has, icon: Icon, label }: { has: boolean; icon: any; label: string }) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs ${
          has
            ? "bg-green-100 text-green-700"
            : "bg-muted text-muted-foreground"
        }`}
        title={has ? `${label} configuré` : `${label} manquant`}
      >
        <Icon className="h-3 w-3" />
        {has ? <Check className="h-3 w-3" /> : <XIcon className="h-3 w-3" />}
      </span>
    );
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Tenants"
        description={`${filteredTenants.length} sur ${tenants.length} client(s)`}
        actions={
          <Button variant="outline" onClick={openNew}>
            <Plus className="h-4 w-4 mr-1" />
            Nouveau tenant
          </Button>
        }
      />

      {/* Search & Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Rechercher par nom, ville, domaine..."
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Filtrer..." />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
            <SelectItem value="lignia">LIGNIA</SelectItem>
            <SelectItem value="incomplete">Incomplets</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : filteredTenants.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-muted-foreground">
            {tenants.length === 0
              ? 'Aucun tenant. Cliquez sur "Nouveau tenant" pour commencer.'
              : "Aucun résultat pour cette recherche."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filteredTenants.map((t) => (
            <Card key={t.id} className="group hover:border-primary/30 transition-colors">
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-foreground text-lg">{t.company_name}</span>
                      {t.is_active ? (
                        <Badge variant="default" className="text-xs">Actif</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">Inactif</Badge>
                      )}
                      {t.has_lignia && (
                        <Badge variant="outline" className="text-xs border-primary text-primary">
                          <Zap className="h-3 w-3 mr-1" />
                          LIGNIA
                        </Badge>
                      )}
                    </div>
                    <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      {t.domain && (
                        <span className="flex items-center gap-1">
                          <Globe className="h-3 w-3" />
                          {t.domain}
                        </span>
                      )}
                      {t.phone && (
                        <span className="flex items-center gap-1">
                          <Phone className="h-3 w-3" />
                          {t.phone}
                        </span>
                      )}
                      {t.email && (
                        <span className="flex items-center gap-1">
                          <Mail className="h-3 w-3" />
                          {t.email}
                        </span>
                      )}
                      {t.city && <span>{t.city}</span>}
                    </div>
                    {/* Completion badges */}
                    <div className="mt-2 flex gap-1.5">
                      <CompletionBadge has={!!servicesByTenant[t.id]} icon={Wrench} label="Services" />
                      <CompletionBadge has={!!areasByTenant[t.id]} icon={MapPin} label="Zones" />
                      <CompletionBadge has={!!settingsByTenant[t.id]} icon={Image} label="Logo" />
                      <CompletionBadge has={!!certsByTenant[t.id]} icon={Shield} label="Certifications" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <a
                      href={t.domain ? `https://${t.domain}` : `/?tenant=${t.slug}`}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button variant="ghost" size="sm" title="Voir le site client">
                        <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                    <Link to="/super-admin/tenants/$tenantId" params={{ tenantId: t.id }}>
                      <Button variant="outline" size="sm">
                        Gérer
                        <ArrowRight className="h-4 w-4 ml-1" />
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      size="sm"
                      title="Supprimer"
                      disabled={deleteMutation.isPending}
                      onClick={() => {
                        if (confirm(`Supprimer "${t.company_name}" et toutes ses données ?`)) {
                          deleteMutation.mutate(t.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create tenant dialog - only for new tenants now */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nouveau tenant</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(editing);
              }}
            >
              <CompanySearch
                onSelect={(data) => {
                  setEditing((p: any) => ({
                    ...p,
                    company_name: data.company_name,
                    siret: data.siret,
                    address: data.address,
                    city: data.city,
                    slug: generateSlug(data.company_name),
                  }));
                }}
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Nom entreprise *</Label>
                  <Input
                    value={editing.company_name}
                    onChange={(e) => {
                      const name = e.target.value;
                      setEditing((p: any) => ({
                        ...p,
                        company_name: name,
                        slug: generateSlug(name),
                      }));
                    }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Slug *</Label>
                  <Input
                    value={editing.slug}
                    onChange={(e) => setEditing((p: any) => ({ ...p, slug: e.target.value }))}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Domaine</Label>
                  <Input
                    value={editing.domain ?? ""}
                    onChange={(e) => setEditing((p: any) => ({ ...p, domain: e.target.value }))}
                    placeholder="monsite.fr"
                  />
                </div>
                <div className="space-y-2">
                  <Label>SIRET</Label>
                  <Input
                    value={editing.siret ?? ""}
                    onChange={(e) => setEditing((p: any) => ({ ...p, siret: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Téléphone</Label>
                  <Input
                    value={editing.phone ?? ""}
                    onChange={(e) => setEditing((p: any) => ({ ...p, phone: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={editing.email ?? ""}
                    onChange={(e) => setEditing((p: any) => ({ ...p, email: e.target.value }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={editing.city ?? ""}
                    onChange={(e) => setEditing((p: any) => ({ ...p, city: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Adresse</Label>
                  <Input
                    value={editing.address ?? ""}
                    onChange={(e) => setEditing((p: any) => ({ ...p, address: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Création..." : "Créer"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
