import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  fetchPartners,
  insertPartner,
  updatePartner,
  deletePartner,
  reorderPartners,
  type Partner,
} from "@/lib/partners";
import {
  validateImageFile,
  buildMediaPath,
  uploadImage,
  bucketPublicUrl,
  removeStorageFile,
  extractMediaPathFromPublicUrl,
} from "@/lib/media-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Image as ImageIcon, GripVertical, ExternalLink } from "lucide-react";

type Draft = Partial<Partner> & { name: string };

interface Props {
  tenantId: string;
}

export function PartnersManager({ tenantId }: Props) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: fetched = [], isLoading } = useQuery({
    queryKey: ["partners", tenantId],
    queryFn: () => fetchPartners(tenantId),
    enabled: !!tenantId,
  });

  // Local order state (for optimistic drag & drop)
  const [order, setOrder] = useState<Partner[]>([]);
  useEffect(() => setOrder(fetched), [fetched]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const reorderMutation = useMutation({
    mutationFn: (ids: string[]) => reorderPartners(ids),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["public-partners", tenantId] });
    },
    onError: (e: Error) => toast.error(e.message),
  });

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIndex = order.findIndex((p) => p.id === active.id);
    const newIndex = order.findIndex((p) => p.id === over.id);
    const next = arrayMove(order, oldIndex, newIndex);
    setOrder(next);
    reorderMutation.mutate(next.map((p) => p.id));
  }

  const saveMutation = useMutation({
    mutationFn: async (draft: Draft) => {
      if (draft.id) {
        await updatePartner(draft.id, {
          name: draft.name,
          logo_url: draft.logo_url ?? null,
          website_url: draft.website_url ?? null,
          sort_order: draft.sort_order ?? 0,
          is_active: draft.is_active ?? true,
        });
      } else {
        await insertPartner({
          tenant_id: tenantId,
          name: draft.name,
          logo_url: draft.logo_url ?? null,
          website_url: draft.website_url ?? null,
          sort_order: draft.sort_order ?? order.length,
          is_active: draft.is_active ?? true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["public-partners", tenantId] });
      setOpen(false);
      setEditing(null);
      toast.success("Partenaire enregistré");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (p: Partner) => {
      await deletePartner(p.id);
      const path = extractMediaPathFromPublicUrl(p.logo_url ?? "");
      if (path) await removeStorageFile("media", path);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["partners", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["public-partners", tenantId] });
      toast.success("Partenaire supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    try {
      setUploading(true);
      const path = buildMediaPath({
        scope: tenantId,
        kind: "partner",
        file,
        subFolder: "partners",
      });
      await uploadImage({ bucket: "media", path, file });
      const url = bucketPublicUrl("media", path);
      const prevPath = extractMediaPathFromPublicUrl(editing?.logo_url ?? "");
      if (prevPath) await removeStorageFile("media", prevPath);
      setEditing((p) => (p ? { ...p, logo_url: url } : p));
      toast.success("Logo uploadé");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function openNew() {
    setEditing({
      name: "",
      logo_url: null,
      website_url: null,
      sort_order: order.length,
      is_active: true,
    });
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Logos partenaires</h3>
          <p className="text-xs text-muted-foreground">
            Glissez-déposez pour réordonner. La bannière est masquée si aucun partenaire actif.
          </p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : order.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Aucun partenaire pour le moment.
          </CardContent>
        </Card>
      ) : (
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={order.map((p) => p.id)} strategy={verticalListSortingStrategy}>
            <div className="space-y-2">
              {order.map((p) => (
                <SortableRow
                  key={p.id}
                  partner={p}
                  onEdit={() => {
                    setEditing({ ...p });
                    setOpen(true);
                  }}
                  onDelete={() => {
                    if (confirm(`Supprimer ${p.name} ?`)) deleteMutation.mutate(p);
                  }}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier le partenaire" : "Nouveau partenaire"}</DialogTitle>
          </DialogHeader>
          {editing && (
            <form
              className="space-y-4"
              onSubmit={(e) => {
                e.preventDefault();
                saveMutation.mutate(editing);
              }}
            >
              <div className="space-y-2">
                <Label>Logo (PNG, JPEG ou SVG)</Label>
                {editing.logo_url ? (
                  <div className="flex h-24 w-full items-center justify-center rounded-md border bg-muted/30 p-3">
                    <img
                      src={editing.logo_url}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>
                ) : (
                  <div className="flex h-24 w-full items-center justify-center rounded-md border border-dashed bg-muted/20">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/png,image/jpeg,image/svg+xml"
                  className="hidden"
                  onChange={handleFile}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                  disabled={uploading}
                >
                  {uploading ? "Upload…" : editing.logo_url ? "Remplacer le logo" : "Choisir un logo"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Nom de la marque *</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing((p) => (p ? { ...p, name: e.target.value } : p))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Site web (optionnel)</Label>
                <Input
                  type="url"
                  placeholder="https://…"
                  value={editing.website_url ?? ""}
                  onChange={(e) =>
                    setEditing((p) => (p ? { ...p, website_url: e.target.value || null } : p))
                  }
                />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label className="text-sm">Actif</Label>
                  <p className="text-xs text-muted-foreground">Affiché sur la bannière publique.</p>
                </div>
                <Switch
                  checked={editing.is_active ?? true}
                  onCheckedChange={(v) => setEditing((p) => (p ? { ...p, is_active: v } : p))}
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Annuler
                </Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function SortableRow({
  partner,
  onEdit,
  onDelete,
}: {
  partner: Partner;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: partner.id,
  });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-3 rounded-md border bg-card p-3"
    >
      <button
        type="button"
        className="cursor-grab touch-none text-muted-foreground hover:text-foreground"
        {...attributes}
        {...listeners}
        aria-label="Réordonner"
      >
        <GripVertical className="h-4 w-4" />
      </button>

      <div className="flex h-12 w-20 shrink-0 items-center justify-center rounded bg-muted/40 p-1">
        {partner.logo_url ? (
          <img
            src={partner.logo_url}
            alt={partner.name}
            loading="lazy"
            decoding="async"
            className="max-h-full max-w-full object-contain"
          />
        ) : (
          <ImageIcon className="h-5 w-5 text-muted-foreground" />
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <p className="truncate text-sm font-medium text-foreground">{partner.name}</p>
          {!partner.is_active && (
            <span className="rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
              Masqué
            </span>
          )}
        </div>
        {partner.website_url && (
          <a
            href={partner.website_url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
          >
            <ExternalLink className="h-3 w-3" />
            <span className="truncate">{partner.website_url}</span>
          </a>
        )}
      </div>

      <div className="flex gap-1">
        <Button variant="ghost" size="sm" onClick={onEdit}>
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-3.5 w-3.5 text-destructive" />
        </Button>
      </div>
    </div>
  );
}
