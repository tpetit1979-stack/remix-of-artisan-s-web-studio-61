import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useState, useRef } from "react";
import { toast } from "sonner";
import { fetchPortfolio, fetchAllServices, fetchServiceAreas } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import {
  validateImageFile,
  buildMediaPath,
  uploadImage,
  bucketPublicUrl,
} from "@/lib/media-upload";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
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
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Plus, Pencil, Trash2, Image as ImageIcon, Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface PortfolioSuggestion {
  id: string;
  title: string | null;
  image_path: string;
  alt_text: string | null;
}

const OTHER_CITY = "__other__";

/**
 * Unique interface for managing a tenant's réalisations — used by the client
 * (`/admin/portfolio`) and by the Super Admin (`super-admin.tenants.$tenantId.tsx`,
 * onglet "Réalisations"), at whatever rights each caller resolves. Same
 * component, same behavior, same queryKey (`admin-portfolio`) — only
 * `tenantId` changes between call sites. See docs/product/constitution.md,
 * principe 3.
 */
export function PortfolioManager({ tenantId }: { tenantId: string }) {
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [deletingItem, setDeletingItem] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [cityPickerOpen, setCityPickerOpen] = useState(false);
  const [otherCityMode, setOtherCityMode] = useState(false);
  // The illustration's original image_url when the dialog was opened — not
  // a permission flag. Whether the artisan replaces it by uploading a file
  // or pasting a different URL, both are equally valid "this is genuinely a
  // different photo" signals; only the DB default (real_project/tenant) or
  // a metadata-only edit that leaves the same catalog image untouched are
  // not. See saveMutation's `imageReplaced`.
  const [illustrationOriginalUrl, setIllustrationOriginalUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-portfolio", tenantId],
    queryFn: () => fetchPortfolio(tenantId),
    enabled: !!tenantId,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["admin-services", tenantId],
    queryFn: () => fetchAllServices(tenantId),
    enabled: !!tenantId,
  });

  // Zones already declared by the tenant — source of the city combobox's
  // priority suggestions. Reading `service_areas` here does not create or
  // modify any zone: it's read-only, purely to guide the artisan's typing.
  const { data: zones = [] } = useQuery({
    queryKey: ["admin-service-areas", tenantId],
    queryFn: () => fetchServiceAreas(tenantId),
    enabled: !!tenantId,
  });
  const knownCities = Array.from(new Set(zones.map((z) => z.city))).sort((a, b) => a.localeCompare(b));

  const { data: suggestions = [] } = useQuery({
    queryKey: ["portfolio-suggestions", tenantId],
    queryFn: async () => {
      const { data: tenantRow, error: tenantErr } = await supabase
        .from("tenants")
        .select("trade_template_id")
        .eq("id", tenantId)
        .single();
      if (tenantErr) throw tenantErr;
      const tradeTemplateId = tenantRow?.trade_template_id;
      if (!tradeTemplateId) return [];
      // Deliberate deviation: reads trade_media_library directly instead of
      // the public_trade_media view (the usual frontend convention), because
      // the view doesn't expose `title` and it's needed to pre-fill the draft
      // dialog opened right after import. Allowed by RLS policy
      // public_read_active_trade_media_via_view (is_active = true rows).
      const { data, error } = await supabase
        .from("trade_media_library")
        .select("id, title, image_path, alt_text")
        .eq("trade_template_id", tradeTemplateId)
        .eq("media_type", "proof")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as PortfolioSuggestion[];
    },
    enabled: !!tenantId && items.length === 0,
  });

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["admin-portfolio", tenantId] });

  const applySuggestionMutation = useMutation({
    mutationFn: async (media: PortfolioSuggestion) => {
      const { data, error } = await supabase
        .from("portfolio")
        .insert({
          tenant_id: tenantId,
          title: media.title ?? "",
          image_url: bucketPublicUrl("trade-media", media.image_path),
          is_published: false,
          sort_order: 0,
          // This photo comes from the platform's shared trade media library,
          // not from a job this tenant actually did — never let it default
          // to real_project/tenant (the DB column defaults), which would
          // silently mislabel it as the tenant's own completed work.
          content_kind: "illustration",
          media_origin: "template",
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      invalidate();
      setEditingItem({ ...data });
      setIsDialogOpen(true);
      toast.success("Brouillon créé à partir de la suggestion — complétez avant de publier");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  async function uploadPortfolioImage(file: File): Promise<string> {
    const validationErr = validateImageFile(file);
    if (validationErr) throw new Error(validationErr);
    const path = buildMediaPath({
      scope: tenantId,
      kind: "portfolio",
      file,
      subFolder: "portfolio",
    });
    await uploadImage({ bucket: "media", path, file });
    return bucketPublicUrl("media", path);
  }

  // Derived, not stored: true once the image actually differs from the
  // illustration's original catalog photo, regardless of how it changed
  // (upload or pasted URL) — both count equally as "a different photo".
  const imageReplaced =
    editingItem?.content_kind === "illustration" &&
    !!editingItem?.image_url &&
    editingItem.image_url !== illustrationOriginalUrl;

  const saveMutation = useMutation({
    mutationFn: async (item: any) => {
      if (item.id) {
        const isConvertingIllustration = item.content_kind === "illustration" && imageReplaced;
        const { error } = await supabase
          .from("portfolio")
          .update({
            title: item.title,
            description: item.description,
            city: item.city,
            service_id: item.service_id || null,
            image_url: item.image_url,
            sort_order: item.sort_order,
            // An illustration stays unpublishable until its photo has
            // actually been replaced by a real upload this session.
            is_published: item.content_kind === "illustration" && !isConvertingIllustration ? false : item.is_published,
            ...(isConvertingIllustration
              ? { content_kind: "real_project", media_origin: "tenant" }
              : {}),
          })
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portfolio").insert({
          tenant_id: tenantId,
          title: item.title,
          description: item.description,
          city: item.city,
          service_id: item.service_id || null,
          image_url: item.image_url,
          sort_order: item.sort_order ?? items.length,
          is_published: item.is_published ?? true,
        });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      invalidate();
      setIsDialogOpen(false);
      setEditingItem(null);
      toast.success("Réalisation enregistrée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from("portfolio").delete().eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      setDeletingItem(null);
      toast.success("Réalisation supprimée");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const publishMutation = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from("portfolio").update({ is_published }).eq("id", id);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  function openNew() {
    setEditingItem({
      title: "",
      description: "",
      city: "",
      service_id: "",
      image_url: "",
      sort_order: items.length,
      is_published: true,
    });
    setOtherCityMode(false);
    setIllustrationOriginalUrl(null);
    setIsDialogOpen(true);
  }

  function openEdit(item: any) {
    setEditingItem({ ...item });
    setOtherCityMode(!!item.city && !knownCities.includes(item.city));
    setIllustrationOriginalUrl(item.content_kind === "illustration" ? item.image_url : null);
    setIsDialogOpen(true);
  }

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      setUploading(true);
      const url = await uploadPortfolioImage(file);
      setEditingItem((prev: any) => ({ ...prev, image_url: url }));
      toast.success("Image uploadée");
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <p className="text-sm text-muted-foreground">{items.length} réalisation(s)</p>
        <Button size="sm" onClick={openNew}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>
      </div>

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : items.length === 0 ? (
        <>
          <Card>
            <CardContent className="space-y-1 py-8 text-center text-muted-foreground">
              <p className="font-medium text-foreground">Aucune réalisation</p>
              <p className="text-sm">
                Ajoutez et publiez une première réalisation pour faire apparaître la section sur l'accueil et la page Réalisations.
              </p>
            </CardContent>
          </Card>
          {suggestions.length > 0 && (
            <div className="mt-6">
              <h3 className="mb-3 text-sm font-medium text-foreground">
                Suggestions pour démarrer
              </h3>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {suggestions.map((s) => (
                  <Card key={s.id} className="overflow-hidden">
                    <div className="aspect-video bg-muted">
                      <img
                        src={bucketPublicUrl("trade-media", s.image_path)}
                        alt={s.alt_text ?? s.title ?? ""}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <CardContent className="py-3">
                      {s.title && <p className="mb-2 truncate text-xs text-muted-foreground">{s.title}</p>}
                      <Button
                        size="sm"
                        variant="outline"
                        className="w-full"
                        disabled={applySuggestionMutation.isPending}
                        onClick={() => applySuggestionMutation.mutate(s)}
                      >
                        Utiliser comme point de départ
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <Card key={item.id} className="flex h-full flex-col overflow-hidden">
              <button
                type="button"
                className="relative block aspect-video w-full bg-muted"
                onClick={() => openEdit(item)}
              >
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
                {item.content_kind === "illustration" && (
                  <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-1 text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm">
                    Photo d'exemple
                  </span>
                )}
              </button>
              <CardContent className="flex flex-1 flex-col justify-between gap-3 py-3">
                <div className="space-y-1">
                  <div className="flex items-start gap-2">
                    <h3 className="line-clamp-2 flex-1 text-sm font-medium text-foreground">{item.title}</h3>
                    {item.content_kind !== "illustration" && !item.is_published && (
                      <span className="shrink-0 rounded bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground">
                        Masqué
                      </span>
                    )}
                  </div>
                  {item.city && <p className="text-xs text-muted-foreground">{item.city}</p>}
                </div>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  {item.content_kind === "illustration" ? (
                    <Button variant="secondary" size="sm" onClick={() => openEdit(item)}>
                      Remplacer la photo
                    </Button>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <Switch
                        checked={item.is_published ?? true}
                        onCheckedChange={(v) => publishMutation.mutate({ id: item.id, is_published: v })}
                      />
                      <Label className="text-xs text-muted-foreground">Visible sur mon site</Label>
                    </div>
                  )}
                  <div className="flex gap-1">
                    <Button variant="ghost" size="icon" onClick={() => openEdit(item)} aria-label="Modifier">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => setDeletingItem(item)} aria-label="Supprimer">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <AlertDialog open={!!deletingItem} onOpenChange={(open) => !open && setDeletingItem(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer « {deletingItem?.title} » ?</AlertDialogTitle>
            <AlertDialogDescription>
              Cette action retire définitivement cette réalisation, y compris de la page Réalisations et de la fiche service associée.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deletingItem && deleteMutation.mutate(deletingItem.id)}
            >
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingItem?.id ? "Modifier" : "Nouvelle réalisation"}</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); saveMutation.mutate(editingItem); }}>
              <div className="space-y-2">
                <Label>Image</Label>
                {editingItem.image_url && (
                  <div className="relative">
                    <img src={editingItem.image_url} alt="" loading="lazy" decoding="async" className="aspect-video w-full rounded-md object-cover" />
                    {editingItem.content_kind === "illustration" && !imageReplaced && (
                      <span className="absolute left-2 top-2 rounded-md bg-background/90 px-2 py-1 text-[10px] font-medium text-foreground shadow-sm backdrop-blur-sm">
                        Photo d'exemple
                      </span>
                    )}
                  </div>
                )}
                {editingItem.content_kind === "illustration" && !imageReplaced && (
                  <p className="text-xs text-muted-foreground">
                    Remplacez cette photo catalogue par une vraie photo de votre chantier pour pouvoir publier cette carte.
                  </p>
                )}
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload fichier</TabsTrigger>
                    <TabsTrigger value="url">URL externe</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="pt-2">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading
                        ? "Upload..."
                        : editingItem.content_kind === "illustration"
                          ? "Remplacer par mon chantier"
                          : "Choisir une image"}
                    </Button>
                  </TabsContent>
                  <TabsContent value="url" className="pt-2 space-y-2">
                    <Input
                      type="url"
                      placeholder="https://images.unsplash.com/photo-..."
                      value={editingItem.image_url ?? ""}
                      onChange={(e) => setEditingItem((p: any) => ({ ...p, image_url: e.target.value }))}
                    />
                    <p className="text-xs text-muted-foreground">
                      Collez une URL d'image publique (Unsplash, CDN, etc.).
                    </p>
                  </TabsContent>
                </Tabs>
              </div>
              <div className="space-y-2">
                <Label>Titre</Label>
                <Input
                  value={editingItem.title}
                  onChange={(e) => setEditingItem((p: any) => ({ ...p, title: e.target.value }))}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingItem.description ?? ""}
                  onChange={(e) => setEditingItem((p: any) => ({ ...p, description: e.target.value }))}
                  rows={3}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label>Ville du chantier</Label>
                  {otherCityMode ? (
                    <div className="space-y-1">
                      <Input
                        value={editingItem.city ?? ""}
                        onChange={(e) => setEditingItem((p: any) => ({ ...p, city: e.target.value }))}
                        placeholder="Nom de la ville"
                        autoFocus
                      />
                      {knownCities.length > 0 && (
                        <button
                          type="button"
                          className="text-xs text-muted-foreground hover:text-primary"
                          onClick={() => setOtherCityMode(false)}
                        >
                          ← Choisir parmi mes zones
                        </button>
                      )}
                    </div>
                  ) : (
                    <Popover open={cityPickerOpen} onOpenChange={setCityPickerOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          aria-expanded={cityPickerOpen}
                          className="w-full justify-between font-normal"
                        >
                          {editingItem.city || "Sélectionner une ville"}
                          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-[--radix-popover-trigger-width] p-0">
                        <Command>
                          <CommandInput placeholder="Rechercher une ville..." />
                          <CommandList>
                            <CommandEmpty>Aucune zone ne correspond.</CommandEmpty>
                            <CommandGroup heading="Mes zones d'intervention">
                              {knownCities.map((city) => (
                                <CommandItem
                                  key={city}
                                  value={city}
                                  onSelect={() => {
                                    setEditingItem((p: any) => ({ ...p, city }));
                                    setCityPickerOpen(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      editingItem.city === city ? "opacity-100" : "opacity-0",
                                    )}
                                  />
                                  {city}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                            <CommandGroup>
                              <CommandItem
                                value={OTHER_CITY}
                                onSelect={() => {
                                  setOtherCityMode(true);
                                  setCityPickerOpen(false);
                                }}
                              >
                                Autre ville…
                              </CommandItem>
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  )}
                  <p className="text-xs text-muted-foreground">
                    Choisissez parmi vos zones, ou « Autre ville » pour un chantier réel en dehors de vos zones habituelles.
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>Service lié</Label>
                  <Select
                    value={editingItem.service_id ?? ""}
                    onValueChange={(v) => setEditingItem((p: any) => ({ ...p, service_id: v }))}
                  >
                    <SelectTrigger><SelectValue placeholder="Aucun" /></SelectTrigger>
                    <SelectContent>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {editingItem.content_kind === "illustration" && !imageReplaced ? (
                <div className="rounded-md border border-dashed p-3 text-xs text-muted-foreground">
                  Non publiable tant que la photo n'a pas été remplacée par un vrai chantier.
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-md border p-3">
                  <div>
                    <Label className="text-sm">Visible sur mon site</Label>
                    <p className="text-xs text-muted-foreground">Décochez pour la masquer sans la supprimer.</p>
                  </div>
                  <Switch
                    checked={editingItem.is_published ?? true}
                    onCheckedChange={(v) => setEditingItem((p: any) => ({ ...p, is_published: v }))}
                  />
                </div>
              )}
              <div className="space-y-1 pt-2">
                {!editingItem.image_url && (
                  <p className="text-right text-xs text-muted-foreground">Ajoutez une image avant d'enregistrer.</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                  <Button type="submit" disabled={saveMutation.isPending || !editingItem.image_url}>
                    {saveMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                  </Button>
                </div>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
