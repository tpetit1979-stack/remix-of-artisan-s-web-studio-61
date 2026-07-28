import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminTenant } from "@/hooks/use-tenant";
import { fetchServiceAreas, fetchAllServices } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Trash2, Star } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/service-areas")({
  component: AdminServiceAreas,
});

function AdminServiceAreas() {
  const { tenant } = useAdminTenant();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [form, setForm] = useState({ city: "", city_slug: "", service_id: "", is_primary: false });

  const { data: areas = [], isLoading } = useQuery({
    queryKey: ["admin-service-areas", tenant?.id],
    queryFn: () => fetchServiceAreas(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["admin-services", tenant?.id],
    queryFn: () => fetchAllServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  const addMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("service_areas").insert({
        tenant_id: tenant!.id,
        city: form.city,
        city_slug: form.city_slug,
        service_id: form.service_id,
        is_primary: form.is_primary,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-areas"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-service-areas"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-service-areas"] });
    },
  });

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  // Group areas by service
  const grouped = services.map((s) => ({
    service: s,
    areas: areas.filter((a) => a.service_id === s.id),
  }));

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Zones d'intervention"
        description="Gérez les villes couvertes par chaque service"
        actions={
          <Button onClick={() => setIsDialogOpen(true)} disabled={services.length === 0}>
            <Plus className="h-4 w-4 mr-1" />Ajouter une ville
          </Button>
        }
      />

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
