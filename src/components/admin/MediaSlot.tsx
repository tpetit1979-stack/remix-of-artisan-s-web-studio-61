/**
 * MediaSlot — composant unique pour gérer une image rattachée à une ligne DB.
 *
 * Couvre upload / aperçu / remplacement / suppression de manière cohérente
 * pour tous les champs image du produit :
 *   - site_settings.logo_url
 *   - site_settings.hero_image_url
 *   - services.image_url
 *   - portfolio.image_url
 *   - tenant_certifications.logo_url
 *
 * Règles appliquées (cf. src/lib/media-upload.ts) :
 *   1. Validation client (type / taille).
 *   2. Path Storage unique et versionné (timestamp).
 *   3. Upload Storage AVANT écriture DB, avec contentType + cacheControl.
 *   4. Si l'écriture DB échoue → rollback Storage du nouveau fichier.
 *   5. Si l'écriture DB réussit → suppression best-effort de l'ancien fichier.
 *   6. Pour la suppression : on met d'abord la colonne DB à null, puis on
 *      nettoie Storage en best-effort.
 *
 * Le parent fournit uniquement :
 *   - la valeur courante (URL publique stockée en DB)
 *   - une fonction `persist(newUrl | null)` qui écrit en DB et renvoie
 *     `{ ok: true }` ou `{ ok: false, error }`.
 *   - le scope Storage (tenant id) et un `kind` (logo/hero/service/...).
 *
 * Aucune logique d'URL n'est dupliquée ailleurs : on passe par les helpers
 * centralisés de `@/lib/media-upload`.
 */
import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, Trash2, ImageOff } from "lucide-react";
import { toast } from "sonner";
import {
  validateImageFile,
  buildMediaPath,
  uploadImage,
  bucketPublicUrl,
  removeStorageFile,
  extractMediaPathFromPublicUrl,
} from "@/lib/media-upload";

export interface MediaSlotProps {
  /** URL publique actuellement stockée en DB (peut être null/vide). */
  value: string | null | undefined;
  /** Scope Storage — généralement le tenant id. */
  scope: string;
  /** Type logique de média (utilisé dans le path Storage). */
  kind: string;
  /** Sous-dossier optionnel sous le scope. */
  subFolder?: string;
  /** Bucket Storage (par défaut "media"). */
  bucket?: string;
  /** Libellé affiché. */
  label: string;
  /** Description courte sous le libellé. */
  hint?: string;
  /** Format d'aperçu. `square` pour logos/certifs, `landscape` pour hero/portfolio. */
  aspect?: "square" | "landscape" | "auto";
  /** Si true, l'image est affichée avec object-contain (logos). Sinon object-cover. */
  contain?: boolean;
  /**
   * Persist en DB. Doit renvoyer `{ ok: true }` si la mise à jour DB réussit,
   * sinon `{ ok: false, error }`. Le composant gère le rollback Storage si
   * l'écriture échoue.
   */
  persist: (nextUrl: string | null) => Promise<{ ok: true } | { ok: false; error: string }>;
  /** Callback optionnel après succès (refetch parent, etc.). */
  onChanged?: (nextUrl: string | null) => void;
  /** Désactive les actions (ex: pendant un autre upload). */
  disabled?: boolean;
}

export function MediaSlot({
  value,
  scope,
  kind,
  subFolder,
  bucket = "media",
  label,
  hint,
  aspect = "landscape",
  contain = false,
  persist,
  onChanged,
  disabled,
}: MediaSlotProps) {
  const [busy, setBusy] = useState<"upload" | "delete" | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const aspectClass =
    aspect === "square"
      ? "aspect-square"
      : aspect === "landscape"
        ? "aspect-video"
        : "min-h-[8rem]";

  async function handleFile(file: File) {
    const err = validateImageFile(file);
    if (err) {
      toast.error(err);
      return;
    }
    setBusy("upload");
    const newPath = buildMediaPath({ scope, kind, file, subFolder });
    try {
      // 1. Upload Storage en premier (avec contentType correct).
      await uploadImage({ bucket, path: newPath, file });
      const newUrl = bucketPublicUrl(bucket, newPath);

      // 2. Écriture DB. Si elle échoue → rollback du nouveau fichier.
      const result = await persist(newUrl);
      if (!result.ok) {
        await removeStorageFile(bucket, newPath);
        toast.error(result.error || "Échec de la sauvegarde en base");
        return;
      }

      // 3. Succès DB → cleanup best-effort de l'ancien fichier Storage.
      const oldPath = extractMediaPathFromPublicUrl(value, bucket);
      if (oldPath && oldPath !== newPath) {
        await removeStorageFile(bucket, oldPath);
      }

      toast.success("Image mise à jour");
      onChanged?.(newUrl);
    } catch (e: any) {
      // Rollback si l'upload a réussi mais qu'une erreur survient ensuite.
      await removeStorageFile(bucket, newPath);
      toast.error(e?.message ?? "Échec de l'upload");
    } finally {
      setBusy(null);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  async function handleDelete() {
    if (!value) return;
    if (!confirm("Supprimer cette image ?")) return;
    setBusy("delete");
    try {
      // 1. Mettre la colonne DB à null en premier (source de vérité).
      const result = await persist(null);
      if (!result.ok) {
        toast.error(result.error || "Échec de la suppression en base");
        return;
      }
      // 2. Cleanup best-effort du fichier Storage.
      const oldPath = extractMediaPathFromPublicUrl(value, bucket);
      if (oldPath) await removeStorageFile(bucket, oldPath);

      toast.success("Image supprimée");
      onChanged?.(null);
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="space-y-2 rounded-lg border bg-card p-3">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-sm font-medium text-foreground">{label}</p>
          {hint && <p className="text-xs text-muted-foreground">{hint}</p>}
        </div>
      </div>

      <div className={`relative w-full overflow-hidden rounded-md bg-muted ${aspectClass}`}>
        {value ? (
          <img
            src={value}
            alt={label}
            className={`h-full w-full ${contain ? "object-contain p-2" : "object-cover"}`}
            loading="lazy"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-muted-foreground">
            <ImageOff className="h-6 w-6" />
          </div>
        )}
        {busy && (
          <div className="absolute inset-0 flex items-center justify-center bg-background/70">
            <Loader2 className="h-5 w-5 animate-spin text-foreground" />
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/avif"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="h-8 text-xs gap-1"
          disabled={disabled || busy !== null}
          onClick={() => inputRef.current?.click()}
        >
          <Upload className="h-3.5 w-3.5" />
          {value ? "Remplacer" : "Uploader"}
        </Button>
        {value && (
          <Button
            type="button"
            size="sm"
            variant="ghost"
            className="h-8 text-xs gap-1 text-destructive hover:text-destructive"
            disabled={disabled || busy !== null}
            onClick={handleDelete}
          >
            <Trash2 className="h-3.5 w-3.5" />
            Supprimer
          </Button>
        )}
      </div>
    </div>
  );
}
