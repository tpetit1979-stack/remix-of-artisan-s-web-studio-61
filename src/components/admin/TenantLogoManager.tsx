import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  validateImageFile, buildMediaPath, uploadImage, bucketPublicUrl,
  removeStorageFile, extractMediaPathFromPublicUrl,
} from "@/lib/media-upload";
import { Loader2, Trash2, Upload, RefreshCw } from "lucide-react";

/**
 * Manages a single tenant's logo end to end: preview, import, replace, delete.
 * Deliberately specialised to `site_settings.logo_url` + the `media` bucket —
 * not a generic media component. `PublicHeader.tsx` reads `logo_url` directly,
 * so every mutation here writes straight to that column, immediately (no
 * dependency on the parent Design form's general "Enregistrer").
 */
interface TenantLogoManagerProps {
  tenantId: string;
  logoUrl: string | null;
  onLogoChange: (url: string | null) => void;
  /** True while the parent's general "Enregistrer" save is in flight — disables
   *  the logo actions so the two never write site_settings concurrently. */
  disabled?: boolean;
  /** Reports whether an upload/delete is in flight, so the parent can disable
   *  its own "Enregistrer" button for the same reason, the other way round. */
  onBusyChange?: (busy: boolean) => void;
}

export function TenantLogoManager({ tenantId, logoUrl, onLogoChange, disabled, onBusyChange }: TenantLogoManagerProps) {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const uploadMutation = useMutation({
    mutationFn: async (file: File) => {
      const validationErr = validateImageFile(file);
      if (validationErr) throw new Error(validationErr);
      const path = buildMediaPath({ scope: tenantId, kind: "logo", file, subFolder: "logo" });
      await uploadImage({ bucket: "media", path, file });
      const url = bucketPublicUrl("media", path);

      const { error } = await supabase.from("site_settings").update({ logo_url: url }).eq("tenant_id", tenantId);
      if (error) {
        await removeStorageFile("media", path);
        throw error;
      }
      // Only delete the previous file if it's one we own (a path inside our
      // bucket) — never touch a manually-pasted external URL.
      const previousPath = extractMediaPathFromPublicUrl(logoUrl, "media");
      if (previousPath) await removeStorageFile("media", previousPath);
      return url;
    },
    onSuccess: (url) => {
      onLogoChange(url);
      queryClient.invalidateQueries({ queryKey: ["sa-settings", tenantId] });
      toast.success("Logo mis à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("site_settings").update({ logo_url: null }).eq("tenant_id", tenantId);
      if (error) throw error;
      const previousPath = extractMediaPathFromPublicUrl(logoUrl, "media");
      if (previousPath) await removeStorageFile("media", previousPath);
    },
    onSuccess: () => {
      onLogoChange(null);
      queryClient.invalidateQueries({ queryKey: ["sa-settings", tenantId] });
      toast.success("Logo supprimé");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const busy = uploadMutation.isPending || deleteMutation.isPending;
  useEffect(() => { onBusyChange?.(busy); }, [busy, onBusyChange]);

  function onFileSelected(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    uploadMutation.mutate(file);
  }

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Logo</Label>
      <div className="flex items-center gap-3">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt="Logo actuel"
            loading="lazy"
            className="h-12 w-12 rounded border bg-muted/30 object-contain p-1"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded border bg-muted/30 text-[10px] text-muted-foreground">
            Aucun
          </div>
        )}
        <div className="flex gap-2">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp,image/avif"
            className="hidden"
            onChange={onFileSelected}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-8 gap-1.5 text-xs"
            disabled={disabled || busy}
            onClick={() => fileInputRef.current?.click()}
          >
            {uploadMutation.isPending ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : logoUrl ? (
              <RefreshCw className="h-3.5 w-3.5" />
            ) : (
              <Upload className="h-3.5 w-3.5" />
            )}
            {logoUrl ? "Remplacer" : "Importer un fichier"}
          </Button>
          {logoUrl && (
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs text-destructive hover:text-destructive"
              disabled={disabled || busy}
              onClick={() => deleteMutation.mutate()}
            >
              {deleteMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Trash2 className="h-3.5 w-3.5" />}
              Supprimer
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
