import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { fetchAllServices } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import {
  fetchActiveBrands,
  fetchServiceBrands,
  addServiceBrand,
  removeServiceBrand,
} from "@/lib/brands";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Plus, Pencil, Trash2, Camera } from "lucide-react";
import { getServiceIcon } from "@/components/public/ServiceMedia";
import { validateImageFile, buildMediaPath, uploadImage, removeStorageFile } from "@/lib/media-upload";
import { invalidateResolvedMedia, useResolvedMedia } from "@/lib/media-resolver";

/**
 * Unique interface for managing a tenant's services — used by the client
 * (`/admin/services`) and by the Super Admin (`super-admin.tenants.$tenantId.tsx`,
 * onglet "Services"), at whatever rights each caller resolves. Same component,
 * same behavior, same queryKey (`admin-services`, `admin-service-photos`) —
 * only `tenantId` changes between call sites. See docs/product/constitution.md,
 * principe 3.
 *
 * `canEditAdvancedFields` (Super Admin only, Lot 8A) gates Slug / Ordre
 * d'affichage / templates SEO — technical fields that can break a published
 * URL or SEO structure if touched without understanding the consequence.
 * The tenant still gets a working slug (auto-generated from the name) and a
 * sensible sort_order (append at the end) — they just don't see or edit the
 * raw values. See docs/product/execution-backlog.md, Lot 8.
 *
 * `tradeTemplateId` (the tenant's own trade, e.g. "chauffagiste" — distinct
 * from a service's own `trade_service_template_id`) is required to resolve
 * a service's real photo. This component deliberately does NOT use
 * `ServiceMedia`/`useTenant()` for that — `useTenant()` is disabled on
 * /admin and /super-admin by design (hooks/use-tenant.tsx), so it always
 * resolves to the placeholder here. Both call sites already hold their
 * tenant row (`useAdminTenant()` / the Super Admin's own `tenant` query),
 * so this is passed explicitly — no new query, no implicit "current tenant"
 * guess, same `useResolvedMedia`/`resolveMedia` as the public site.
 */
