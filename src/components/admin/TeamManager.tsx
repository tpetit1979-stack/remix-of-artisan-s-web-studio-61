import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { toast } from "sonner";
import {
  fetchTeamMembers,
  insertTeamMember,
  updateTeamMember,
  deleteTeamMember,
  updateTeamPresentationMode,
  type TeamMember,
  type TeamPresentationMode,
} from "@/lib/team";
import { fetchSiteSettings } from "@/lib/tenant";
import {
  validateImageFile,
  buildMediaPath,
  uploadImage,
  bucketPublicUrl,
  removeStorageFile,
  extractMediaPathFromPublicUrl,
} from "@/lib/media-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, User, Lock, AlertTriangle } from "lucide-react";

type Draft = Partial<TeamMember> & { full_name: string; role_title: string };

interface Props {
  tenantId: string;
  /** Only the Super Admin call site sets this — Admin is always read-only. */
  canEditPresentationMode?: boolean;
}

const PRESENTATION_OPTIONS: { value: TeamPresentationMode; label: string }[] = [
  { value: null, label: "Non défini" },
  { value: "artisan", label: "Artisan indépendant" },
  { value: "company", label: "Entreprise" },
  { value: "hidden", label: "Section masquée" },
];

function presentationLabel(mode: TeamPresentationMode): string {
  return PRESENTATION_OPTIONS.find((o) => o.value === mode)?.label ?? "Non défini";
}

/**
 * Shared CRUD UI for `tenant_team_members`. Used by `/admin/team` and the
 * super-admin tenant "Équipe" tab.
 */
