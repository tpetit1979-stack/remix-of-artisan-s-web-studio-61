import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, RefreshCw, Mail, Phone, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { getTradeShortName } from "@/lib/trade-wording";
import {
  LEAD_STATUSES,
  LEAD_STATUS_LABEL,
  canTransition,
  countBySource,
  formatLeadSource,
  leadDisplayName,
  type LeadStatus,
  type MarketingLead,
} from "@/lib/marketing-leads";

/**
 * Boîte de réception des demandes commerciales.
 *
 * Le trou que cet écran bouche : une demande était enregistrée en base et
 * lue par personne. Si la notification email échouait — envoi non configuré,
 * erreur Resend, coupure réseau — la demande existait sans que quiconque
 * puisse le savoir. Une demande reçue samedi soir doit exister lundi matin,
 * même sans email.
 *
 * Ce n'est pas un CRM et ne doit pas le devenir : une liste, un téléphone
 * cliquable, un email cliquable, trois statuts. Pas de relance, pas de
 * séquence, pas d'affectation, pas de score.
 *
 * Accès : la table n'a qu'une policy, `super_admin_manage_marketing_leads`
 * (`FOR ALL TO authenticated USING is_super_admin()`). La lecture passe donc
 * par le client ordinaire avec la session du super-admin — aucune clé
 * privilégiée côté navigateur. La route vit sous `/super-admin`, dont le
 * layout applique déjà `resolveSuperAdminAccess`.
 *
 * Les lignes dont `notified_at` est nul sont signalées : ce sont exactement
 * celles qu'aucun email n'a annoncées, donc celles qu'on risquait de perdre.
 */
export const Route = createFileRoute("/super-admin/demandes")({
  component: DemandesPage,
});

const STATUS_VARIANT: Record<LeadStatus, "default" | "secondary" | "outline"> = {
  new: "default",
  contacted: "secondary",
  closed: "outline",
};

function DemandesPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<LeadStatus | "all">("new");

  const { data: leads = [], isLoading } = useQuery({
    queryKey: ["marketing-leads"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("marketing_leads")
        .select("*")
        .order("created_at", { ascending: false });
      if (error) throw error;
      return (data ?? []) as MarketingLead[];
    },
  });

  const setStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const { error } = await supabase.from("marketing_leads").update({ status }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["marketing-leads"] });
    },
    onError: (error: unknown) => {
      toast.error(error instanceof Error ? error.message : "Mise à jour impossible");
    },
  });

  const shown = filter === "all" ? leads : leads.filter((lead) => lead.status === filter);
  const pending = leads.filter((lead) => lead.status === "new").length;
  const unnotified = leads.filter((lead) => lead.notified_at === null).length;
  const sources = countBySource(leads);

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Demandes"
        description={`${leads.length} demande${leads.length > 1 ? "s" : ""} · ${pending} à traiter`}
        actions={
          <Button
            variant="outline"
            size="sm"
            onClick={() => queryClient.invalidateQueries({ queryKey: ["marketing-leads"] })}
          >
            <RefreshCw className="mr-2 h-4 w-4" />
            Actualiser
          </Button>
        }
      />

      {unnotified > 0 && (
        <Card className="border-amber-300 bg-amber-50">
          <CardContent className="flex items-start gap-3 py-4">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-900">
              {unnotified} demande{unnotified > 1 ? "s" : ""} sans notification email. Elle
              {unnotified > 1 ? "s sont" : " est"} bien enregistrée{unnotified > 1 ? "s" : ""} —
              mais aucun email ne l&apos;a annoncée. C&apos;est précisément ce que cet écran sert à
              ne pas perdre.
            </p>
          </CardContent>
        </Card>
      )}

      <div className="flex flex-wrap gap-2">
        {(["new", "contacted", "closed", "all"] as const).map((value) => (
          <Button
            key={value}
            size="sm"
            variant={filter === value ? "default" : "outline"}
            onClick={() => setFilter(value)}
          >
            {value === "all" ? "Toutes" : LEAD_STATUS_LABEL[value]}
          </Button>
        ))}
      </div>

      {/* Toute la « mesure » de ce lot : combien de demandes, depuis quelle
          page. Aucun graphique, aucun fournisseur — la colonne `source` est
          simplement devenue exploitable. */}
      {sources.length > 0 && (
        <p className="text-sm text-muted-foreground">
          Origines :{" "}
          {sources.map(([source, count], index) => (
            <span key={source}>
              {index > 0 && " · "}
              {formatLeadSource(source)} ({count})
            </span>
          ))}
        </p>
      )}

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : shown.length === 0 ? (
        <Card>
          <CardContent className="py-10 text-center text-muted-foreground">
            {leads.length === 0
              ? "Aucune demande reçue pour l'instant."
              : "Aucune demande dans ce filtre."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {shown.map((lead) => {
            const status = lead.status as LeadStatus;
            return (
              <Card key={lead.id} className={status === "new" ? "border-primary/30" : undefined}>
                <CardContent className="flex flex-col gap-4 py-5 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 space-y-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">{leadDisplayName(lead)}</span>
                      {lead.company && (
                        <span className="text-sm text-muted-foreground">· {lead.company}</span>
                      )}
                      <Badge variant={STATUS_VARIANT[status]}>{LEAD_STATUS_LABEL[status]}</Badge>
                      {lead.intent === "callback" && <Badge variant="outline">Rappel</Badge>}
                      {lead.notified_at === null && (
                        <Badge variant="outline" className="border-amber-400 text-amber-700">
                          Non notifiée
                        </Badge>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                      <a
                        href={`tel:${lead.phone.replace(/\s/g, "")}`}
                        className="flex items-center gap-1.5 hover:text-foreground"
                      >
                        <Phone className="h-3.5 w-3.5" />
                        {lead.phone}
                      </a>
                      {lead.email && (
                        <a
                          href={`mailto:${lead.email}`}
                          className="flex items-center gap-1.5 hover:text-foreground"
                        >
                          <Mail className="h-3.5 w-3.5" />
                          {lead.email}
                        </a>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span>
                        {lead.created_at
                          ? new Date(lead.created_at).toLocaleString("fr-FR", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "date inconnue"}
                      </span>
                      <span>
                        Métier :{" "}
                        {lead.trade === "autre"
                          ? `${lead.trade_other ?? "non précisé"} (hors liste)`
                          : getTradeShortName(lead.trade, lead.trade) || "non renseigné"}
                      </span>
                      {lead.city && <span>Commune : {lead.city}</span>}
                      <span>Origine : {formatLeadSource(lead.source)}</span>
                      {lead.current_website && <span>Site actuel : {lead.current_website}</span>}
                    </div>

                    {lead.message && (
                      <p className="max-w-[70ch] whitespace-pre-wrap text-sm text-foreground">
                        {lead.message}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 flex-wrap gap-2">
                    {LEAD_STATUSES.filter((next) => canTransition(status, next)).map((next) => (
                      <Button
                        key={next}
                        size="sm"
                        variant="outline"
                        disabled={setStatus.isPending}
                        onClick={() => setStatus.mutate({ id: lead.id, status: next })}
                      >
                        {LEAD_STATUS_LABEL[next]}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
