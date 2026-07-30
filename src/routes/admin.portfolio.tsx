import { createFileRoute } from "@tanstack/react-router";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAdminTenant } from "@/hooks/use-tenant";
import { fetchPortfolio, fetchAllServices } from "@/lib/tenant";
import { supabase } from "@/integrations/supabase/client";
import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Plus, Pencil, Trash2, Image as ImageIcon } from "lucide-react";
import {
  validateImageFile,
  buildMediaPath,
  uploadImage,
  bucketPublicUrl,
} from "@/lib/media-upload";
import { useState, useRef } from "react";
import { toast } from "sonner";

export const Route = createFileRoute("/admin/portfolio")({
  component: AdminPortfolio,
});

interface PortfolioSuggestion {
  id: string;
  title: string | null;
  image_path: string;
  alt_text: string | null;
}

function AdminPortfolio() {
  const { tenant } = useAdminTenant();
  const queryClient = useQueryClient();
  const [editingItem, setEditingItem] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: items = [], isLoading } = useQuery({
    queryKey: ["admin-portfolio", tenant?.id],
    queryFn: () => fetchPortfolio(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: services = [] } = useQuery({
    queryKey: ["admin-services", tenant?.id],
    queryFn: () => fetchAllServices(tenant!.id),
    enabled: !!tenant?.id,
  });

  const { data: suggestions = [] } = useQuery({
    queryKey: ["portfolio-suggestions", tenant?.trade_template_id],
    queryFn: async () => {
      // Deliberate deviation: reads trade_media_library directly instead of
      // the public_trade_media view (the usual frontend convention), because
      // the view doesn't expose `title` and it's needed to pre-fill the draft
      // dialog opened right after import. Allowed by RLS policy
      // public_read_active_trade_media_via_view (is_active = true rows).
      const { data, error } = await supabase
        .from("trade_media_library")
        .select("id, title, image_path, alt_text")
        .eq("trade_template_id", tenant!.trade_template_id!)
        .eq("media_type", "proof")
        .eq("is_active", true)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data as PortfolioSuggestion[];
    },
    enabled: !!tenant?.trade_template_id && items.length === 0,
  });

  const applySuggestionMutation = useMutation({
    mutationFn: async (media: PortfolioSuggestion) => {
      const { data, error } = await supabase
        .from("portfolio")
        .insert({
          tenant_id: tenant!.id,
          title: media.title ?? "",
          image_url: bucketPublicUrl("trade-media", media.image_path),
          is_published: false,
          sort_order: 0,
        })
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
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
      scope: tenant!.id,
      kind: "portfolio",
      file,
      subFolder: "portfolio",
    });
    await uploadImage({ bucket: "media", path, file });
    return bucketPublicUrl("media", path);
  }

  const saveMutation = useMutation({
    mutationFn: async (item: any) => {
      if (item.id) {
        const { error } = await supabase
          .from("portfolio")
          .update({
            title: item.title,
            description: item.description,
            city: item.city,
            service_id: item.service_id || null,
            image_url: item.image_url,
            sort_order: item.sort_order,
            is_published: item.is_published,
          })
          .eq("id", item.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from("portfolio").insert({
          tenant_id: tenant!.id,
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
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
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
      queryClient.invalidateQueries({ queryKey: ["admin-portfolio"] });
      toast.success("Réalisation supprimée");
    },
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

  if (!tenant) return <p className="text-muted-foreground">Chargement...</p>;

  return (
    <div className="space-y-6">
      <AdminPageHeader
        title="Mes réalisations"
        description="Gérez vos réalisations"
        actions={<Button onClick={openNew}><Plus className="h-4 w-4 mr-1" />Ajouter</Button>}
      />

      {isLoading ? (
        <p className="text-muted-foreground">Chargement...</p>
      ) : items.length === 0 ? (
        <>
          <Card>
            <CardContent className="space-y-1 py-8 text-center text-muted-foreground">
              <p className="font-medium text-foreground">Aucune réalisation publiée</p>
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
            <Card key={item.id} className="overflow-hidden">
              <div className="aspect-video bg-muted relative">
                {item.image_url ? (
                  <img src={item.image_url} alt={item.title} loading="lazy" decoding="async" className="w-full h-full object-cover" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <ImageIcon className="h-8 w-8 text-muted-foreground" />
                  </div>
                )}
              </div>
              <CardContent className="py-3">
                <h3 className="font-medium text-foreground text-sm">{item.title}</h3>
                {item.city && <p className="text-xs text-muted-foreground">{item.city}</p>}
                <div className="flex gap-1 mt-2">
                  <Button variant="ghost" size="sm" onClick={() => { setEditingItem({ ...item }); setIsDialogOpen(true); }}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => { if (confirm("Supprimer ?")) deleteMutation.mutate(item.id); }}
                  >
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

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
                  <img src={editingItem.image_url} alt="" loading="lazy" decoding="async" className="h-32 w-full object-cover rounded-md" />
                )}
                <Tabs defaultValue="upload" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload fichier</TabsTrigger>
                    <TabsTrigger value="url">URL externe</TabsTrigger>
                  </TabsList>
                  <TabsContent value="upload" className="pt-2">
                    <input ref={fileInputRef} type="file" accept="image/*" className="hidden" onChange={handleFileChange} />
                    <Button type="button" variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={uploading}>
                      {uploading ? "Upload..." : "Choisir une image"}
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
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ville</Label>
                  <Input
                    value={editingItem.city ?? ""}
                    onChange={(e) => setEditingItem((p: any) => ({ ...p, city: e.target.value }))}
                  />
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
              <div className="space-y-2">
                <Label>Ordre</Label>
                <Input
                  type="number"
                  value={editingItem.sort_order ?? 0}
                  onChange={(e) => setEditingItem((p: any) => ({ ...p, sort_order: parseInt(e.target.value) || 0 }))}
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Annuler</Button>
                <Button type="submit" disabled={saveMutation.isPending || !editingItem.image_url}>
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
