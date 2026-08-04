import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRef, useState } from "react";
import { toast } from "sonner";
import {
  fetchAllBrands,
  insertBrand,
  updateBrand,
  deleteBrand,
  BRAND_CATEGORY_OPTIONS,
  BRAND_TYPE_OPTIONS,
  type Brand,
} from "@/lib/brands";
import {
  validateImageFile,
  buildMediaPath,
  uploadImage,
  removeStorageFile,
  bucketPublicUrl,
} from "@/lib/media-upload";
import { TRADE_MEDIA_BUCKET } from "@/lib/trade-media";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Image as ImageIcon, ExternalLink } from "lucide-react";

export const Route = createFileRoute("/super-admin/brands")({
  component: SuperAdminBrandsPage,
});

type Draft = Partial<Brand> & { name: string };

const NO_CATEGORY = "__none__";

function slugify(input: string): string {
  return input
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function SuperAdminBrandsPage() {
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [editing, setEditing] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);
  const [uploadingLight, setUploadingLight] = useState(false);
  const [uploadingDark, setUploadingDark] = useState(false);
  const lightFileRef = useRef<HTMLInputElement>(null);
  const darkFileRef = useRef<HTMLInputElement>(null);

  const { data: brands = [], isLoading } = useQuery({
    queryKey: ["all-brands"],
    queryFn: fetchAllBrands,
  });

  const filtered = categoryFilter === "all"
    ? brands
    : brands.filter((b) => (b.category ?? NO_CATEGORY) === categoryFilter);

  const saveMutation = useMutation({
    mutationFn: async (draft: Draft) => {
      const payload = {
        name: draft.name.trim(),
        slug: (draft.slug?.trim() || slugify(draft.name)),
        category: draft.category ?? null,
        brand_type: draft.brand_type ?? null,
        logo_url: draft.logo_url ?? null,
        logo_dark_url: draft.logo_dark_url ?? null,
        website_url: draft.website_url?.trim() || null,
        sort_order: draft.sort_order ?? 0,
        is_active: draft.is_active ?? true,
      };
      if (draft.id) {
        await updateBrand(draft.id, payload);
      } else {
        await insertBrand(payload);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-brands"] });
      setOpen(false);
      setEditing(null);
      toast.success("Marque enregistrée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: (b: Brand) => deleteBrand(b.id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["all-brands"] });
      toast.success("Marque supprimée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggleActive = useMutation({
    mutationFn: ({ id, is_active }: { id: string; is_active: boolean }) => updateBrand(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["all-brands"] }),
    onError: (e: Error) => toast.error(e.message),
  });

  async function handleLogoFile(e: React.ChangeEvent<HTMLInputElement>, variant: "light" | "dark") {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const err = validateImageFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    const setUploading = variant === "light" ? setUploadingLight : setUploadingDark;
    try {
      setUploading(true);
      const path = buildMediaPath({
        scope: "brands",
        kind: variant === "light" ? "logo" : "logo-dark",
        file,
      });
      await uploadImage({ bucket: TRADE_MEDIA_BUCKET, path, file });
      const url = bucketPublicUrl(TRADE_MEDIA_BUCKET, path);
      setEditing((p) => (p ? { ...p, [variant === "light" ? "logo_url" : "logo_dark_url"]: url } : p));
      toast.success("Logo uploadé");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
    }
  }

  function openNew() {
    setEditing({
      name: "",
      slug: "",
      category: null,
      brand_type: null,
      logo_url: null,
      logo_dark_url: null,
      website_url: null,
      sort_order: brands.length,
      is_active: true,
    });
    setOpen(true);
  }

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Catalogue des marques"
        description="Marques réutilisables par tous les tenants, tous métiers confondus. Le tenant sélectionne dans ce catalogue -- aucune saisie libre côté client."
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="w-56">
          <Label className="text-xs">Filtrer par catégorie</Label>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Toutes les catégories</SelectItem>
              {BRAND_CATEGORY_OPTIONS.map((c) => (
                <SelectItem key={c} value={c}>{c}</SelectItem>
              ))}
              <SelectItem value={NO_CATEGORY}>— Sans catégorie —</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <Button onClick={openNew} className="gap-1.5">
          <Plus className="h-4 w-4" /> Ajouter une marque
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
            <p>Aucune marque{categoryFilter !== "all" ? " dans cette catégorie" : ""}.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((b) => (
            <Card key={b.id} className={b.is_active ? "" : "opacity-60"}>
              <CardContent className="space-y-3 p-4">
                <div className="flex h-16 items-center justify-center rounded-md bg-muted/40 p-2">
                  {b.logo_url ? (
                    <img src={b.logo_url} alt={b.name} loading="lazy" decoding="async" className="max-h-full max-w-full object-contain" />
                  ) : (
                    <ImageIcon className="h-6 w-6 text-muted-foreground" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="truncate text-sm font-semibold text-foreground">{b.name}</p>
                    {!b.is_active && <Badge variant="secondary" className="text-[10px]">Masquée</Badge>}
                  </div>
                  <div className="mt-1 flex flex-wrap gap-1">
                    {b.category && <Badge variant="outline" className="text-[10px]">{b.category}</Badge>}
                    {b.brand_type && (
                      <Badge variant="outline" className="text-[10px]">
                        {BRAND_TYPE_OPTIONS.find((t) => t.value === b.brand_type)?.label ?? b.brand_type}
                      </Badge>
                    )}
                  </div>
                  {b.website_url && (
                    <a
                      href={b.website_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-primary"
                    >
                      <ExternalLink className="h-3 w-3" /><span className="truncate">{b.website_url}</span>
                    </a>
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Switch checked={b.is_active} onCheckedChange={(v) => toggleActive.mutate({ id: b.id, is_active: v })} />
                    <span className="text-xs text-muted-foreground">Active</span>
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={() => { setEditing({ ...b }); setOpen(true); }}>
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => { if (confirm(`Supprimer ${b.name} ?`)) deleteMutation.mutate(b); }}
                    >
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier la marque" : "Nouvelle marque"}</DialogTitle>
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
                <Label>Nom de la marque *</Label>
                <Input
                  value={editing.name}
                  onChange={(e) => setEditing((p) => (p ? { ...p, name: e.target.value } : p))}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Catégorie</Label>
                  <Select
                    value={editing.category ?? NO_CATEGORY}
                    onValueChange={(v) => setEditing((p) => (p ? { ...p, category: v === NO_CATEGORY ? null : v } : p))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY}>— Aucune —</SelectItem>
                      {BRAND_CATEGORY_OPTIONS.map((c) => (
                        <SelectItem key={c} value={c}>{c}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={editing.brand_type ?? NO_CATEGORY}
                    onValueChange={(v) => setEditing((p) => (p ? { ...p, brand_type: v === NO_CATEGORY ? null : v } : p))}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NO_CATEGORY}>— Aucun —</SelectItem>
                      {BRAND_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Logo (fond clair)</Label>
                  {editing.logo_url ? (
                    <div className="flex h-16 items-center justify-center rounded-md border bg-muted/30 p-2">
                      <img src={editing.logo_url} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-16 items-center justify-center rounded-md border border-dashed bg-muted/20">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <input ref={lightFileRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="hidden" onChange={(e) => handleLogoFile(e, "light")} />
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => lightFileRef.current?.click()} disabled={uploadingLight}>
                    {uploadingLight ? "Upload…" : "Choisir"}
                  </Button>
                </div>
                <div className="space-y-2">
                  <Label>Logo (fond sombre)</Label>
                  {editing.logo_dark_url ? (
                    <div className="flex h-16 items-center justify-center rounded-md border bg-foreground p-2">
                      <img src={editing.logo_dark_url} alt="" className="max-h-full max-w-full object-contain" />
                    </div>
                  ) : (
                    <div className="flex h-16 items-center justify-center rounded-md border border-dashed bg-muted/20">
                      <ImageIcon className="h-5 w-5 text-muted-foreground" />
                    </div>
                  )}
                  <input ref={darkFileRef} type="file" accept="image/png,image/jpeg,image/webp,image/avif" className="hidden" onChange={(e) => handleLogoFile(e, "dark")} />
                  <Button type="button" variant="outline" size="sm" className="w-full" onClick={() => darkFileRef.current?.click()} disabled={uploadingDark}>
                    {uploadingDark ? "Upload…" : "Choisir"}
                  </Button>
                </div>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Le logo fond sombre est optionnel -- utilisé sur les sections à fond foncé pour éviter un logo invisible.
              </p>

              <div className="space-y-2">
                <Label>Site web (optionnel)</Label>
                <Input
                  type="url"
                  placeholder="https://…"
                  value={editing.website_url ?? ""}
                  onChange={(e) => setEditing((p) => (p ? { ...p, website_url: e.target.value || null } : p))}
                />
              </div>

              <div className="space-y-2">
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  value={editing.sort_order ?? 0}
                  onChange={(e) => setEditing((p) => (p ? { ...p, sort_order: Number(e.target.value) } : p))}
                />
              </div>

              <div className="flex items-center justify-between rounded-md border p-3">
                <div>
                  <Label className="text-sm">Active</Label>
                  <p className="text-xs text-muted-foreground">Visible dans la sélection des tenants.</p>
                </div>
                <Switch
                  checked={editing.is_active ?? true}
                  onCheckedChange={(v) => setEditing((p) => (p ? { ...p, is_active: v } : p))}
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saveMutation.isPending}>
                  {saveMutation.isPending ? "Enregistrement…" : "Enregistrer"}
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
