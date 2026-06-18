import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTenant } from "@/hooks/use-tenant";
import { fetchAllServices } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/services")({
  component: AdminServices,
});

function AdminServices() {
  const { tenant } = useTenant();
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services", tenant?.id],
    queryFn: () => fetchAllServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  const saveMutation = useMutation({
    mutationFn: async (service: any) => {
      if (service.id) {
        const { error } = await supabase
          .from("services")
          .update({
            name: service.name,
            slug: service.slug,
            description: service.description,
            is_featured: service.is_featured,
            is_active: service.is_active,
            sort_order: service.sort_order,
            seo_title_template: service.seo_title_template,
            seo_description_template: service.seo_description_template,
          })
          .eq("id", service.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("services").insert({
          tenant_id: tenant!.id,
          name: service.name,
          slug: service.slug,
          description: service.description,
          is_featured: service.is_featured ?? false,
          is_active: service.is_active ?? true,
          sort_order: service.sort_order ?? 0,
          seo_title_template: service.seo_title_template,
          seo_description_template: service.seo_description_template,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      setIsDialogOpen(false);
      setEditingService(null);
      toast.success("Service enregistré");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("services").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-services"] });
      toast.success("Service supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setEditingService({
      name: "",
      slug: "",
      description: "",
      is_featured: false,
      is_active: true,
      sort_order: services.length,
      seo_title_template: "",
      seo_description_template: "",
    });
    setIsDialogOpen(true);
  }

  function openEdit(s: any) {
    setEditingService({ ...s });
    setIsDialogOpen(true);
  }

  function generateSlug(name: string) {
    return name
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Services"
        description="Gérez les services proposés"
        actions={<Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>}
      />

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : services.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun service. Cliquez sur "Ajouter" pour commencer.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <GripVertical className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{s.name}</span>
                    {s.is_featured && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">En vedette</span>
                    )}
                    {!s.is_active && (
                      <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Inactif</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{s.description || "Pas de description"}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("Supprimer ce service ?")) deleteMutation.mutate(s.id);
                    }}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingService?.id ? "Modifier le service" : "Nouveau service"}</DialogTitle>
          </DialogHeader>
          {editingService && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(editingService);
              }}
            >
              <div className="space-y-2">
                <Label>Nom</Label>
                <Input
                  value={editingService.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    setEditingService((prev: any) => ({
                      ...prev,
                      name,
                      slug: prev.id ? prev.slug : generateSlug(name),
                    }));
                  }}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Slug (URL)</Label>
                <Input
                  value={editingService.slug}
                  onChange={(e) => setEditingService((prev: any) => ({ ...prev, slug: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingService.description ?? ""}
                  onChange={(e) => setEditingService((prev: any) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  value={editingService.sort_order ?? 0}
                  onChange={(e) => setEditingService((prev: any) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingService.is_active ?? true}
                    onCheckedChange={(v) => setEditingService((prev: any) => ({ ...prev, is_active: v }))}
                  />
                  <Label>Actif</Label>
                </div>
                <div className="flex items-center gap-2">
                  <Switch
                    checked={editingService.is_featured ?? false}
                    onCheckedChange={(v) => setEditingService((prev: any) => ({ ...prev, is_featured: v }))}
                  />
                  <Label>En vedette</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>SEO - Titre template</Label>
                <Input
                  value={editingService.seo_title_template ?? ""}
                  onChange={(e) => setEditingService((prev: any) => ({ ...prev, seo_title_template: e.target.value }))}
                  placeholder="{service} à {city} - {company}"
                />
              </div>
              <div className="space-y-2">
                <Label>SEO - Description template</Label>
                <Textarea
                  value={editingService.seo_description_template ?? ""}
                  onChange={(e) => setEditingService((prev: any) => ({ ...prev, seo_description_template: e.target.value }))}
                  placeholder="{company}, votre expert en {service} à {city}..."
                  rows={2}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
