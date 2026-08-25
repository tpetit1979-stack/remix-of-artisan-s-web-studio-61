import { Card } from "@/components/ui/card";

interface PortfolioCardProps {
  title: string;
  imageUrl: string;
  city?: string | null;
  serviceName?: string | null;
  onOpen: () => void;
}

/**
 * Shared vignette for every public surface showing réalisations (accueil,
 * /realisations, Service, Service×Ville) — the whole card is one clickable
 * unit (opens PortfolioViewer), not just an image with separate controls.
 * Grille = découverte visuelle ; le détail (description complète, etc.)
 * vit dans PortfolioViewer, jamais ici.
 */
export function PortfolioCard({ title, imageUrl, city, serviceName, onOpen }: PortfolioCardProps) {
  const meta = [city, serviceName].filter(Boolean).join(" · ");
  return (
    <Card className="overflow-hidden">
      <button
        type="button"
        onClick={onOpen}
        className="group block w-full rounded-xl text-left transition-all hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
      >
        <div className="aspect-video w-full overflow-hidden bg-muted">
          <img
            src={imageUrl}
            alt={title}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        </div>
        <div className="p-4">
          <h3 className="line-clamp-2 font-medium text-foreground">{title}</h3>
          {meta && <p className="mt-1 text-xs text-muted-foreground">{meta}</p>}
        </div>
      </button>
    </Card>
  );
}