export function ServicesManager({
  tenantId,
  tradeTemplateId,
  canEditAdvancedFields = false,
}: {
  tenantId: string;
  tradeTemplateId?: string | null;
  canEditAdvancedFields?: boolean;
}) {
  const queryClient = useQueryClient();
  const [editingService, setEditingService] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingService, setDeletingService] = useState<any>(null);

  const { data: services = [], isLoading } = useQuery({
    queryKey: ["admin-services", tenantId],
    queryFn: () => fetchAllServices(tenantId),
  });

  // Which services already have their own uploaded photo (tenant_media,
  // category="service") — level 1 of the resolver. Drives whether the photo
  // field in the edit dialog shows "Remplacer/Retirer" or "Ajouter une photo".
  const { data: servicePhotos = {} } = useQuery({
    queryKey: ["admin-service-photos", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_media")
        .select("id, target_id, storage_path")
        .eq("tenant_id", tenantId)
        .eq("category", "service")
        .eq("is_active", true);
      if (error) throw error;
      const map: Record<string, { id: string; storage_path: string }> = {};
      for (const row of data ?? []) {
        if (row.target_id) map[row.target_id] = { id: row.id, storage_path: row.storage_path };
      }
      return map;
    },
  });

  const uploadPhotoMutation = useMutation({
    mutationFn: async ({ service, file }: { service: any; file: File }) => {
      const validationErr = validateImageFile(file);
      if (validationErr) throw new Error(validationErr);
      const path = buildMediaPath({ scope: tenantId, kind: "service", file, subFolder: "services" });
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
          tenant_id: tenantId,
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
      queryClient.invalidateQueries({ queryKey: ["admin-service-photos", tenantId] });
      invalidateResolvedMedia(queryClient, tenantId);
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
      queryClient.invalidateQueries({ queryKey: ["admin-service-photos", tenantId] });
      invalidateResolvedMedia(queryClient, tenantId);
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
          tenant_id: tenantId,
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
      queryClient.invalidateQueries({ queryKey: ["admin-services", tenantId] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-services", tenantId] });
      toast.success("Service supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
    onSettled: () => setDeletingService(null),
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
      .replace(/[̀-ͯ]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{services.length} service(s)</p>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : services.length === 0 ? (
        <Card><CardContent className="py-8 text-center text-muted-foreground">Aucun service. Cliquez sur "Ajouter" pour commencer.</CardContent></Card>
      ) : (
        <div className="space-y-3">
          {services.map((s) => (
            <Card key={s.id}>
              <CardContent className="flex items-center gap-4 py-4">
                <button
                  type="button"
                  onClick={() => openEdit(s)}
                  title="Modifier le service"
                  className="relative h-16 w-20 shrink-0 overflow-hidden rounded-md border border-border bg-muted transition-opacity hover:opacity-80"
                >
                  <ResolvedServiceImage tenantId={tenantId} tradeTemplateId={tradeTemplateId} service={s} />
                </button>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-foreground">{s.name}</span>
                    {s.is_featured && (
                      <span className="rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">En vedette</span>
                    )}
                    {!s.is_active && (
                      <span className="rounded bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">Masqué</span>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground truncate">{s.description || "Pas de description"}</p>
                </div>
                <div className="flex gap-1 shrink-0">
                  <Button variant="ghost" size="icon" onClick={() => openEdit(s)} aria-label={`Modifier ${s.name}`}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    aria-label={`Supprimer ${s.name}`}
                    onClick={() => setDeletingService(s)}
                  >
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingService} onOpenChange={(open) => !open && setDeletingService(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {deletingService?.name} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action retire aussi ses zones et ses marques associées, définitivement.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingService && deleteMutation.mutate(deletingService.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              {editingService.id ? (
                <ServicePhotoField
                  tenantId={tenantId}
                  tradeTemplateId={tradeTemplateId}
                  service={editingService}
                  hasOwnPhoto={!!servicePhotos[editingService.id]}
                  uploading={uploadPhotoMutation.isPending && uploadPhotoMutation.variables?.service.id === editingService.id}
                  onUpload={(file) => uploadPhotoMutation.mutate({ service: editingService, file })}
                  onRemove={() => removePhotoMutation.mutate(editingService)}
                />
              ) : (
                <p className="text-xs text-muted-foreground">
                  Enregistrez le service pour pouvoir y ajouter une photo.
                </p>
              )}

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
                <Label>Description</Label>
                <Textarea
                  value={editingService.description ?? ""}
                  onChange={(e) => setEditingService((prev: any) => ({ ...prev, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="flex items-center gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Switch
                      checked={editingService.is_active ?? true}
                      onCheckedChange={(v) => setEditingService((prev: any) => ({ ...prev, is_active: v }))}
                    />
                    <Label>Publié sur le site</Label>
                  </div>
                </div>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Visible par vos visiteurs et référencé dans le plan du site. Décochez pour le masquer sans le supprimer.
              </p>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editingService.is_featured ?? false}
                  onCheckedChange={(v) => setEditingService((prev: any) => ({ ...prev, is_featured: v }))}
                />
                <Label>En vedette</Label>
              </div>
              <p className="text-xs text-muted-foreground -mt-2">
                Affiché en priorité parmi les services présentés sur votre page d'accueil.
              </p>

              {canEditAdvancedFields && (
                <div className="space-y-4 border-t pt-4">
                  <p className="text-xs font-medium text-muted-foreground">Options avancées (Super Admin)</p>
                  <div className="space-y-2">
                    <Label>Slug (URL)</Label>
                    <Input
                      value={editingService.slug}
                      onChange={(e) => setEditingService((prev: any) => ({ ...prev, slug: e.target.value }))}
                      required
                    />
                    {editingService.id && (
                      <p className="text-xs text-destructive">
                        Modifier le slug change l'URL déjà publiée de ce service.
                      </p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label>Ordre d'affichage</Label>
                    <Input
                      type="number"
                      value={editingService.sort_order ?? 0}
                      onChange={(e) => setEditingService((prev: any) => ({ ...prev, sort_order: parseInt(e.target.value) || 0 }))}
                    />
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
                </div>
              )}

              {editingService.id ? (
                <ServiceBrandsSection tenantId={tenantId} serviceId={editingService.id} />
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
 * Renders exactly what the public resolver would show for this service —
 * same `useResolvedMedia`/`resolveMedia` as `ServiceMedia` (media-resolver.ts
 * untouched), fed with explicit `tenantId`/`tradeTemplateId` props instead of
 * `useTenant()` (disabled on /admin and /super-admin, see ServicesManager's
 * own doc comment). The per-métier placeholder icon is the same
 * `getServiceIcon` the public site uses (exported from ServiceMedia.tsx for
 * this reason) — no separate icon logic to drift out of sync.
 */
function ResolvedServiceImage({
  tenantId,
  tradeTemplateId,
  service,
}: {
  tenantId: string;
  tradeTemplateId: string | null | undefined;
  service: any;
}) {
  const resolved = useResolvedMedia({
    tenantId,
    tradeTemplateId: tradeTemplateId ?? null,
    category: "service",
    targetId: service.id,
    altFallback: service.name,
    tradeServiceTemplateId: service.trade_service_template_id ?? null,
  });

  if (resolved.source === "placeholder") {
    const Icon = getServiceIcon(service.name);
    return (
      <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-primary/15 via-primary/5 to-transparent">
        <Icon className="h-6 w-6 text-primary/60" />
      </div>
    );
  }

  return (
    <img
      src={resolved.url}
      alt={resolved.alt}
      className="h-full w-full object-cover"
      loading="lazy"
      decoding="async"
    />
  );
}

const MEDIA_SOURCE_LABEL: Record<string, string> = {
  tenant: "Photo personnalisée",
  template: "Illustration proposée par Lignia",
  placeholder: "Aucune illustration",
};

/**
 * Photo control inside the edit dialog — the single place a service's photo
 * is managed (Lot 8A: the standalone camera icon that used to live on the
 * list row is gone, the list thumbnail is now just a link into this dialog).
 *
 * The label is deliberately generic ("Photo personnalisée", not "Votre
 * photo") because `ResolvedMedia.source === "tenant"` covers both a direct
 * `tenant_media` upload and a linked portfolio illustration — the resolver
 * doesn't distinguish the two, so the label doesn't claim to either.
 */
function ServicePhotoField({
  tenantId,
  tradeTemplateId,
  service,
  hasOwnPhoto,
  uploading,
  onUpload,
  onRemove,
}: {
  tenantId: string;
  tradeTemplateId: string | null | undefined;
  service: any;
  hasOwnPhoto: boolean;
  uploading: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const resolved = useResolvedMedia({
    tenantId,
    tradeTemplateId: tradeTemplateId ?? null,
    category: "service",
    targetId: service.id,
    altFallback: service.name,
    tradeServiceTemplateId: service.trade_service_template_id ?? null,
  });

  return (
    <div className="space-y-2">
      <Label>Photo</Label>
      <div className="flex items-center gap-3">
        <div className="relative h-20 w-28 shrink-0 overflow-hidden rounded-md border border-border bg-muted">
          <ResolvedServiceImage tenantId={tenantId} tradeTemplateId={tradeTemplateId} service={service} />
        </div>
        <div className="flex flex-col gap-2">
          <p className="text-xs text-muted-foreground">{MEDIA_SOURCE_LABEL[resolved.source]}</p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => fileInputRef.current?.click()}
          >
            <Camera className="h-3.5 w-3.5 mr-1.5" />
            {hasOwnPhoto ? "Remplacer la photo" : "Ajouter une photo"}
          </Button>
          {hasOwnPhoto && (
            <Button type="button" variant="ghost" size="sm" className="text-destructive" onClick={onRemove}>
              Retirer la photo
            </Button>
          )}
        </div>
      </div>
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
