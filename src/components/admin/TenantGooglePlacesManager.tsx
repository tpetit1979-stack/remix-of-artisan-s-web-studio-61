import { useEffect, useRef, useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Search, Star, Loader2, ExternalLink, Trash2, RefreshCw } from "lucide-react";

type GooglePlaceResult = { place_id: string; name: string; address: string };

type GooglePlacesAction = "search" | "select" | "refresh" | "unlink";

/** Thrown by callGooglePlaces — never a raw Supabase/SDK error reaches the UI. */
class GooglePlacesClientError extends Error {
  code: string;
  requestId?: string;
  constructor(code: string, message: string, requestId?: string) {
    super(message);
    this.code = code;
    this.requestId = requestId;
  }
}

const ERROR_MESSAGES: Record<string, string> = {
  UNAUTHORIZED: "Session expirée, reconnectez-vous.",
  FORBIDDEN: "Réservé au Super Admin.",
  TENANT_NOT_FOUND: "Client introuvable.",
  GOOGLE_TIMEOUT: "Google ne répond pas, réessayez.",
  GOOGLE_RATE_LIMITED: "Quota Google temporairement atteint, réessayez plus tard.",
  GOOGLE_PLACE_NOT_FOUND: "Cette fiche Google a disparu.",
  DATABASE_ERROR: "Erreur technique, réessayez.",
};

async function callGooglePlaces<T>(action: GooglePlacesAction, body: Record<string, unknown>): Promise<T> {
  const { data, error } = await supabase.functions.invoke("google-places", {
    body: { action, ...body },
  });
  if (error) {
    throw new GooglePlacesClientError("NETWORK_ERROR", "Impossible de joindre le service Google Places.");
  }
  if (!data?.success) {
    const code = data?.error?.code ?? "UNKNOWN";
    const message = data?.error?.message ?? ERROR_MESSAGES[code] ?? "Erreur inconnue.";
    throw new GooglePlacesClientError(code, message, data?.request_id);
  }
  return data.data as T;
}

function getGoogleMapsUrl(companyName: string | null | undefined, placeId: string) {
  const query = encodeURIComponent(companyName ?? "");
  return `https://www.google.com/maps/search/?api=1&query=${query}&query_place_id=${encodeURIComponent(placeId)}`;
}

function notifyError(e: unknown) {
  if (e instanceof GooglePlacesClientError) {
    toast.error(e.requestId ? `${e.message} (réf. ${e.requestId})` : e.message);
  } else {
    toast.error("Erreur inattendue.");
  }
}

interface TenantGooglePlacesManagerProps {
  tenantId: string;
  tenant: {
    company_name?: string | null;
    city?: string | null;
    google_place_id?: string | null;
    google_rating?: number | null;
    google_review_count?: number | null;
    google_rating_updated_at?: string | null;
  };
  disabled?: boolean;
  onBusyChange?: (busy: boolean) => void;
}

