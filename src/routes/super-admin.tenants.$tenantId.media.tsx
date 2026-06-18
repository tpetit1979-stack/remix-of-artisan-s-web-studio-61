/**
 * Super-admin — Médiathèque centralisée d'un tenant.
 *
 * UNE seule page pour gérer toutes les images d'un client :
 *   - Upload multiple (drag & drop)
 *   - Filtres par catégorie (Toutes / Hero / Logo / Services / Portfolio / Certifs)
 *   - Badges 🟢 Personnalisée (tenant_media) / 🔵 Héritée (template métier)
 *   - Édition alt_text inline
 *   - Remplacement / suppression / assignation
 *   - Bouton "Appliquer le template métier" (copie sans écraser les overrides)
 *   - Preview iframe live (split view desktop) qui se rafraîchit via Realtime
 *
 * Source de vérité : table `tenant_media` (+ resolver `useResolvedMedia` côté
 * site public). On n'écrit plus dans site_settings.logo_url / hero_image_url /
 * services.image_url etc. — ces colonnes restent en lecture pour la rétro-compat.
 */
import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { useState, useRef, useCallback, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft, Upload, Trash2, RefreshCw, Sparkles, ImageIcon, Loader2,
  Eye, EyeOff, ExternalLink, AlertTriangle, ArrowUp, ArrowDown,
} from "lucide-react";
import { toast } from "sonner";
import {
  validateImageFile, buildMediaPath, uploadImage, removeStorageFile,
  bucketPublicUrl, extractMediaPathFromPublicUrl,
} from "@/lib/media-upload";
import { invalidateResolvedMedia, type MediaCategory } from "@/lib/media-resolver";

export const Route = createFileRoute("/super-admin/tenants/$tenantId/media")({
  component: TenantMediaPage,
});

/* ────────── Types ────────── */
type TenantMediaRow = {
  id: string;
  tenant_id: string;
  category: string;
  target_id: string | null;
  storage_path: string;
  public_url: string;
  alt_text: string | null;
  sort_order: number | null;
  is_active: boolean | null;
  source_template_media_id: string | null;
};

type TemplateMediaRow = {
  id: string;
  trade_template_id: string;
  media_type: string;
  image_path: string;
  alt_text: string | null;
  sort_order: number;
};

const CATEGORIES: { value: MediaCategory | "all"; label: string }[] = [
  { value: "all", label: "Toutes" },
  { value: "hero", label: "Hero" },
  { value: "logo", label: "Logo" },
  { value: "favicon", label: "Favicon" },
  { value: "service", label: "Services" },
  { value: "portfolio", label: "Portfolio" },
  { value: "certification", label: "Certifications" },
  { value: "gallery", label: "Galerie" },
];

const TENANT_MEDIA_BUCKET = "media";

/* Tenant categories → template media_type used by "Apply template". */
const TEMPLATE_TYPE_FOR: Record<string, string[]> = {
  hero: ["hero"],
  service: ["service_card"],
  portfolio: ["gallery", "proof"],
  certification: ["proof"],
  gallery: ["gallery"],
};

/* ────────── Helpers ────────── */
function categoryLabel(c: string): string {
  return CATEGORIES.find((x) => x.value === c)?.label ?? c;
}

/* ════════════════════════════════════════════════════════
   PAGE
   ════════════════════════════════════════════════════════ */
