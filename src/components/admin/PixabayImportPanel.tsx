import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Loader2, Search, ImageOff } from "lucide-react";
import { toast } from "sonner";
import { MEDIA_TYPE_OPTIONS, type TradeMediaType } from "@/lib/trade-media";
import { getTradeShortName } from "@/lib/trade-wording";
import { findExistingPixabayImports, importPixabayResult, searchPixabay } from "@/lib/media-providers/pixabay";
import { MediaImportError, type MediaSearchResult } from "@/lib/media-providers/types";

type TradeOption = { id: string; slug: string; name: string };

interface PixabayImportPanelProps {
  trades: TradeOption[];
  onImported: () => void;
}

function errorMessage(e: unknown, fallback: string): string {
  if (e instanceof MediaImportError) {
    return e.requestId ? `${e.message} (Réf: ${e.requestId.slice(0, 8)})` : e.message;
  }
  return e instanceof Error ? e.message : fallback;
}

// P0.2B MVP scope, deliberately minimal: text search only (no orientation/
// colour filters), a single page of results (searchPixabay's default 24, no
// "load more"), and a "Voir dans la bibliothèque" dedup action that just
// scrolls to + resets the main grid's filters rather than deep-linking to
// the exact row. media-import (P0.2A) is not touched by this component.
export function PixabayImportPanel({ trades, onImported }: PixabayImportPanelProps) {
  const queryClient = useQueryClient();

  const [query, setQuery] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [results, setResults] = useState<MediaSearchResult[]>([]);
  const [selected, setSelected] = useState<MediaSearchResult | null>(null);
  const [assignTradeId, setAssignTradeId] = useState("");
  const [assignMediaType, setAssignMediaType] = useState<TradeMediaType>("hero");
  const [assignServiceTemplateId, setAssignServiceTemplateId] = useState("none");

  const tradeMap = useMemo(() => Object.fromEntries(trades.map((t) => [t.id, t])), [trades]);
  const providerIds = useMemo(() => results.map((r) => r.providerId), [results]);

  const { data: existingImports = new Map<string, string>() } = useQuery({
    queryKey: ["pixabay-dedup", providerIds],
    queryFn: () => findExistingPixabayImports(providerIds),
    enabled: providerIds.length > 0,
  });

  const { data: assignServiceTemplates = [] } = useQuery({
    queryKey: ["trade-service-templates-for-pixabay", assignTradeId],
    enabled: !!assignTradeId,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("trade_service_templates")
        .select("id, name")
        .eq("trade_template_id", assignTradeId)
        .order("sort_order", { ascending: true });
      if (error) throw error;
      return data ?? [];
    },
  });

  const searchMutation = useMutation({
    mutationFn: () => searchPixabay(query.trim()),
    onSuccess: (outcome) => {
      setResults(outcome.results);
      setHasSearched(true);
    },
    onError: (e: unknown) => toast.error(errorMessage(e, "Échec de la recherche")),
  });

  const importMutation = useMutation({
    mutationFn: () => {
      if (!selected) throw new Error("Aucune image sélectionnée");
      const trade = tradeMap[assignTradeId];
      if (!trade) throw new Error("Choisis un métier");
      return importPixabayResult({
        result: selected,
        searchQuery: query.trim(),
        tradeTemplateId: assignTradeId,
        tradeSlug: trade.slug,
        mediaType: assignMediaType,
        tradeServiceTemplateId: assignServiceTemplateId === "none" ? null : assignServiceTemplateId,
      });
    },
    onSuccess: () => {
      toast.success("Image importée — en attente d'approbation.");
      onImported();
      queryClient.invalidateQueries({ queryKey: ["pixabay-dedup"] });
      setSelected(null);
    },
    onError: (e: unknown) => toast.error(errorMessage(e, "Échec de l'import")),
  });

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query.trim()) return;
    searchMutation.mutate();
  };

  const openAssign = (result: MediaSearchResult) => {
    setSelected(result);
    setAssignTradeId("");
    setAssignMediaType("hero");
    setAssignServiceTemplateId("none");
  };

  const viewInLibrary = () => {
    document.getElementById("media-library-grid")?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <form onSubmit={onSearchSubmit} className="flex gap-2">
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="ex. poêle à bois, ramonage cheminée…"
          className="flex-1"
        />
        <Button type="submit" disabled={!query.trim() || searchMutation.isPending} className="gap-2">
          {searchMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
          Rechercher
        </Button>
      </form>

      {hasSearched && !searchMutation.isPending && results.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-8 text-center text-muted-foreground">
          <ImageOff className="h-8 w-8" />
          <p className="text-sm">Aucun résultat pour cette recherche.</p>
        </div>
      )}

      {results.length > 0 && (
        <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {results.map((result) => {
            const alreadyImported = existingImports.has(result.providerId);
            return (
              <div key={result.providerId} className="overflow-hidden rounded-lg border bg-card">
                <div className={`relative aspect-video w-full overflow-hidden bg-muted ${alreadyImported ? "opacity-50" : ""}`}>
                  <img
                    src={result.previewUrl}
                    alt={result.authorCredit ?? "Pixabay"}
                    className="h-full w-full object-cover"
                    loading="lazy"
                  />
                  {alreadyImported && (
                    <Badge className="absolute top-1.5 left-1.5 text-[10px] px-1.5 py-0 h-5 bg-secondary text-secondary-foreground">
                      Déjà importé
                    </Badge>
                  )}
                </div>
                <div className="space-y-1.5 p-2">
                  <p className="truncate text-[11px] text-muted-foreground">{result.authorCredit ?? "Pixabay"}</p>
                  <Button
                    size="sm"
                    variant={alreadyImported ? "outline" : "default"}
                    className="w-full"
                    onClick={() => (alreadyImported ? viewInLibrary() : openAssign(result))}
                  >
                    {alreadyImported ? "Voir dans la bibliothèque" : "Sélectionner"}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Dialog open={!!selected} onOpenChange={(o) => !o && setSelected(null)}>
        <DialogContent>
          <DialogHeader><DialogTitle>Importer depuis Pixabay</DialogTitle></DialogHeader>
          {selected && (
            <div className="space-y-3">
              <img
                src={selected.previewUrl}
                alt={selected.authorCredit ?? "Pixabay"}
                className="aspect-video w-full rounded-md object-cover"
              />
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Métier</Label>
                  <Select
                    value={assignTradeId}
                    onValueChange={(v) => { setAssignTradeId(v); setAssignServiceTemplateId("none"); }}
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
                  <Select value={assignMediaType} onValueChange={(v) => setAssignMediaType(v as TradeMediaType)}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MEDIA_TYPE_OPTIONS.map((t) => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <Label>Service (optionnel)</Label>
                <Select
                  value={assignServiceTemplateId}
                  onValueChange={setAssignServiceTemplateId}
                  disabled={!assignTradeId}
                >
                  <SelectTrigger><SelectValue placeholder="Générique métier" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">— Générique métier —</SelectItem>
                    {assignServiceTemplates.map((s) => (
                      <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1 border-t pt-3 text-xs text-muted-foreground">
                <p>Auteur : {selected.authorCredit ?? "—"}</p>
                <p>Licence : {selected.license}</p>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setSelected(null)}>Annuler</Button>
            <Button
              onClick={() => importMutation.mutate()}
              disabled={!assignTradeId || importMutation.isPending}
              className="gap-2"
            >
              {importMutation.isPending && <Loader2 className="h-4 w-4 animate-spin" />}
              Importer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
