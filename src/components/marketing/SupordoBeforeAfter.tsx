import { AspectRatio } from "@/components/ui/aspect-ratio";
import type { DemoProject } from "@/data/marketing/supordo-demo-site";

/**
 * Un chantier avant, le même chantier après.
 *
 * Deux images côte à côte sur écran large, empilées sur téléphone : pas de
 * poignée coulissante. Le sujet est le chantier, pas l'interaction — et une
 * poignée oblige à manipuler pour comprendre, là où deux images se lisent
 * d'un coup d'œil.
 *
 * `AspectRatio` garantit que l'avant et l'après occupent exactement la même
 * hauteur : sans cela, deux photographies de proportions différentes
 * détruisent la comparaison.
 *
 * Tant que les photographies ne sont pas fournies, un emplacement dimensionné
 * prend leur place, avec ce qu'il attend. Inventer une image serait présenter
 * un chantier qui n'a pas eu lieu.
 */
function Volet({
  label,
  src,
  alt,
  attendu,
}: {
  label: string;
  src?: string | null;
  alt?: string;
  attendu: string;
}) {
  return (
    <figure className="relative overflow-hidden rounded-[10px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)]">
      <AspectRatio ratio={4 / 3}>
        {src ? (
          <img
            src={src}
            alt={alt ?? ""}
            loading="lazy"
            decoding="async"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center px-5 text-center">
            <p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-forest)]/45">
              Photographie à venir
            </p>
            <p className="mt-2 max-w-[28ch] text-xs leading-relaxed text-[var(--supordo-graphite)]/70">
              {attendu}
            </p>
          </div>
        )}
      </AspectRatio>
      <figcaption className="absolute left-3 top-3 rounded-[4px] bg-[var(--supordo-forest)]/85 px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.12em] text-white">
        {label}
      </figcaption>
    </figure>
  );
}

export function SupordoBeforeAfter({ project }: { project: DemoProject }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2">
      <Volet
        label="Avant"
        src={project.beforeImage}
        alt={project.beforeAlt}
        attendu={project.beforeAlt ?? "État du chantier avant travaux."}
      />
      <Volet
        label="Après"
        src={project.afterImage}
        alt={project.afterAlt}
        attendu={project.afterAlt ?? "Même chantier après travaux."}
      />
    </div>
  );
}