function TenantMediaPage() {
  const { tenantId } = Route.useParams();
  const qc = useQueryClient();
  const [filter, setFilter] = useState<MediaCategory | "all">("all");
  const [legacyOnly, setLegacyOnly] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const [uploadCategory, setUploadCategory] = useState<MediaCategory>("portfolio");
  const [uploadTargetId, setUploadTargetId] = useState<string>("");
  const [confirmApply, setConfirmApply] = useState(false);

  /* Tenant + related entities for assignment dropdowns */
  const tenantQ = useQuery({
    queryKey: ["sa-tenant", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase.from("tenants").select("*").eq("id", tenantId).maybeSingle();
      if (error) throw error;
      return data;
    },
  });

  const servicesQ = useQuery({
    queryKey: ["sa-services-min", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("services").select("id, name").eq("tenant_id", tenantId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const portfolioQ = useQuery({
    queryKey: ["sa-portfolio-min", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("portfolio").select("id, title").eq("tenant_id", tenantId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const certsQ = useQuery({
    queryKey: ["sa-certs-min", tenantId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tenant_certifications").select("id, certification_name").eq("tenant_id", tenantId)
        .order("certification_name", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  /* Tenant media library */
  const mediaQ = useQuery({
    queryKey: ["sa-tenant-media", tenantId],
    queryFn: async (): Promise<TenantMediaRow[]> => {
      const { data, error } = await supabase
        .from("tenant_media")
        .select("*")
        .eq("tenant_id", tenantId)
        .order("category", { ascending: true })
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return (data ?? []) as TenantMediaRow[];
    },
  });

  /* Trade template media (read-only here, used for "Apply template" + badges) */
  const templateMediaQ = useQuery({
    queryKey: ["sa-template-media", tenantQ.data?.trade_template_id],
    enabled: !!tenantQ.data?.trade_template_id,
    queryFn: async (): Promise<TemplateMediaRow[]> => {
      const { data, error } = await supabase
        .from("public_trade_media")
        .select("id, trade_template_id, media_type, image_path, alt_text, sort_order")
        .eq("trade_template_id", tenantQ.data!.trade_template_id!)
        .order("media_type")
        .order("sort_order");
      if (error) throw error;
      return (data ?? []) as TemplateMediaRow[];
    },
  });

  const tenant = tenantQ.data;
  const media = mediaQ.data ?? [];
  const templateMedia = templateMediaQ.data ?? [];

  const isLegacyRow = useCallback(
    (m: TenantMediaRow) => !m.source_template_media_id && /^https?:\/\//i.test(m.storage_path ?? ""),
    [],
  );

  const filtered = useMemo(() => {
    let list = filter === "all" ? media : media.filter((m) => m.category === filter);
    if (legacyOnly) list = list.filter(isLegacyRow);
    return list;
  }, [media, filter, legacyOnly, isLegacyRow]);

  /* Counts */
  const counts = useMemo(() => {
    const c: Record<string, number> = { all: media.length };
    for (const m of media) c[m.category] = (c[m.category] ?? 0) + 1;
    return c;
  }, [media]);

  const legacyCount = useMemo(() => media.filter(isLegacyRow).length, [media, isLegacyRow]);

  /* Refresh helper used after every mutation */
  const refresh = useCallback(() => {
    qc.invalidateQueries({ queryKey: ["sa-tenant-media", tenantId] });
    invalidateResolvedMedia(qc, tenantId);
  }, [qc, tenantId]);

  /* ────────── Upload (drag & drop + file picker) ────────── */
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);

  const handleFiles = useCallback(
    async (files: File[]) => {
      if (files.length === 0) return;
      if ((uploadCategory === "service" || uploadCategory === "portfolio" || uploadCategory === "certification") && !uploadTargetId) {
        toast.error("Choisissez d'abord la cible (service, réalisation ou certification).");
        return;
      }
      setUploading(true);
      let ok = 0, ko = 0;
      for (const file of files) {
        const err = validateImageFile(file);
        if (err) { toast.error(`${file.name} : ${err}`); ko++; continue; }
        const path = buildMediaPath({
          scope: tenantId,
          kind: uploadCategory,
          file,
          subFolder: "library",
        });
        try {
          await uploadImage({ bucket: TENANT_MEDIA_BUCKET, path, file });
          const publicUrl = bucketPublicUrl(TENANT_MEDIA_BUCKET, path);
          const { error } = await supabase.from("tenant_media").insert({
            tenant_id: tenantId,
            category: uploadCategory,
            target_id: uploadTargetId || null,
            storage_path: path,
            public_url: publicUrl,
            alt_text: file.name.replace(/\.[^.]+$/, ""),
            sort_order: 0,
            is_active: true,
          });
          if (error) {
            await removeStorageFile(TENANT_MEDIA_BUCKET, path);
            throw error;
          }
          ok++;
        } catch (e: any) {
          ko++;
          toast.error(`${file.name} : ${e?.message ?? "upload échoué"}`);
        }
      }
      setUploading(false);
      if (ok > 0) toast.success(`${ok} image${ok > 1 ? "s" : ""} ajoutée${ok > 1 ? "s" : ""}.`);
      refresh();
    },
    [tenantId, uploadCategory, uploadTargetId, refresh],
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
      if (files.length > 0) handleFiles(files);
    },
    [handleFiles],
  );

  /* ────────── Mutations on a single row ────────── */
  const updateMut = useMutation({
    mutationFn: async (vars: { id: string; patch: Partial<TenantMediaRow> }) => {
      const { error } = await supabase
        .from("tenant_media")
        .update(vars.patch as never)
        .eq("id", vars.id);
      if (error) throw error;
    },
    onSuccess: refresh,
    onError: (e: any) => toast.error(e?.message ?? "Mise à jour échouée"),
  });

  const deleteMut = useMutation({
    mutationFn: async (row: TenantMediaRow) => {
      const { error } = await supabase.from("tenant_media").delete().eq("id", row.id);
      if (error) throw error;
      // Best-effort cleanup of the underlying file
      const path = row.storage_path ?? extractMediaPathFromPublicUrl(row.public_url, TENANT_MEDIA_BUCKET);
      await removeStorageFile(TENANT_MEDIA_BUCKET, path);
    },
    onSuccess: () => { toast.success("Image supprimée."); refresh(); },
    onError: (e: any) => toast.error(e?.message ?? "Suppression échouée"),
  });

  /* Swap sort_order between two rows of the same category. */
  const reorderMut = useMutation({
    mutationFn: async (vars: { row: TenantMediaRow; direction: "up" | "down" }) => {
      const { row, direction } = vars;
      const siblings = media
        .filter((m) => m.category === row.category)
        .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id.localeCompare(b.id));
      const idx = siblings.findIndex((m) => m.id === row.id);
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (idx === -1 || swapIdx < 0 || swapIdx >= siblings.length) return;
      const other = siblings[swapIdx];
      const a = row.sort_order ?? 0;
      const b = other.sort_order ?? 0;
      const newA = a === b ? (direction === "up" ? a - 1 : a + 1) : b;
      const newB = a === b ? a : a;
      const [r1, r2] = await Promise.all([
        supabase.from("tenant_media").update({ sort_order: newA }).eq("id", row.id),
        supabase.from("tenant_media").update({ sort_order: newB }).eq("id", other.id),
      ]);
      if (r1.error) throw r1.error;
      if (r2.error) throw r2.error;
    },
    onSuccess: refresh,
    onError: (e: any) => toast.error(e?.message ?? "Réordonnancement échoué"),
  });

  /* ────────── Apply trade template (insert without overwrite) ────────── */
  const applyTemplateMut = useMutation({
    mutationFn: async () => {
      if (!tenant?.trade_template_id) throw new Error("Aucun métier défini pour ce tenant.");
      // For each tenant category that has a template mapping, insert template
      // images that are not already present (matched by source_template_media_id).
      const existingSources = new Set(
        media.map((m) => m.source_template_media_id).filter(Boolean) as string[],
      );

      let inserted = 0;
      for (const [tenantCategory, templateTypes] of Object.entries(TEMPLATE_TYPE_FOR)) {
        for (const mt of templateTypes) {
          const candidates = templateMedia.filter(
            (t) => t.media_type === mt && !existingSources.has(t.id),
          );
          for (const t of candidates) {
            const url = bucketPublicUrl("trade-media", t.image_path);
            const { error } = await supabase.from("tenant_media").insert({
              tenant_id: tenantId,
              category: tenantCategory,
              target_id: null,
              storage_path: t.image_path,        // template path (not in our bucket)
              public_url: url,
              alt_text: t.alt_text,
              sort_order: t.sort_order,
              is_active: true,
              source_template_media_id: t.id,
            });
            if (!error) inserted++;
          }
        }
      }
      return inserted;
    },
    onSuccess: (n) => {
      toast.success(n > 0 ? `${n} image${n > 1 ? "s" : ""} importée${n > 1 ? "s" : ""} du template.` : "Aucune nouvelle image à importer.");
      refresh();
    },
    onError: (e: any) => toast.error(e?.message ?? "Import du template échoué"),
  });

  /* ────────── Render ────────── */
  if (tenantQ.isLoading) return <p className="text-sm text-muted-foreground">Chargement…</p>;
  if (!tenant) {
    return (
      <div className="space-y-3">
        <p className="text-sm text-destructive">Tenant introuvable.</p>
        <Link to="/super-admin/tenants"><Button variant="outline" size="sm">Retour</Button></Link>
      </div>
    );
  }

  const previewHref = tenant.domain ? `https://${tenant.domain}` : `/?tenant=${tenant.slug}`;
  const customCount = media.filter((m) => !m.source_template_media_id).length;
  const inheritedCount = media.length - customCount;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3 flex-wrap">
        <Link to="/super-admin/tenants/$tenantId" params={{ tenantId }}>
          <Button variant="ghost" size="icon" className="shrink-0 h-8 w-8"><ArrowLeft className="h-4 w-4" /></Button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-foreground truncate">Médiathèque — {tenant.company_name}</h1>
          <p className="text-xs text-muted-foreground">
            {media.length} image{media.length > 1 ? "s" : ""} · {customCount} personnalisée{customCount > 1 ? "s" : ""} · {inheritedCount} héritée{inheritedCount > 1 ? "s" : ""}
          </p>
        </div>
        <Button
          variant="outline" size="sm" className="h-8 text-xs gap-1.5"
          onClick={() => setShowPreview((v) => !v)}
        >
          {showPreview ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
          {showPreview ? "Masquer aperçu" : "Afficher aperçu"}
        </Button>
        <Button
          size="sm" className="h-8 text-xs gap-1.5"
          disabled={!tenant.trade_template_id || applyTemplateMut.isPending}
          onClick={() => setConfirmApply(true)}
        >
          {applyTemplateMut.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Sparkles className="h-3.5 w-3.5" />}
          Appliquer template métier
        </Button>
      </div>

      <div className={`grid gap-4 ${showPreview ? "lg:grid-cols-[1fr_420px]" : "grid-cols-1"}`}>
        {/* ────────── Left: library ────────── */}
        <div className="space-y-4 min-w-0">
          {/* Upload zone */}
          <Card>
            <CardContent className="pt-4 space-y-3">
              <div className="grid gap-2 sm:grid-cols-2">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-muted-foreground">Catégorie de l'upload</label>
                  <Select value={uploadCategory} onValueChange={(v) => { setUploadCategory(v as MediaCategory); setUploadTargetId(""); }}>
                    <SelectTrigger className="h-8 text-xs"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {CATEGORIES.filter((c) => c.value !== "all").map((c) => (
                        <SelectItem key={c.value} value={c.value} className="text-xs">{c.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {(uploadCategory === "service" || uploadCategory === "portfolio" || uploadCategory === "certification") && (
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-muted-foreground">Cible</label>
                    <Select value={uploadTargetId} onValueChange={setUploadTargetId}>
                      <SelectTrigger className="h-8 text-xs"><SelectValue placeholder="Choisir…" /></SelectTrigger>
                      <SelectContent>
                        {uploadCategory === "service" && servicesQ.data?.map((s) => (
                          <SelectItem key={s.id} value={s.id} className="text-xs">{s.name}</SelectItem>
                        ))}
                        {uploadCategory === "portfolio" && portfolioQ.data?.map((p) => (
                          <SelectItem key={p.id} value={p.id} className="text-xs">{p.title}</SelectItem>
                        ))}
                        {uploadCategory === "certification" && certsQ.data?.map((c) => (
                          <SelectItem key={c.id} value={c.id} className="text-xs">{c.certification_name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}
              </div>

              <div
                onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                  isDragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"
                }`}
              >
                {uploading ? (
                  <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
                    <Loader2 className="h-4 w-4 animate-spin" /> Upload en cours…
                  </div>
                ) : (
                  <>
                    <Upload className="h-6 w-6 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Glissez vos photos ou cliquez</p>
                    <p className="text-xs text-muted-foreground mt-0.5">JPG, PNG, WebP, AVIF — max 8 Mo / fichier</p>
                  </>
                )}
                <input
                  ref={fileInputRef} type="file" multiple accept="image/*" hidden
                  onChange={(e) => {
                    const files = Array.from(e.target.files ?? []);
                    if (files.length > 0) handleFiles(files);
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Filters */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {CATEGORIES.map((c) => (
              <Button
                key={c.value}
                variant={filter === c.value ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs gap-1"
                onClick={() => setFilter(c.value as MediaCategory | "all")}
              >
                {c.label}
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">
                  {counts[c.value] ?? 0}
                </Badge>
              </Button>
            ))}
            {legacyCount > 0 && (
              <Button
                variant={legacyOnly ? "default" : "outline"}
                size="sm"
                className={`h-7 text-xs gap-1 ${legacyOnly ? "" : "border-amber-500/60 text-amber-700 dark:text-amber-400 hover:bg-amber-500/10"}`}
                onClick={() => setLegacyOnly((v) => !v)}
                title="Afficher uniquement les images issues de la migration (à ré-uploader proprement)"
              >
                <AlertTriangle className="h-3 w-3" />
                Legacy
                <Badge variant="secondary" className="text-[10px] px-1 py-0 h-4">{legacyCount}</Badge>
              </Button>
            )}
          </div>

          {/* Grid */}
          {filtered.length === 0 ? (
            <Card>
              <CardContent className="pt-6 pb-6 text-center text-sm text-muted-foreground">
                <ImageIcon className="h-8 w-8 mx-auto mb-2 opacity-40" />
                Aucune image dans cette catégorie. Uploadez ou appliquez le template métier.
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-3 grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
              {filtered.map((row) => {
                const siblings = media
                  .filter((m) => m.category === row.category)
                  .sort((a, b) => (a.sort_order ?? 0) - (b.sort_order ?? 0) || a.id.localeCompare(b.id));
                const idx = siblings.findIndex((m) => m.id === row.id);
                const canMoveUp = idx > 0;
                const canMoveDown = idx >= 0 && idx < siblings.length - 1;
                return (
                  <MediaCard
                    key={row.id}
                    row={row}
                    services={servicesQ.data ?? []}
                    portfolio={portfolioQ.data ?? []}
                    certs={certsQ.data ?? []}
                    canMoveUp={canMoveUp}
                    canMoveDown={canMoveDown}
                    onMove={(direction) => reorderMut.mutate({ row, direction })}
                    onUpdate={(patch) => updateMut.mutate({ id: row.id, patch })}
                    onDelete={() => deleteMut.mutate(row)}
                    onReplace={async (file) => {
                      const err = validateImageFile(file);
                      if (err) { toast.error(err); return; }
                      const path = buildMediaPath({ scope: tenantId, kind: row.category, file, subFolder: "library" });
                      try {
                        await uploadImage({ bucket: TENANT_MEDIA_BUCKET, path, file });
                        const publicUrl = bucketPublicUrl(TENANT_MEDIA_BUCKET, path);
                        const oldPath = row.storage_path;
                        const isOldFromOurBucket = !row.source_template_media_id;
                        await updateMut.mutateAsync({
                          id: row.id,
                          patch: {
                            storage_path: path,
                            public_url: publicUrl,
                            source_template_media_id: null, // becomes a custom override
                          },
                        });
                        if (isOldFromOurBucket) await removeStorageFile(TENANT_MEDIA_BUCKET, oldPath);
                        toast.success("Image remplacée.");
                      } catch (e: any) {
                        await removeStorageFile(TENANT_MEDIA_BUCKET, path);
                        toast.error(e?.message ?? "Remplacement échoué");
                      }
                    }}
                  />
                );
              })}
            </div>
          )}
        </div>

        {/* ────────── Right: live preview ────────── */}
        {showPreview && (
          <aside className="space-y-2 lg:sticky lg:top-4 lg:self-start">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-sm font-semibold text-foreground">Aperçu live</h2>
              <a href={previewHref} target="_blank" rel="noopener noreferrer">
                <Button variant="ghost" size="sm" className="h-7 text-xs gap-1">
                  Ouvrir <ExternalLink className="h-3 w-3" />
                </Button>
              </a>
            </div>
            <div className="rounded-lg border bg-muted/20 overflow-hidden">
              <iframe
                key={mediaQ.dataUpdatedAt /* refresh on every mutation */}
                src={previewHref}
                title="Aperçu du site"
                className="w-full h-[600px] bg-white"
                sandbox="allow-same-origin allow-scripts"
              />
            </div>
            <p className="text-[10px] text-muted-foreground">
              L'aperçu se rafraîchit automatiquement après chaque modification.
            </p>
          </aside>
        )}
      </div>

      {/* Confirm apply template */}
      <AlertDialog open={confirmApply} onOpenChange={setConfirmApply}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Appliquer le template métier ?</AlertDialogTitle>
            <AlertDialogDescription>
              Les images du template seront copiées dans la médiathèque sans écraser les personnalisations existantes. Vous pourrez ensuite les supprimer ou les remplacer une par une.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => { setConfirmApply(false); applyTemplateMut.mutate(); }}
            >
              Appliquer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

/* ════════════════════════════════════════════════════════
   MEDIA CARD
   ════════════════════════════════════════════════════════ */
function MediaCard({
  row, services, portfolio, certs,
  canMoveUp, canMoveDown, onMove,
  onUpdate, onDelete, onReplace,
}: {
  row: TenantMediaRow;
  services: { id: string; name: string }[];
  portfolio: { id: string; title: string }[];
  certs: { id: string; certification_name: string }[];
  canMoveUp: boolean;
  canMoveDown: boolean;
  onMove: (direction: "up" | "down") => void;
  onUpdate: (patch: Partial<TenantMediaRow>) => void;
  onDelete: () => void;
  onReplace: (file: File) => void | Promise<void>;
}) {
  const [alt, setAlt] = useState(row.alt_text ?? "");
  const [confirmDel, setConfirmDel] = useState(false);
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const isCustom = !row.source_template_media_id;
  // Legacy = backfilled row whose storage_path is an external URL (http…),
  // not a real object inside the `media` bucket. Encourage re-upload to
  // get a clean, cache-busted, owned asset.
  const isLegacy = isCustom && /^https?:\/\//i.test(row.storage_path ?? "");

  const targetOptions = useMemo(() => {
    if (row.category === "service") return services.map((s) => ({ id: s.id, label: s.name }));
    if (row.category === "portfolio") return portfolio.map((p) => ({ id: p.id, label: p.title }));
    if (row.category === "certification") return certs.map((c) => ({ id: c.id, label: c.certification_name }));
    return [];
  }, [row.category, services, portfolio, certs]);

  const isActive = row.is_active !== false;

  return (
    <Card className={`overflow-hidden group ${isActive ? "" : "opacity-60"}`}>
      <div className="relative aspect-[4/3] bg-muted">
        <img
          src={row.public_url}
          alt={row.alt_text ?? ""}
          className={`w-full h-full object-cover ${isActive ? "" : "grayscale"}`}
          loading="lazy"
        />
        <div className="absolute top-1.5 left-1.5 flex flex-wrap gap-1">
          <Badge
            className={`text-[10px] px-1.5 py-0 h-5 ${
              isCustom
                ? "bg-emerald-500/90 hover:bg-emerald-500 text-white border-transparent"
                : "bg-blue-500/90 hover:bg-blue-500 text-white border-transparent"
            }`}
          >
            {isCustom ? "🟢 Personnalisée" : "🔵 Template"}
          </Badge>
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-5">
            {categoryLabel(row.category)}
          </Badge>
          {!isActive && (
            <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-5 bg-background/90">
              Masquée
            </Badge>
          )}
          {isLegacy && (
            <Badge
              className="text-[10px] px-1.5 py-0 h-5 bg-amber-500/90 hover:bg-amber-500 text-white border-transparent"
              title="Image issue de la migration. Cliquez sur Remplacer pour la ré-uploader proprement dans le bucket media."
            >
              ⚠️ Legacy
            </Badge>
          )}
        </div>
        {/* Reorder arrows */}
        <div className="absolute top-1.5 right-1.5 flex flex-col gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button
            variant="secondary" size="icon" className="h-6 w-6"
            disabled={!canMoveUp}
            onClick={() => onMove("up")}
            title="Monter"
          >
            <ArrowUp className="h-3 w-3" />
          </Button>
          <Button
            variant="secondary" size="icon" className="h-6 w-6"
            disabled={!canMoveDown}
            onClick={() => onMove("down")}
            title="Descendre"
          >
            <ArrowDown className="h-3 w-3" />
          </Button>
        </div>
      </div>
      <CardContent className="p-2 space-y-2">
        <Input
          value={alt}
          onChange={(e) => setAlt(e.target.value)}
          onBlur={() => { if (alt !== (row.alt_text ?? "")) onUpdate({ alt_text: alt }); }}
          placeholder="Texte alternatif (SEO + accessibilité)"
          className="h-7 text-xs"
        />
        {targetOptions.length > 0 && (
          <Select
            value={row.target_id ?? "none"}
            onValueChange={(v) => onUpdate({ target_id: v === "none" ? null : v })}
          >
            <SelectTrigger className="h-7 text-xs"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="none" className="text-xs">— Non assignée —</SelectItem>
              {targetOptions.map((o) => (
                <SelectItem key={o.id} value={o.id} className="text-xs">{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
        <div className="flex items-center gap-1">
          <Button
            variant="outline" size="sm" className="h-7 text-[10px] flex-1 gap-1"
            onClick={() => replaceInputRef.current?.click()}
          >
            <RefreshCw className="h-3 w-3" /> Remplacer
          </Button>
          <Button
            variant="outline" size="sm" className="h-7 w-7 p-0"
            onClick={() => onUpdate({ is_active: !isActive })}
            title={isActive ? "Masquer du site public" : "Réafficher sur le site public"}
          >
            {isActive ? <Eye className="h-3 w-3" /> : <EyeOff className="h-3 w-3" />}
          </Button>
          <Button
            variant="outline" size="sm" className="h-7 w-7 p-0 text-destructive hover:text-destructive"
            onClick={() => setConfirmDel(true)}
            title="Supprimer"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
          <input
            ref={replaceInputRef} type="file" accept="image/*" hidden
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onReplace(f);
              if (replaceInputRef.current) replaceInputRef.current.value = "";
            }}
          />
        </div>
      </CardContent>

      <AlertDialog open={confirmDel} onOpenChange={setConfirmDel}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer cette image ?</AlertDialogTitle>
            <AlertDialogDescription>
              {isCustom
                ? "Cette image personnalisée sera définitivement supprimée. Le site retombera sur le template métier si disponible."
                : "Cette image héritée du template sera retirée de ce tenant. Vous pourrez la réimporter via 'Appliquer template métier'."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => { setConfirmDel(false); onDelete(); }}>
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
