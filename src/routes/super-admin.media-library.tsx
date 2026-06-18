import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { supabase } from "@/integrations/supabase/client";
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
import { Trash2, Upload, Pencil, Image as ImageIcon, Loader2, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  TRADE_MEDIA_BUCKET,
  tradeMediaPublicUrl,
  type TradeMediaType,
} from "@/lib/trade-media";
import {
  validateImageFile,
  buildMediaPath,
  uploadImage,
  removeStorageFile,
  withCacheBuster,
} from "@/lib/media-upload";
import { getTradeShortName } from "@/lib/trade-wording";

export const Route = createFileRoute("/super-admin/media-library")({
  component: MediaLibraryPage,
});

const MEDIA_TYPES: { value: TradeMediaType; label: string }[] = [
  { value: "hero", label: "Hero" },
  { value: "service_card", label: "Carte service" },
  { value: "proof", label: "Preuve / chantier" },
  { value: "gallery", label: "Galerie" },
];

interface MediaRow {
  id: string;
  trade_template_id: string;
  media_type: TradeMediaType;
  title: string | null;
  image_path: string;
  alt_text: string | null;
  sort_order: number;
  is_active: boolean;
}

function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tradeFilter, setTradeFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [uploadTrade, setUploadTrade] = useState<string>("");
  const [uploadType, setUploadType] = useState<TradeMediaType>("hero");
  const [editing, setEditing] = useState<MediaRow | null>(null);
  const [replacing, setReplacing] = useState<MediaRow | null>(null);
  const replaceInputRef = useRef<HTMLInputElement>(null);

  const { data: trades = [] } = useQuery({
    queryKey: ["trade-templates-with-cat"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trade_templates")
        .select("id, slug, name, sort_order, trade_category_id, trade_categories(name, sort_order)")
        .order("sort_order", { ascending: true })
        .limit(500);
      if (error) throw error;
      return data ?? [];
    },
  });

  const { data: media = [], isLoading } = useQuery({
    queryKey: ["trade-media-library", tradeFilter, typeFilter],
    queryFn: async () => {
      let q = supabase
        .from("trade_media_library")
        .select("*")
        .order("trade_template_id", { ascending: true })
        .order("media_type", { ascending: true })
        .order("sort_order", { ascending: true })
        .limit(1000);
      if (tradeFilter !== "all") q = q.eq("trade_template_id", tradeFilter);
      if (typeFilter !== "all") q = q.eq("media_type", typeFilter as TradeMediaType);
      const { data, error } = await q;
      if (error) throw error;
      return data as MediaRow[];
    },
  });

  const tradeMap = Object.fromEntries(trades.map((t) => [t.id, t]));

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!uploadTrade) throw new Error("Choisis un métier");
      const trade = tradeMap[uploadTrade];
      if (!trade) throw new Error("Métier introuvable");
      const validationErr = validateImageFile(file);
      if (validationErr) throw new Error(validationErr);

      const path = buildMediaPath({ scope: trade.slug, kind: uploadType, file });
      await uploadImage({ bucket: TRADE_MEDIA_BUCKET, path, file });

      const { error: insErr } = await supabase.from("trade_media_library").insert({
        trade_template_id: uploadTrade,
        media_type: uploadType,
        image_path: path,
        title: file.name.replace(/\.[^.]+$/, ""),
        alt_text: `${trade.name} — ${uploadType}`,
        sort_order: 0,
        is_active: true,
      });
      if (insErr) {
        // Rollback Storage if DB insert fails — keep bucket in sync with DB
        await removeStorageFile(TRADE_MEDIA_BUCKET, path);
        throw insErr;
      }
    },
    onSuccess: () => {
      toast.success("Image ajoutée");
      queryClient.invalidateQueries({ queryKey: ["trade-media-library"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Échec upload"),
    onSettled: () => setUploading(false),
  });

  // Replace the binary of an existing media row (keeps DB row + alt/title/order).
  // Always uploads to a NEW path so the public URL changes (defeats CDN cache),
  // updates the DB row, then best-effort deletes the old file.
  const replaceMutation = useMutation({
    mutationFn: async ({ row, file }: { row: MediaRow; file: File }) => {
      const validationErr = validateImageFile(file);
      if (validationErr) throw new Error(validationErr);
      const trade = tradeMap[row.trade_template_id];
      const slug = trade?.slug ?? "trade";

      const newPath = buildMediaPath({ scope: slug, kind: row.media_type, file });
      await uploadImage({ bucket: TRADE_MEDIA_BUCKET, path: newPath, file });

      const { error: dbErr } = await supabase
        .from("trade_media_library")
        .update({ image_path: newPath })
        .eq("id", row.id);
      if (dbErr) {
        await removeStorageFile(TRADE_MEDIA_BUCKET, newPath);
        throw dbErr;
      }

      // DB now points at the new file → safe to remove the old one (best-effort)
      if (row.image_path && row.image_path !== newPath) {
        await removeStorageFile(TRADE_MEDIA_BUCKET, row.image_path);
      }
    },
    onSuccess: () => {
      toast.success("Image remplacée");
      queryClient.invalidateQueries({ queryKey: ["trade-media-library"] });
      setReplacing(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Échec remplacement"),
  });

  const updateMutation = useMutation({
    mutationFn: async (row: MediaRow) => {
      const { error } = await supabase
        .from("trade_media_library")
        .update({
          title: row.title,
          alt_text: row.alt_text,
          sort_order: row.sort_order,
          is_active: row.is_active,
        })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Mis à jour");
      queryClient.invalidateQueries({ queryKey: ["trade-media-library"] });
      setEditing(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Échec"),
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase
        .from("trade_media_library")
        .update({ is_active })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["trade-media-library"] }),
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Échec"),
  });

  // Delete: DB row first (controlled, blocking), then best-effort Storage cleanup.
  // If Storage cleanup fails, the row is already gone — UI stays consistent.
  const deleteMutation = useMutation({
    mutationFn: async (row: MediaRow) => {
      const { error } = await supabase.from("trade_media_library").delete().eq("id", row.id);
      if (error) throw error;
      await removeStorageFile(TRADE_MEDIA_BUCKET, row.image_path);
    },
    onSuccess: () => {
      toast.success("Supprimé");
      queryClient.invalidateQueries({ queryKey: ["trade-media-library"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Échec"),
  });

  const onFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    if (!uploadTrade) {
      toast.error("Choisis un métier d'abord");
      return;
    }
    const validationErr = validateImageFile(file);
    if (validationErr) {
      toast.error(validationErr);
      return;
    }
    setUploading(true);
    uploadMutation.mutate(file);
  };

  const onReplaceFileSelected = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !replacing) return;
    replaceMutation.mutate({ row: replacing, file });
  };

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Bibliothèque d'images métier"
        description="Images par défaut affichées sur les sites des tenants qui n'ont pas uploadé leur propre visuel. Privilégier des photos de chantier réelles, jamais d'images génériques."
      />

      {/* Upload */}
      <Card>
        <CardContent className="space-y-4 p-4">
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <Label>Métier</Label>
              <Select value={uploadTrade} onValueChange={setUploadTrade}>
                <SelectTrigger><SelectValue placeholder="Choisir…" /></SelectTrigger>
                <SelectContent>
                  {trades.map((t) => (
                    <SelectItem key={t.id} value={t.id}>
                      {getTradeShortName(t.slug, t.name)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select value={uploadType} onValueChange={(v) => setUploadType(v as TradeMediaType)}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {MEDIA_TYPES.map((t) => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp,image/avif"
                className="hidden"
                onChange={onFileSelected}
              />
              <Button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading || !uploadTrade}
                className="w-full gap-2"
              >
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                {uploading ? "Upload en cours…" : "Uploader une image"}
              </Button>
            </div>
          </div>
          <p className="text-xs text-muted-foreground">
            Formats acceptés : JPG, PNG, WebP, AVIF — max 8 Mo. {trades.length} métiers disponibles.
          </p>
        </CardContent>
      </Card>

      {/* Hidden replace file input */}
      <input
        ref={replaceInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={onReplaceFileSelected}
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <div className="w-56">
          <Label className="text-xs">Filtrer métier</Label>
          <Select value={tradeFilter} onValueChange={setTradeFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les métiers</SelectItem>
              {trades.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {getTradeShortName(t.slug, t.name)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="w-56">
          <Label className="text-xs">Filtrer type</Label>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les types</SelectItem>
              {MEDIA_TYPES.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>


      {/* Grid */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : media.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center gap-3 py-12 text-center text-muted-foreground">
            <ImageIcon className="h-10 w-10" />
            <p>Aucune image. Upload la première pour ce métier.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {media.map((row) => (
            <Card key={row.id} className={row.is_active ? "" : "opacity-60"}>
              <div className="aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                <img
                  src={withCacheBuster(tradeMediaPublicUrl(row.image_path), row.image_path)}
                  alt={row.alt_text ?? ""}
                  className="h-full w-full object-cover"
                  loading="lazy"
                />
              </div>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div className="min-w-0">
                    <div className="truncate text-sm font-medium">{row.title ?? "—"}</div>
                    <div className="truncate text-xs text-muted-foreground">
                      {(() => {
                        const t = tradeMap[row.trade_template_id];
                        return t ? getTradeShortName(t.slug, t.name) : "?";
                      })()}
                    </div>
                  </div>
                  <Badge variant="secondary" className="shrink-0">{row.media_type}</Badge>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Ordre: {row.sort_order}</span>
                  <Switch
                    checked={row.is_active}
                    onCheckedChange={(v) => toggleActive.mutate({ id: row.id, is_active: v })}
                  />
                </div>
                <div className="flex flex-wrap gap-2 pt-1">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => setEditing(row)}>
                    <Pencil className="h-3.5 w-3.5" /> Éditer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1"
                    disabled={replaceMutation.isPending && replacing?.id === row.id}
                    onClick={() => {
                      setReplacing(row);
                      replaceInputRef.current?.click();
                    }}
                  >
                    {replaceMutation.isPending && replacing?.id === row.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RefreshCw className="h-3.5 w-3.5" />
                    )}
                    Remplacer
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      if (confirm("Supprimer cette image ?")) deleteMutation.mutate(row);
                    }}
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Éditer l'image</DialogTitle></DialogHeader>
          {editing && (
            <div className="space-y-3">
              <div>
                <Label>Titre</Label>
                <Input
                  value={editing.title ?? ""}
                  onChange={(e) => setEditing({ ...editing, title: e.target.value })}
                />
              </div>
              <div>
                <Label>Texte alternatif (alt)</Label>
                <Input
                  value={editing.alt_text ?? ""}
                  onChange={(e) => setEditing({ ...editing, alt_text: e.target.value })}
                />
              </div>
              <div>
                <Label>Ordre d'affichage</Label>
                <Input
                  type="number"
                  value={editing.sort_order}
                  onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                />
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={editing.is_active}
                  onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                />
                <Label>Active</Label>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={() => editing && updateMutation.mutate(editing)}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
