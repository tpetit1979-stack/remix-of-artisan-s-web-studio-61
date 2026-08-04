import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Plus, Globe, Phone, Mail, Zap, ExternalLink, Search,
  Wrench, MapPin, Shield, Image, Check, X as XIcon, ArrowRight, Trash2, AlertTriangle,
} from "lucide-react";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { buildPublicSiteUrl } from "@/lib/tenant";
import { detectCommercialPromiseIssues } from "@/lib/commercial-promises";

type ReconcileTarget = { id: string; company_name: string; ctaText: string | null };

function ReconcileFreeQuoteDialog({ target, onClose }: { target: ReconcileTarget; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [decision, setDecision] = useState<"confirmed_free" | "confirmed_not_free" | "left_unspecified">("confirmed_free");
  const [neutralCta, setNeutralCta] = useState("Demander un devis");

  const reconcile = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.rpc("reconcile_free_quote_claim", {
        p_tenant_id: target.id,
        p_decision: decision,
        p_neutral_cta_text: decision === "confirmed_free" ? undefined : neutralCta,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sa-promise-data"] });
      toast.success("Réconciliation enregistrée");
      onClose();
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const needsNeutralCta = decision !== "confirmed_free";

  return (
    <Dialog open onOpenChange={(v) => !v && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Réconcilier la promesse de gratuité — {target.company_name}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            CTA actuel : <span className="font-medium text-foreground">« {target.ctaText} »</span> — évoque la gratuité, non confirmée par le tenant.
          </p>

          <RadioGroup value={decision} onValueChange={(v) => setDecision(v as typeof decision)}>
            <div className="flex items-start gap-2">
              <RadioGroupItem value="confirmed_free" id="opt-free" className="mt-0.5" />
              <Label htmlFor="opt-free" className="font-normal">Confirmer gratuit — le CTA reste inchangé, quote_is_free passe à vrai</Label>
            </div>
            <div className="flex items-start gap-2">
              <RadioGroupItem value="confirmed_not_free" id="opt-paid" className="mt-0.5" />
              <Label htmlFor="opt-paid" className="font-normal">Confirmer non gratuit — le CTA est remplacé par un texte neutre</Label>
            </div>
            <div className="flex items-start gap-2">
              <RadioGroupItem value="left_unspecified" id="opt-unset" className="mt-0.5" />
              <Label htmlFor="opt-unset" className="font-normal">Laisser non renseigné — le CTA est remplacé par un texte neutre</Label>
            </div>
          </RadioGroup>

          {needsNeutralCta && (
            <div className="space-y-2">
              <Label>Nouveau texte du CTA (neutre, sans mention de gratuité)</Label>
              <Input value={neutralCta} onChange={(e) => setNeutralCta(e.target.value)} />
            </div>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button variant="outline" onClick={onClose}>Annuler</Button>
          <Button
            onClick={() => reconcile.mutate()}
            disabled={reconcile.isPending || (needsNeutralCta && !neutralCta.trim())}
          >
            {reconcile.isPending ? "Enregistrement..." : "Valider"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export const Route = createFileRoute("/super-admin/tenants/")({
  component: TenantsIndex,
});

function TenantsIndex() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

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

  const { data: promiseDataByTenant = {} } = useQuery({
    queryKey: ["sa-promise-data"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("site_settings")
        .select("tenant_id, cta_text, quote_is_free, quote_response_delay_hours, emergency_service_available");
      if (error) throw error;
      const map: Record<string, { ctaText: string | null; quoteIsFree: boolean | null }> = {};
      data.forEach((s) => {
        map[s.tenant_id] = { ctaText: s.cta_text, quoteIsFree: s.quote_is_free };
      });
      return map;
    },
  });

  const promiseIssuesByTenant = useMemo(() => {
    const map: Record<string, ReturnType<typeof detectCommercialPromiseIssues>> = {};
    for (const [tenantId, d] of Object.entries(promiseDataByTenant)) {
      map[tenantId] = detectCommercialPromiseIssues({
        ctaText: d.ctaText,
        quoteIsFree: d.quoteIsFree,
        quoteResponseDelayHours: null,
        emergencyServiceAvailable: null,
      });
    }
    return map;
  }, [promiseDataByTenant]);

  const [reconcileTarget, setReconcileTarget] = useState<ReconcileTarget | null>(null);

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
    if (statusFilter === "promise_issue") {
      result = result.filter((t) => (promiseIssuesByTenant[t.id]?.length ?? 0) > 0);
    }
    return result;
  }, [tenants, searchQuery, statusFilter, servicesByTenant, areasByTenant, promiseIssuesByTenant]);

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
          <Button variant="outline" onClick={() => navigate({ to: "/super-admin/onboarding" })}>
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
            <SelectItem value="promise_issue">Promesse à vérifier</SelectItem>
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
                      {(promiseIssuesByTenant[t.id]?.length ?? 0) > 0 && (
                        <button
                          type="button"
                          onClick={() =>
                            setReconcileTarget({
                              id: t.id,
                              company_name: t.company_name,
                              ctaText: promiseDataByTenant[t.id]?.ctaText ?? null,
                            })
                          }
                          className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs text-amber-800 hover:bg-amber-200 transition-colors"
                          title="Le CTA évoque la gratuité sans confirmation — cliquer pour réconcilier"
                        >
                          <AlertTriangle className="h-3 w-3" />
                          Promesse à vérifier
                        </button>
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
                      href={buildPublicSiteUrl(t)}
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

      {reconcileTarget && (
        <ReconcileFreeQuoteDialog target={reconcileTarget} onClose={() => setReconcileTarget(null)} />
      )}
    </div>
  );
}
