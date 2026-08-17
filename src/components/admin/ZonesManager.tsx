import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { fetchServiceAreas, fetchAllServices } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Star } from "lucide-react";

/**
 * Unique interface for managing a tenant's service×city coverage — used by
 * the client (`/admin/service-areas`) and by the Super Admin
 * (`super-admin.tenants.$tenantId.tsx`, onglet "Zones"). Same component,
 * same queryKey (`admin-service-areas`), only `tenantId` changes between
 * call sites. See docs/product/constitution.md, principe 3.
 *
 * No bulk "toutes les villes sur tous les services" action here on purpose —
 * Lot 7 introduces that with explicit selection, a preview of what will be
 * created/skipped, and confirmation. Carrying the old shortcut forward would
 * just be dead code removed at the very next commit.
 */
export function ZonesManager({ tenantId }: { tenantId: string }) {
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({ city: "", city_slug: "", service_id: "", is_primary: false });

  const { data: areas = [], isLoading } = useQuery({
    queryKey: ["admin-service-areas", tenantId],
    queryFn: () => fetchServiceAreas(tenantId),
  });

  const { data: services = [] } = useQuery({
    queryKey: ["admin-services", tenantId],
    queryFn: () => fetchAllServices(tenantId),
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("service_areas").insert({
        tenant_id: tenantId,
        city: form.city,
        city_slug: form.city_slug,
        service_id: form.service_id,
        is_primary: form.is_primary,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-areas", tenantId] });
      setIsDialogOpen(false);
      setForm({ city: "", city_slug: "", service_id: "", is_primary: false });
      toast.success("Ville ajoutée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("service_areas").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-areas", tenantId] });
      toast.success("Ville supprimée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const togglePrimary = useMutation({
    mutationFn: async ({ id, is_primary }: { id: string; is_primary: boolean }) => {
      const { error } = await supabase.from("service_areas").update({ is_primary }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-areas", tenantId] });
    },
  });

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  // Group areas by service
  const grouped = services.map((s) => ({
    service: s,
    areas: areas.filter((a) => a.service_id === s.id),
  }));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{areas.length} zone(s) · {services.length} service(s)</p>
        <Button size="sm" onClick={() => setIsDialogOpen(true)} disabled={services.length === 0}>
          <Plus className="h-4 w-4 mr-1" />Ajouter une ville
        </Button>
      </div>

      {services.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Créez d'abord un service.</CardContent></Card>
      ) : isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : (
        <div className="space-y-6">
          {grouped.map(({ service, areas: sAreas }) => (
            <Card key={service.id}>
              <CardContent className="py-4">
                <h3 className="font-semibold text-foreground mb-3">{service.name}</h3>
                {sAreas.length === 0 ? (
                  <p className="text-sm text-muted-foreground">Aucune ville</p>
                ) : (
                  <div className="flex flex-wrap gap-2">
                    {sAreas.map((area) => (
                      <div
                        key={area.id}
                        className="flex items-center gap-1.5 rounded-full border bg-card px-3 py-1.5 text-sm"
                      >
                        {area.is_primary && <Star className="h-3 w-3 text-primary fill-primary" />}
                        <span>{area.city}</span>
                        <button
                          onClick={() => togglePrimary.mutate({ id: area.id, is_primary: !area.is_primary })}
                          className="ml-1 text-muted-foreground hover:text-primary"
                          title={area.is_primary ? "Retirer vedette" : "Définir comme principale"}
                        >
                          <Star className="h-3 w-3" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm("Supprimer cette ville ?")) deleteMutation.mutate(area.id);
                          }}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Ajouter une ville</DialogTitle>
          </DialogHeader>
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              addMutation.mutate();
            }}
          >
            <div className="space-y-2">
              <Label>Service</Label>
              <Select value={form.service_id} onValueChange={(v) => setForm((p) => ({ ...p, service_id: v }))}>
                <SelectTrigger><SelectValue placeholder="Choisir un service" /></SelectTrigger>
                <SelectContent>
                  {services.map((s) => (
                    <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ville</Label>
              <Input
                value={form.city}
                onChange={(e) => setForm((p) => ({ ...p, city: e.target.value, city_slug: generateSlug(e.target.value) }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Slug</Label>
              <Input value={form.city_slug} onChange={(e) => setForm((p) => ({ ...p, city_slug: e.target.value }))} required />
            </div>
            <div className="flex items-center gap-2">
              <Switch checked={form.is_primary} onCheckedChange={(v) => setForm((p) => ({ ...p, is_primary: v }))} />
              <Label>Ville principale</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
              <Button type="submit" disabled={addMutation.isPending || !form.service_id}>
                {addMutation.isPending ? "Ajout..." : "Ajouter"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