export function TeamManager({ tenantId, canEditPresentationMode = false }: Props) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState<Draft | null>(null);
  const [open, setOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const { data: members = [], isLoading } = useQuery({
    queryKey: ["team-members", tenantId],
    queryFn: () => fetchTeamMembers(tenantId),
    enabled: !!tenantId,
  });

  const { data: settings } = useQuery({
    queryKey: ["site-settings-team-mode", tenantId],
    queryFn: () => fetchSiteSettings(tenantId),
    enabled: !!tenantId,
  });

  // See TeamSection.tsx for why this cast is safe: the DB CHECK constraint
  // guarantees only these four values, the generated type is just `string | null`.
  const presentationMode = (settings?.team_presentation_mode ?? null) as TeamPresentationMode;
  const activeMembers = members.filter((m) => m.is_active);

  const presentationMutation = useMutation({
    mutationFn: (mode: TeamPresentationMode) => updateTeamPresentationMode(tenantId, mode),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["site-settings-team-mode", tenantId] });
      toast.success("Présentation mise à jour");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const saveMutation = useMutation({
    mutationFn: async (draft: Draft) => {
      if (draft.id) {
        await updateTeamMember(draft.id, {
          full_name: draft.full_name,
          role_title: draft.role_title,
          photo_url: draft.photo_url ?? null,
          storage_path: draft.storage_path ?? null,
          sort_order: draft.sort_order ?? 0,
          is_active: draft.is_active ?? true,
        });
      } else {
        await insertTeamMember({
          tenant_id: tenantId,
          full_name: draft.full_name,
          role_title: draft.role_title,
          photo_url: draft.photo_url ?? null,
          storage_path: draft.storage_path ?? null,
          sort_order: draft.sort_order ?? members.length,
          is_active: draft.is_active ?? true,
        });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["public-team-members", tenantId] });
      setOpen(false);
      setEditing(null);
      toast.success("Membre enregistré");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (m: TeamMember) => {
      await deleteTeamMember(m.id);
      const path = m.storage_path ?? extractMediaPathFromPublicUrl(m.photo_url ?? "");
      await removeStorageFile("media", path);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["team-members", tenantId] });
      queryClient.invalidateQueries({ queryKey: ["public-team-members", tenantId] });
      toast.success("Membre supprimé");
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
        kind: "member",
        file,
        subFolder: "team",
      });
      await uploadImage({ bucket: "media", path, file });
      const url = bucketPublicUrl("media", path);
      // Clean previous photo if replacing
      const prevPath =
        editing?.storage_path ??
        extractMediaPathFromPublicUrl(editing?.photo_url ?? "");
      if (prevPath) await removeStorageFile("media", prevPath);
      setEditing((p) => (p ? { ...p, photo_url: url, storage_path: path } : p));
      toast.success("Photo uploadée");
    } catch (err) {
      toast.error((err as Error).message);
    } finally {
      setUploading(false);
      if (fileRef.current) fileRef.current.value = "";
    }
  }

  function openNew() {
    setEditing({
      full_name: "",
      role_title: "",
      photo_url: null,
      storage_path: null,
      sort_order: members.length,
      is_active: true,
    });
    setOpen(true);
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm">Présentation publique</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {canEditPresentationMode ? (
            <RadioGroup
              value={presentationMode ?? "unset"}
              onValueChange={(v) =>
                presentationMutation.mutate(v === "unset" ? null : (v as TeamPresentationMode))
              }
            >
              {PRESENTATION_OPTIONS.map((opt) => (
                <div key={opt.label} className="flex items-center gap-2">
                  <RadioGroupItem value={opt.value ?? "unset"} id={`pm-${opt.label}`} />
                  <Label htmlFor={`pm-${opt.label}`} className="font-normal">
                    {opt.label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          ) : (
            <div className="flex items-start gap-2 rounded-md border border-border bg-muted/40 px-3 py-2 text-sm text-muted-foreground">
              <Lock className="h-4 w-4 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {presentationLabel(presentationMode)} — géré par votre agence.
              </span>
            </div>
          )}

          {presentationMode === "artisan" && (
            <p className="text-xs text-muted-foreground">
              En mode Artisan, seule la première personne de la liste (par ordre) est affichée
              publiquement.
            </p>
          )}
          {presentationMode === "artisan" && activeMembers.length > 1 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                {activeMembers.length} membres actifs, mais un seul apparaîtra publiquement en
                mode Artisan.
              </span>
            </div>
          )}
          {presentationMode === null && activeMembers.length > 0 && (
            <div className="flex items-start gap-2 rounded-md border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              <AlertTriangle className="h-3.5 w-3.5 mt-0.5 shrink-0" aria-hidden="true" />
              <span>
                Présentation de l'équipe non définie, alors que {activeMembers.length} membre
                {activeMembers.length > 1 ? "s" : ""} actif{activeMembers.length > 1 ? "s" : ""}{" "}
                existe{activeMembers.length > 1 ? "nt" : ""} — la section publique reste masquée
                en attendant un arbitrage.
              </span>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-foreground">Membres de l'équipe</h3>
          <p className="text-xs text-muted-foreground">
            Affichés sur la page d'accueil. La section est masquée si aucun membre actif.
          </p>
        </div>
        <Button size="sm" onClick={openNew}>
          <Plus className="h-4 w-4 mr-1" /> Ajouter
        </Button>
      </div>

      {isLoading ? (
        <p className="text-sm text-muted-foreground">Chargement…</p>
      ) : members.length === 0 ? (
        <Card>
          <CardContent className="py-6 text-center text-sm text-muted-foreground">
            Aucun membre pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {members.map((m) => (
            <Card key={m.id} className="overflow-hidden">
              <div className="aspect-square bg-muted relative">
                {m.photo_url ? (
                  <img
                    src={m.photo_url}
                    alt={m.full_name}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <User className="h-10 w-10 text-muted-foreground" />
                  </div>
                )}
                {!m.is_active && (
                  <span className="absolute top-2 left-2 rounded bg-foreground/80 px-2 py-0.5 text-[10px] font-medium text-background">
                    Masqué
                  </span>
                )}
              </div>
              <CardContent className="py-3">
                <h4 className="font-medium text-sm text-foreground truncate">{m.full_name}</h4>
                <p className="text-xs text-muted-foreground truncate">{m.role_title}</p>
                <div className="flex gap-1 mt-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setEditing({ ...m });
                      setOpen(true);
                    }}
                  >
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      if (confirm(`Supprimer ${m.full_name} ?`)) deleteMutation.mutate(m);
                    }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing?.id ? "Modifier le membre" : "Nouveau membre"}</DialogTitle>
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
                <Label>Photo (optionnelle)</Label>
                {editing.photo_url && (
                  <img
                    src={editing.photo_url}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-32 w-32 rounded-md object-cover"
                  />
                )}
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/*"
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
                  {uploading ? "Upload…" : editing.photo_url ? "Remplacer la photo" : "Choisir une photo"}
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Nom complet *</Label>
                <Input
                  value={editing.full_name}
                  onChange={(e) => setEditing((p) => (p ? { ...p, full_name: e.target.value } : p))}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Fonction *</Label>
                <Input
                  value={editing.role_title}
                  onChange={(e) => setEditing((p) => (p ? { ...p, role_title: e.target.value } : p))}
                  placeholder="Ex : Artisan ramoneur, Technicien certifié RGE…"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-2">
                  <Label>Ordre</Label>
                  <Input
                    type="number"
                    value={editing.sort_order ?? 0}
                    onChange={(e) =>
                      setEditing((p) =>
                        p ? { ...p, sort_order: parseInt(e.target.value) || 0 } : p,
                      )
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Actif</Label>
                  <div className="flex h-10 items-center">
                    <Switch
                      checked={editing.is_active ?? true}
                      onCheckedChange={(v) =>
                        setEditing((p) => (p ? { ...p, is_active: v } : p))
                      }
                    />
                  </div>
                </div>
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