export function TenantGooglePlacesManager({ tenantId, tenant, disabled, onBusyChange }: TenantGooglePlacesManagerProps) {
  const queryClient = useQueryClient();
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [results, setResults] = useState<GooglePlaceResult[] | null>(null);
  const [pendingSelection, setPendingSelection] = useState<GooglePlaceResult | null>(null);
  const [confirmUnlinkOpen, setConfirmUnlinkOpen] = useState(false);

  const invalidateTenant = () => queryClient.invalidateQueries({ queryKey: ["sa-tenant", tenantId] });

  // Synchronous lock: TanStack Query's isPending only flips on the next
  // render, leaving a window where a fast double-click fires the handler
  // twice before disabled is applied. This ref is set/cleared inline, so
  // the second click sees it immediately and bails out.
  const actionLockRef = useRef(false);
  async function withLock(run: () => Promise<unknown>) {
    if (actionLockRef.current) return;
    actionLockRef.current = true;
    try {
      await run();
    } catch {
      // already surfaced via the mutation's onError toast
    } finally {
      actionLockRef.current = false;
    }
  }

  const searchMutation = useMutation({
    mutationFn: (queryOverride: string) =>
      callGooglePlaces<{ results: GooglePlaceResult[] }>("search", {
        tenant_id: tenantId,
        query_override: queryOverride,
      }),
    onSuccess: (data) => setResults(data.results),
    onError: notifyError,
  });

  const selectMutation = useMutation({
    mutationFn: (placeId: string) =>
      callGooglePlaces("select", { tenant_id: tenantId, place_id: placeId }),
    onSuccess: async () => {
      await invalidateTenant();
      setPendingSelection(null);
      setSearchOpen(false);
      setResults(null);
      toast.success("Fiche Google associée.");
    },
    onError: notifyError,
  });

  const refreshMutation = useMutation({
    mutationFn: () => callGooglePlaces("refresh", { tenant_id: tenantId }),
    onSuccess: async () => {
      await invalidateTenant();
      toast.success("Avis Google actualisés.");
    },
    onError: notifyError,
  });

  const unlinkMutation = useMutation({
    mutationFn: () => callGooglePlaces("unlink", { tenant_id: tenantId }),
    onSuccess: async () => {
      await invalidateTenant();
      setConfirmUnlinkOpen(false);
      toast.success("Fiche Google dissociée.");
    },
    onError: notifyError,
  });

  const isBusy =
    searchMutation.isPending || selectMutation.isPending || refreshMutation.isPending || unlinkMutation.isPending;

  useEffect(() => { onBusyChange?.(isBusy); }, [isBusy, onBusyChange]);
  useEffect(() => {
    return () => onBusyChange?.(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function openSearch() {
    setSearchQuery([tenant.company_name, tenant.city].filter(Boolean).join(" "));
    setResults(null);
    setSearchOpen(true);
  }

  const hasReviews = tenant.google_rating != null && (tenant.google_review_count ?? 0) > 0;

  return (
    <div className="space-y-1.5">
      <Label className="text-xs text-muted-foreground">Google Avis</Label>

      {!tenant.google_place_id && (
        <Card>
          <CardContent className="flex items-center justify-between gap-3 py-3">
            <p className="text-sm text-muted-foreground">Aucune fiche Google associée.</p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="h-8 gap-1.5 text-xs shrink-0"
              disabled={disabled || isBusy}
              onClick={openSearch}
            >
              <Search className="h-3.5 w-3.5" /> Rechercher une fiche
            </Button>
          </CardContent>
        </Card>
      )}

      {tenant.google_place_id && hasReviews && (
        <Card>
          <CardContent className="space-y-2 py-3">
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
              <span className="inline-flex items-center gap-1 font-medium">
                <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500" />
                {tenant.google_rating}
              </span>
              <span className="text-muted-foreground">({tenant.google_review_count} avis)</span>
              {tenant.google_rating_updated_at && (
                <span className="text-xs text-muted-foreground">
                  Mis à jour le {new Date(tenant.google_rating_updated_at).toLocaleDateString("fr-FR")}
                </span>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs"
                disabled={disabled || isBusy}
                onClick={() => withLock(() => refreshMutation.mutateAsync())}
              >
                {refreshMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Actualiser
              </Button>
              <a href={getGoogleMapsUrl(tenant.company_name, tenant.google_place_id)} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                  <ExternalLink className="h-3.5 w-3.5" /> Voir la fiche Google
                </Button>
              </a>
              <Button
                type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                disabled={disabled || isBusy}
                onClick={() => setConfirmUnlinkOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Dissocier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {tenant.google_place_id && !hasReviews && (
        <Card>
          <CardContent className="space-y-2 py-3">
            <div>
              <p className="text-sm font-medium">Fiche Google associée</p>
              <p className="text-xs text-muted-foreground">Aucun avis publié pour le moment.</p>
            </div>
            <div className="flex flex-wrap gap-1.5">
              <Button
                type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs"
                disabled={disabled || isBusy}
                onClick={() => withLock(() => refreshMutation.mutateAsync())}
              >
                {refreshMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Actualiser
              </Button>
              <a href={getGoogleMapsUrl(tenant.company_name, tenant.google_place_id)} target="_blank" rel="noopener noreferrer">
                <Button type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs">
                  <ExternalLink className="h-3.5 w-3.5" /> Voir la fiche Google
                </Button>
              </a>
              <Button
                type="button" variant="outline" size="sm" className="h-7 gap-1.5 text-xs text-destructive hover:text-destructive"
                disabled={disabled || isBusy}
                onClick={() => setConfirmUnlinkOpen(true)}
              >
                <Trash2 className="h-3.5 w-3.5" /> Dissocier
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search + results dialog */}
      <Dialog open={searchOpen} onOpenChange={(open) => { if (!isBusy) setSearchOpen(open); }}>
        <DialogContent className="max-w-lg">
          <DialogHeader><DialogTitle>Rechercher une fiche Google</DialogTitle></DialogHeader>
          <div className="space-y-3">
            {/* The query never fires as the user types — only on explicit
                submit (click or Enter). No debounce, no auto-search. */}
            <form
              className="flex gap-2"
              onSubmit={(e) => {
                e.preventDefault();
                const q = searchQuery.trim();
                if (q) withLock(() => searchMutation.mutateAsync(q));
              }}
            >
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Nom entreprise, ville..."
                disabled={searchMutation.isPending}
              />
              <Button
                type="submit"
                size="sm"
                className="shrink-0 gap-1.5"
                disabled={searchMutation.isPending || !searchQuery.trim()}
              >
                {searchMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Search className="h-3.5 w-3.5" />}
                Lancer la recherche
              </Button>
              <Button
                type="button"
                size="sm"
                variant="outline"
                className="shrink-0"
                disabled={searchMutation.isPending}
                onClick={() => setSearchOpen(false)}
              >
                Annuler
              </Button>
            </form>

            {searchMutation.isPending && (
              <p className="text-sm text-muted-foreground">Recherche en cours...</p>
            )}

            {results && !searchMutation.isPending && (
              results.length === 0 ? (
                <p className="text-sm text-muted-foreground">Aucun résultat.</p>
              ) : (
                <div className="space-y-1.5">
                  {results.map((r) => (
                    <div key={r.place_id} className="flex items-center justify-between gap-3 rounded-lg border p-2.5">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium">{r.name}</p>
                        <p className="truncate text-xs text-muted-foreground">{r.address}</p>
                      </div>
                      <Button
                        type="button" size="sm" variant="outline" className="h-7 shrink-0 text-xs"
                        disabled={selectMutation.isPending}
                        onClick={() => setPendingSelection(r)}
                      >
                        Sélectionner
                      </Button>
                    </div>
                  ))}
                </div>
              )
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Confirm association */}
      <AlertDialog open={!!pendingSelection} onOpenChange={(open) => { if (!open && !selectMutation.isPending) setPendingSelection(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Associer cette fiche Google ?</AlertDialogTitle>
            <AlertDialogDescription asChild>
              <span className="block space-y-1">
                <span className="block font-medium text-foreground">{pendingSelection?.name}</span>
                <span className="block">{pendingSelection?.address}</span>
              </span>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={selectMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={selectMutation.isPending}
              onClick={(e) => {
                e.preventDefault();
                if (pendingSelection) withLock(() => selectMutation.mutateAsync(pendingSelection.place_id));
              }}
            >
              {selectMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Associer"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirm dissociation */}
      <AlertDialog open={confirmUnlinkOpen} onOpenChange={(open) => { if (!unlinkMutation.isPending) setConfirmUnlinkOpen(open); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Dissocier cette fiche Google ?</AlertDialogTitle>
            <AlertDialogDescription>
              La note et le nombre d'avis ne seront plus affichés sur le site public.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={unlinkMutation.isPending}>Annuler</AlertDialogCancel>
            <AlertDialogAction
              disabled={unlinkMutation.isPending}
              className={buttonVariants({ variant: "destructive" })}
              onClick={(e) => { e.preventDefault(); withLock(() => unlinkMutation.mutateAsync()); }}
            >
              {unlinkMutation.isPending ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : "Confirmer la dissociation"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
