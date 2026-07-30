import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef, useMemo } from "react";
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
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Trash2, Upload, Pencil, Image as ImageIcon, Loader2, RefreshCw,
  Check, X, RotateCcw,
} from "lucide-react";
import { toast } from "sonner";
import {
  TRADE_MEDIA_BUCKET,
  tradeMediaPublicUrl,
  MEDIA_TYPE_OPTIONS,
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
import { PixabayImportPanel } from "@/components/admin/PixabayImportPanel";
import type { Tables } from "@/integrations/supabase/types";

export const Route = createFileRoute("/super-admin/media-library")({
  component: MediaLibraryPage,
});

const MEDIA_TYPES = MEDIA_TYPE_OPTIONS;

/** The 4 source_type values a human is ever allowed to pick. `unclassified` and
 *  `legacy_unknown` are backfill/default states only — never a manual choice. */
type TradeMediaSourceType = "licensed_stock" | "ai_generated" | "owned" | "manufacturer_authorized";

const SOURCE_TYPE_OPTIONS: { value: TradeMediaSourceType; label: string; providerRequired: boolean }[] = [
  { value: "owned", label: "Propriété agence / client", providerRequired: false },
  { value: "licensed_stock", label: "Banque sous licence", providerRequired: true },
  { value: "ai_generated", label: "Généré par IA", providerRequired: true },
  { value: "manufacturer_authorized", label: "Fabricant autorisé", providerRequired: true },
];

const APPROVABLE_SOURCE_TYPES = new Set<string>(SOURCE_TYPE_OPTIONS.map((o) => o.value));

const REVIEW_STATUS_META: Record<string, { label: string; className: string }> = {
  pending: { label: "En attente", className: "bg-amber-500/90 hover:bg-amber-500 text-white border-transparent" },
  approved: { label: "Approuvé", className: "bg-emerald-500/90 hover:bg-emerald-500 text-white border-transparent" },
  rejected: { label: "Rejeté", className: "bg-destructive/90 hover:bg-destructive text-white border-transparent" },
};

type MediaRow = Tables<"trade_media_library">;

/** Editing any of these on an already-approved row must revert it to `pending` —
 *  an approved media must never keep being distributed after a substantial change. */
const PENDING_TRIGGER_FIELDS = [
  "source_type", "source_provider", "source_reference", "license_code",
  "author_credit", "trade_template_id", "trade_service_template_id", "media_type",
] as const satisfies readonly (keyof MediaRow)[];

function MediaLibraryPage() {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [tradeFilter, setTradeFilter] = useState<string>("all");
  const [typeFilter, setTypeFilter] = useState<string>("all");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [uploading, setUploading] = useState(false);
  const [uploadTrade, setUploadTrade] = useState<string>("");
  const [uploadType, setUploadType] = useState<TradeMediaType>("hero");
  const [uploadServiceTemplateId, setUploadServiceTemplateId] = useState<string>("none");
  const [uploadSourceType, setUploadSourceType] = useState<TradeMediaSourceType>("owned");
  const [uploadSourceProvider, setUploadSourceProvider] = useState("");
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
    queryKey: ["trade-media-library", tradeFilter, typeFilter, statusFilter],
    queryFn: async (): Promise<MediaRow[]> => {
      let q = supabase
        .from("trade_media_library")
        .select("*")
        .order("trade_template_id", { ascending: true })
        .order("media_type", { ascending: true })
        .order("sort_order", { ascending: true })
        .limit(1000);
      if (tradeFilter !== "all") q = q.eq("trade_template_id", tradeFilter);
      if (typeFilter !== "all") q = q.eq("media_type", typeFilter as TradeMediaType);
      if (statusFilter !== "all") q = q.eq("review_status", statusFilter);
      const { data, error } = await q;
      if (error) throw error;
      return data ?? [];
    },
  });

  // Service templates for the upload form, scoped to the selected trade.
  const { data: uploadServiceTemplates = [] } = useQuery({
    queryKey: ["trade-service-templates-for-upload", uploadTrade],
    enabled: !!uploadTrade,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trade_service_templates")
        .select("id, name")
        .eq("trade_template_id", uploadTrade)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  // Service templates for the edit dialog, reactive to the trade chosen inside the dialog.
  const { data: editServiceTemplates = [] } = useQuery({
    queryKey: ["trade-service-templates-for-edit", editing?.trade_template_id],
    enabled: !!editing?.trade_template_id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trade_service_templates")
        .select("id, name")
        .eq("trade_template_id", editing!.trade_template_id)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const tradeMap = Object.fromEntries(trades.map((t) => [t.id, t]));
  const selectedSourceOption = SOURCE_TYPE_OPTIONS.find((o) => o.value === uploadSourceType)!;

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      if (!uploadTrade) throw new Error("Choisis un métier");
      const trade = tradeMap[uploadTrade];
      if (!trade) throw new Error("Métier introuvable");
      if (selectedSourceOption.providerRequired && !uploadSourceProvider.trim()) {
        throw new Error(`Le fournisseur est obligatoire pour la provenance "${selectedSourceOption.label}"`);
      }
      const validationErr = validateImageFile(file);
      if (validationErr) throw new Error(validationErr);

      const path = buildMediaPath({ scope: trade.slug, kind: uploadType, file });
      await uploadImage({ bucket: TRADE_MEDIA_BUCKET, path, file });

      const { error: insErr } = await supabase.from("trade_media_library").insert({
        trade_template_id: uploadTrade,
        trade_service_template_id: uploadServiceTemplateId === "none" ? null : uploadServiceTemplateId,
        media_type: uploadType,
        image_path: path,
        title: file.name.replace(/\.[^.]+$/, ""),
        alt_text: `${trade.name} — ${uploadType}`,
        sort_order: 0,
        is_active: true,
        source_type: uploadSourceType,
        source_provider: uploadSourceProvider.trim() || null,
        // review_status intentionally omitted: the DB default 'pending' is the
        // only source of truth — approval always happens as an explicit action.
      });
      if (insErr) {
        // Rollback Storage if DB insert fails — keep bucket in sync with DB
        await removeStorageFile(TRADE_MEDIA_BUCKET, path);
        throw insErr;
      }
    },
    onSuccess: () => {
      toast.success("Image ajoutée — en attente d'approbation.");
      queryClient.invalidateQueries({ queryKey: ["trade-media-library"] });
      setUploadSourceProvider("");
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Échec upload"),
    onSettled: () => setUploading(false),
  });

  // Replace the binary of an existing media row (keeps DB row + metadata/order).
  // Always uploads to a NEW path so the public URL changes (defeats CDN cache),
  // updates the DB row, then best-effort deletes the old file. A binary change
  // on an already-approved row reverts it to pending — a swapped image was
  // never reviewed.
  const replaceMutation = useMutation({
    mutationFn: async ({ row, file }: { row: MediaRow; file: File }) => {
      const validationErr = validateImageFile(file);
      if (validationErr) throw new Error(validationErr);
      const trade = tradeMap[row.trade_template_id];
      const slug = trade?.slug ?? "trade";

      const newPath = buildMediaPath({ scope: slug, kind: row.media_type, file });
      await uploadImage({ bucket: TRADE_MEDIA_BUCKET, path: newPath, file });

      const wasApproved = row.review_status === "approved";

      const { error: dbErr } = await supabase
        .from("trade_media_library")
        .update(
          wasApproved
            ? { image_path: newPath, review_status: "pending" }
            : { image_path: newPath },
        )
        .eq("id", row.id);
      if (dbErr) {
        await removeStorageFile(TRADE_MEDIA_BUCKET, newPath);
        throw dbErr;
      }

      // DB now points at the new file → safe to remove the old one (best-effort)
      if (row.image_path && row.image_path !== newPath) {
        await removeStorageFile(TRADE_MEDIA_BUCKET, row.image_path);
      }
      return wasApproved;
    },
    onSuccess: (reverted) => {
      toast.success(reverted ? "Image remplacée — repassée en attente d'approbation." : "Image remplacée");
      queryClient.invalidateQueries({ queryKey: ["trade-media-library"] });
      setReplacing(null);
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Échec remplacement"),
  });

  // Full metadata edit. Any change to a field listed in PENDING_TRIGGER_FIELDS
  // on an already-approved row silently downgrades it back to pending — an
  // approved media must never keep being distributed after a substantial edit.
  const updateMutation = useMutation({
    mutationFn: async (row: MediaRow) => {
      const original = media.find((m) => m.id === row.id) ?? null;
      const touchedPendingField = original
        ? PENDING_TRIGGER_FIELDS.some((f) => original[f] !== row[f])
        : false;
      const shouldRevert = touchedPendingField && original?.review_status === "approved";

      const { error } = await supabase
        .from("trade_media_library")
        .update({
          title: row.title,
          alt_text: row.alt_text,
          sort_order: row.sort_order,
          is_active: row.is_active,
          source_type: row.source_type,
          source_provider: row.source_provider,
          source_reference: row.source_reference,
          license_code: row.license_code,
          author_credit: row.author_credit,
          trade_template_id: row.trade_template_id,
          trade_service_template_id: row.trade_service_template_id,
          media_type: row.media_type,
          ...(shouldRevert ? { review_status: "pending" } : {}),
        })
        .eq("id", row.id);
      if (error) throw error;
      return shouldRevert;
    },
    onSuccess: (reverted) => {
      toast.success(reverted ? "Mis à jour — repassé en attente d'approbation." : "Mis à jour");
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

  // Approve/reject/re-examine only ever touch review_status. The Approve
  // button is disabled client-side when source_type isn't a real provenance
  // (unclassified/legacy_unknown) — the DB CHECK would reject it anyway, but
  // we surface that as a clear UI state rather than a raw SQL error.
  const approveMutation = useMutation({
    mutationFn: async (row: MediaRow) => {
      const { error } = await supabase
        .from("trade_media_library")
        .update({ review_status: "approved" })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Média approuvé — disponible pour le runtime public.");
      queryClient.invalidateQueries({ queryKey: ["trade-media-library"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Échec de l'approbation"),
  });

  const rejectMutation = useMutation({
    mutationFn: async (row: MediaRow) => {
      const { error } = await supabase
        .from("trade_media_library")
        .update({ review_status: "rejected" })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Média rejeté.");
      queryClient.invalidateQueries({ queryKey: ["trade-media-library"] });
    },
    onError: (e: unknown) => toast.error(e instanceof Error ? e.message : "Échec du rejet"),
  });

  const reexamineMutation = useMutation({
    mutationFn: async (row: MediaRow) => {
      const { error } = await supabase
        .from("trade_media_library")
        .update({ review_status: "pending" })
        .eq("id", row.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Média repassé en attente de révision.");
      queryClient.invalidateQueries({ queryKey: ["trade-media-library"] });
    },
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
        description="Images par défaut affichées sur les sites des tenants qui n'ont pas uploadé leur propre visuel. Toute image doit être approuvée avant d'être servie sur un site public."
      />

      {/* Import */}
      <Card>
        <CardContent className="p-4">
          <Tabs defaultValue="manual">
            <TabsList>
              <TabsTrigger value="manual">Import manuel</TabsTrigger>
              <TabsTrigger value="pixabay">Rechercher sur Pixabay</TabsTrigger>
            </TabsList>

            <TabsContent value="manual" className="space-y-4 pt-4">
              <div className="grid gap-3 md:grid-cols-2">
                <div>
                  <Label>Métier</Label>
                  <Select
                    value={uploadTrade}
                    onValueChange={(v) => { setUploadTrade(v); setUploadServiceTemplateId("none"); }}
                  >
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
                <div>
                  <Label>Service (optionnel)</Label>
                  <Select
                    value={uploadServiceTemplateId}
                    onValueChange={setUploadServiceTemplateId}
                    disabled={!uploadTrade}
                  >
                    <SelectTrigger><SelectValue placeholder="Générique métier" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Générique métier —</SelectItem>
                      {uploadServiceTemplates.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Provenance</Label>
                  <Select value={uploadSourceType} onValueChange={(v) => setUploadSourceType(v as TradeMediaSourceType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {SOURCE_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {selectedSourceOption.providerRequired && (
                  <div className="md:col-span-2">
                    <Label>Fournisseur / source {selectedSourceOption.providerRequired && "*"}</Label>
                    <Input
                      value={uploadSourceProvider}
                      onChange={(e) => setUploadSourceProvider(e.target.value)}
                      placeholder={uploadSourceType === "ai_generated" ? "ex. Gemini, Midjourney…" : "ex. Shutterstock, nom du fabricant…"}
                    />
                  </div>
                )}
              </div>
              <div>
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
                  className="gap-2"
                >
                  {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                  {uploading ? "Upload en cours…" : "Uploader une image"}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Formats acceptés : JPG, PNG, WebP, AVIF — max 8 Mo. {trades.length} métiers disponibles.
                Toute image importée reste "En attente" jusqu'à approbation explicite.
              </p>
            </TabsContent>

            <TabsContent value="pixabay" className="pt-4">
              <PixabayImportPanel
                trades={trades}
                onImported={() => queryClient.invalidateQueries({ queryKey: ["trade-media-library"] })}
              />
            </TabsContent>
          </Tabs>
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
      <div id="media-library-grid" className="flex flex-wrap gap-3">
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
        <div className="w-56">
          <Label className="text-xs">Filtrer statut</Label>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les statuts</SelectItem>
              <SelectItem value="pending">En attente</SelectItem>
              <SelectItem value="approved">Approuvés</SelectItem>
              <SelectItem value="rejected">Rejetés</SelectItem>
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
          {media.map((row) => {
            const statusMeta = REVIEW_STATUS_META[row.review_status] ?? REVIEW_STATUS_META.pending;
            const canApprove = APPROVABLE_SOURCE_TYPES.has(row.source_type);
            return (
              <Card key={row.id} className={row.is_active ? "" : "opacity-60"}>
                <div className="relative aspect-video w-full overflow-hidden rounded-t-lg bg-muted">
                  <img
                    src={withCacheBuster(tradeMediaPublicUrl(row.image_path), row.image_path)}
                    alt={row.alt_text ?? ""}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  <Badge className={`absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0 h-5 ${statusMeta.className}`}>
                    {statusMeta.label}
                  </Badge>
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

                  {row.review_status === "pending" && (
                    <div className="space-y-1">
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          className="flex-1 gap-1"
                          disabled={!canApprove || approveMutation.isPending}
                          onClick={() => approveMutation.mutate(row)}
                        >
                          <Check className="h-3.5 w-3.5" /> Approuver
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 gap-1"
                          disabled={rejectMutation.isPending}
                          onClick={() => rejectMutation.mutate(row)}
                        >
                          <X className="h-3.5 w-3.5" /> Rejeter
                        </Button>
                      </div>
                      {!canApprove && (
                        <p className="text-[10px] text-amber-700 dark:text-amber-400">
                          Provenance à préciser (bouton Éditer) avant approbation.
                        </p>
                      )}
                    </div>
                  )}
                  {row.review_status === "rejected" && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full gap-1"
                      disabled={reexamineMutation.isPending}
                      onClick={() => reexamineMutation.mutate(row)}
                    >
                      <RotateCcw className="h-3.5 w-3.5" /> Réexaminer
                    </Button>
                  )}

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
            );
          })}
        </div>
      )}

      {/* Edit dialog */}
      <Dialog open={!!editing} onOpenChange={(o) => !o && setEditing(null)}>
        <DialogContent className="max-h-[90vh] overflow-y-auto">
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
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Ordre d'affichage</Label>
                  <Input
                    type="number"
                    value={editing.sort_order}
                    onChange={(e) => setEditing({ ...editing, sort_order: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-end gap-2 pb-2">
                  <Switch
                    checked={editing.is_active}
                    onCheckedChange={(v) => setEditing({ ...editing, is_active: v })}
                  />
                  <Label>Active</Label>
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Rattachement
                </p>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Métier</Label>
                    <Select
                      value={editing.trade_template_id}
                      onValueChange={(v) => setEditing({ ...editing, trade_template_id: v, trade_service_template_id: null })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
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
                    <Select
                      value={editing.media_type}
                      onValueChange={(v) => setEditing({ ...editing, media_type: v })}
                    >
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MEDIA_TYPES.map((t) => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label>Service (optionnel)</Label>
                  <Select
                    value={editing.trade_service_template_id ?? "none"}
                    onValueChange={(v) => setEditing({ ...editing, trade_service_template_id: v === "none" ? null : v })}
                  >
                    <SelectTrigger><SelectValue placeholder="Générique métier" /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">— Générique métier —</SelectItem>
                      {editServiceTemplates.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="border-t pt-3 space-y-3">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                  Provenance
                </p>
                <div>
                  <Label>Type de provenance</Label>
                  <Select
                    value={APPROVABLE_SOURCE_TYPES.has(editing.source_type) ? editing.source_type : undefined}
                    onValueChange={(v) => setEditing({ ...editing, source_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder={editing.source_type === "legacy_unknown" ? "Provenance historique inconnue" : "Non classée"} />
                    </SelectTrigger>
                    <SelectContent>
                      {SOURCE_TYPE_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {!APPROVABLE_SOURCE_TYPES.has(editing.source_type) && (
                    <p className="mt-1 text-[11px] text-amber-700 dark:text-amber-400">
                      État actuel : {editing.source_type === "legacy_unknown" ? "média historique, provenance non vérifiée" : "non classée"}. Choisis une provenance réelle pour permettre l'approbation.
                    </p>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Fournisseur</Label>
                    <Input
                      value={editing.source_provider ?? ""}
                      onChange={(e) => setEditing({ ...editing, source_provider: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <Label>Référence source</Label>
                    <Input
                      value={editing.source_reference ?? ""}
                      onChange={(e) => setEditing({ ...editing, source_reference: e.target.value || null })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label>Licence</Label>
                    <Input
                      value={editing.license_code ?? ""}
                      onChange={(e) => setEditing({ ...editing, license_code: e.target.value || null })}
                    />
                  </div>
                  <div>
                    <Label>Auteur / crédit</Label>
                    <Input
                      value={editing.author_credit ?? ""}
                      onChange={(e) => setEditing({ ...editing, author_credit: e.target.value || null })}
                    />
                  </div>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Modifier la provenance, le rattachement ou le type d'une image déjà approuvée la repasse automatiquement en attente.
                </p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditing(null)}>Annuler</Button>
            <Button onClick={() => editing && updateMutation.mutate(editing)} disabled={updateMutation.isPending}>
              Enregistrer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
