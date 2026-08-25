import { useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { MapPin, ChevronLeft, ChevronRight, X } from "lucide-react";
import { useIsMobile } from "@/hooks/use-mobile";
import { usePreviewTenantSearch } from "@/hooks/use-tenant";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Drawer, DrawerContent, DrawerTitle, DrawerClose } from "@/components/ui/drawer";
import { Button } from "@/components/ui/button";

export interface PortfolioViewerItem {
  id: string;
  title: string;
  description: string | null;
  city: string | null;
  imageUrl: string;
  service?: { name: string; slug: string } | null;
}

interface PortfolioViewerProps {
  items: PortfolioViewerItem[];
  index: number | null;
  onIndexChange: (index: number | null) => void;
}

/**
 * Shared detail view for every public surface showing réalisations. Owns
 * its own prev/next + keyboard navigation so no consumer route re-implements
 * it — callers only pass the currently-displayed list and the open index,
 * both must be the same list a PortfolioCard's onOpen was built from.
 *
 * Two image rules, deliberately different: the grid vignette (PortfolioCard)
 * crops to a uniform aspect-video via object-cover; this viewer instead
 * shows the photo whole (object-contain, neutral bg) so a portrait photo
 * is never half-cut just because the grid needed a uniform rectangle.
 */
export function PortfolioViewer({ items, index, onIndexChange }: PortfolioViewerProps) {
  const isMobile = useIsMobile();
  const previewTenant = usePreviewTenantSearch();
  const isOpen = index !== null;
  const current = index !== null ? items[index] : null;
  const hasPrev = index !== null && index > 0;
  const hasNext = index !== null && index < items.length - 1;

  useEffect(() => {
    if (!isOpen) return;
    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "ArrowLeft" && index !== null && index > 0) onIndexChange(index - 1);
      if (e.key === "ArrowRight" && index !== null && index < items.length - 1) onIndexChange(index + 1);
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, index, items.length, onIndexChange]);

  if (!current) return null;

  const metaLine = current.city || current.service?.name;

  const body = (
    <div className="flex flex-1 flex-col overflow-y-auto lg:flex-row lg:overflow-hidden">
      <div className="relative flex shrink-0 items-center justify-center bg-muted lg:w-3/5">
        <img
          src={current.imageUrl}
          alt={current.title}
          className="max-h-[45vh] w-full object-contain lg:h-full lg:max-h-[70vh]"
        />
        {hasPrev && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute left-2 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => onIndexChange(index! - 1)}
            aria-label="Réalisation précédente"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
        )}
        {hasNext && (
          <Button
            type="button"
            variant="secondary"
            size="icon"
            className="absolute right-2 top-1/2 h-11 w-11 -translate-y-1/2 rounded-full bg-background/80 backdrop-blur-sm hover:bg-background"
            onClick={() => onIndexChange(index! + 1)}
            aria-label="Réalisation suivante"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
        )}
      </div>
      <div className="flex-1 overflow-y-auto p-6">
        <h2 className="text-lg font-semibold text-foreground">{current.title}</h2>
        {metaLine && (
          <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
            {current.city && (
              <>
                <MapPin className="h-3.5 w-3.5 shrink-0" />
                {current.city}
              </>
            )}
            {current.city && current.service && " · "}
            {current.service?.name}
          </p>
        )}
        {current.description && (
          <p className="mt-4 whitespace-pre-line text-sm leading-relaxed text-foreground">
            {current.description}
          </p>
        )}
        {current.service && (
          <Link
            to="/services/$serviceSlug"
            params={{ serviceSlug: current.service.slug }}
            search={previewTenant}
            className="mt-6 inline-block text-sm font-medium text-primary hover:underline"
          >
            Voir le service →
          </Link>
        )}
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={isOpen} onOpenChange={(open) => !open && onIndexChange(null)}>
        <DrawerContent className="mt-0 flex h-[92vh] flex-col">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <DrawerTitle className="line-clamp-1 pr-2 text-base">{current.title}</DrawerTitle>
            <DrawerClose asChild>
              <Button type="button" variant="ghost" size="icon" className="h-11 w-11 shrink-0" aria-label="Fermer">
                <X className="h-5 w-5" />
              </Button>
            </DrawerClose>
          </div>
          {body}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onIndexChange(null)}>
      <DialogContent className="flex max-h-[90vh] max-w-3xl flex-col gap-0 overflow-hidden p-0 lg:max-w-4xl">
        <DialogTitle className="sr-only">{current.title}</DialogTitle>
        {body}
      </DialogContent>
    </Dialog>
  );
}
