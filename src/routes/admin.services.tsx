import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminTenant } from "@/hooks/use-tenant";
import { fetchAllServices } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchActiveBrands,
  fetchServiceBrands,
  addServiceBrand,
  removeServiceBrand,
} from "@/lib/brands";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, GripVertical, Camera, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { ServiceMedia } from "@/components/public/ServiceMedia";
import { validateImageFile, buildMediaPath, uploadImage, removeStorageFile } from "@/lib/media-upload";
import { invalidateResolvedMedia } from "@/lib/media-resolver";

export const Route = createFileRoute("/admin/services")({
  component: AdminServices,
});

function AdminServices() {
  const { tenant } = useAdminTenant();
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services", tenant?.id],
    queryFn: () => fetchAllServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  // Which services already have their own uploaded photo (tenant_media,
  // category="service") — level 1 of the resolver. Drives whether each row
  // shows "Remplacer/Retirer" or just "Ajouter une photo".
  const { data: servicePhotos = {} } = useQuery({
    queryKey: ["admin-service-photos", tenant?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_media")
        .select("id, target_id, storage_path")
        .eq("tenant_id", tenant!.id)
        .eq("category", "service")
        .eq("is_active", true);
      if (error) throw error;
      const map: Record<string, { id: string; storage_path: string }> = {};
      for (const row of data ?? []) {
        if (row.target_id) map[row.target_id] = { id: row.id, storage_path: row.storage_path };
      }
      return map;
    },
    enabled: !!tenant?.id,
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ service, file }: { service: any; file: File }) => {
      const validationErr = validateImageFile(file);
      if (validationErr) throw new Error(validationErr);
      const path = buildMediaPath({ scope: tenant!.id, kind: "service", file, subFolder: "services" });
      await uploadImage({ bucket: "media", path, file });
      const { data: pub } = supabase.storage.from("media").getPublicUrl(path);
      const existing = servicePhotos[service.id];
      if (existing) {
        const { error } = await supabase
          .from("tenant_media")
          .update({ storage_path: path, public_url: pub.publicUrl, alt_text: service.name })
          .eq("id", existing.id);
        if (error) throw error;
        await removeStorageFile("media", existing.storage_path);
      } else {
        const { error } = await supabase.from("tenant_media").insert({
          tenant_id: tenant!.id,
          category: "service",
          target_id: service.id,
          storage_path: path,
          public_url: pub.publicUrl,
          alt_text: service.name,
        });
        if (error) throw error;
      }
    },
    onSuccess: (_data, { service }) => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-photos", tenant?.id] });
      invalidateResolvedMedia(queryClient, tenant!.id);
      toast.success(`Photo mise à jour pour "${service.name}"`);
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const removePhotoMutation = useMutation({
    mutationFn: async (service: any) => {
      const existing = servicePhotos[service.id];
      if (!existing) return;
      const { error } = await supabase.from("tenant_media").delete().eq("id", existing.id);
      if (error) throw error;
      await removeStorageFile("media", existing.storage_path);
    },
    onSuccess: (_data, service) => {
      queryClient.invalidateQueries({ queryKey: ["admin-service-photos", tenant?.id] });
      invalidateResolvedMedia(queryClient, tenant!.id);
      toast.success(`Photo retirée pour "${service.name}"`);
    },
    onError: (e: Error) => toast.error(e.message),
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
        title="Mes services"
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
                <ServicePhotoCell
                  service={s}
                  hasOwnPhoto={!!servicePhotos[s.id]}
                  uploading={uploadPhotoMutation.isPending && uploadPhotoMutation.variables?.service.id === s.id}
                  onUpload={(file) => uploadPhotoMutation.mutate({ service: s, file })}
                  onRemove={() => removePhotoMutation.mutate(s)}
                />
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
              {editingService.id ? (
                <ServiceBrandsSection tenantId={tenant.id} serviceId={editingService.id} />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enregistrez le service pour pouvoir y associer des marques.
                </p>
              )}

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

/** Scopes the tenant's brand catalogue selection to one service -- e.g. only
 *  Daikin/Atlantic show up here for "Installation climatisation", never a
 *  poêle brand. Only offers brands the tenant has already picked in "Mes
 *  marques" (admin/brands) -- a service can't surface a brand the tenant
 *  hasn't confirmed working with. */
function ServiceBrandsSection({ tenantId, serviceId }: { tenantId: string; serviceId: string }) {
  const queryClient = useQueryClient();

  const { data: tenantBrandIds = [] } = useQuery({
    queryKey: ["tenant-brand-ids", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenant_brands").select("brand_id").eq("tenant_id", tenantId);
      if (error) throw error;
      return (data ?? []).map((r) => r.brand_id);
    },
  });

  const { data: allBrands = [] } = useQuery({
    queryKey: ["active-brands"],
    queryFn: fetchActiveBrands,
  });

  const { data: serviceBrands = [] } = useQuery({
    queryKey: ["service-brands", serviceId],
    queryFn: () => fetchServiceBrands(serviceId),
  });

  const availableBrands = allBrands.filter((b) => tenantBrandIds.includes(b.id));
  const selectedIds = new Set(serviceBrands.map((sb) => sb.brand_id));

  const toggleMutation = useMutation({
    mutationFn: async ({ brandId, checked }: { brandId: string; checked: boolean }) => {
      if (checked) await addServiceBrand(tenantId, serviceId, brandId);
      else await removeServiceBrand(serviceId, brandId);
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["service-brands", serviceId] }),
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <div className="space-y-2 border-t pt-3">
      <Label>Marques pour ce service</Label>
      {availableBrands.length === 0 ? (
        <p className="text-xs text-muted-foreground">
          Aucune marque sélectionnée dans "Mes marques". Ajoutez-en d'abord pour pouvoir les associer ici.
        </p>
      ) : (
        <div className="grid grid-cols-2 gap-2">
          {availableBrands.map((b) => (
            <label key={b.id} className="flex items-center gap-2 text-sm">
              <Checkbox
                checked={selectedIds.has(b.id)}
                onCheckedChange={(v) => toggleMutation.mutate({ brandId: b.id, checked: !!v })}
              />
              {b.name}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * Thumbnail + upload/remove control for one service row. Shows exactly what
 * the public site currently resolves (ServiceMedia — the same shared
 * component used everywhere, see media-resolver.ts), so "what I see here"
 * is never out of sync with "what the visitor sees". Upload writes to
 * tenant_media (level 1 of the resolver, the highest priority); removing it
 * doesn't touch anything else — the resolver falls back to a linked
 * illustration, then the trade template, then the neutral placeholder.
 */
function ServicePhotoCell({
  service,
  hasOwnPhoto,
  uploading,
  onUpload,
  onRemove,
}: {
  service: any;
  hasOwnPhoto: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
      <ServiceMedia service={service} />
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        disabled={uploading}
        title={hasOwnPhoto ? "Remplacer la photo" : "Ajouter une photo"}
        className="absolute inset-x-0 bottom-0 flex items-center justify-center gap-1 bg-background/90 py-1 text-foreground backdrop-blur-sm transition-colors hover:bg-background disabled:opacity-60"
      >
        <Camera className="h-3.5 w-3.5" />
      </button>
      {hasOwnPhoto && (
        <button
          type="button"
          onClick={onRemove}
          title="Retirer la photo"
          className="absolute right-1 top-1 rounded-full bg-background/90 p-0.5 text-destructive hover:bg-background"
        >
          <X className="h-3 w-3" />
        </button>
      )}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onUpload(file);
          e.target.value = "";
        }}
      />
    </div>
  );
}
