import { SupordoSiteDemo } from "./SupordoSiteDemo";
import { DEMO_LABEL } from "@/data/marketing/supordo-demo-site";

/**
 * Acte 3 — La démonstration du site fini.
 *
 * Premier grand moment produit de la page : après s'être reconnu dans son
 * métier, le visiteur voit un site entier, pas une explication de plus.
 *
 * Le site montré est une démonstration construite par SUPORDO, avec une
 * entreprise fictive. L'étiquette est visible avant le titre, et répétée sous
 * la composition — jamais présenté comme un client, un témoignage ou un
 * résultat. Le « peut » du titre est volontaire tant que la démonstration est
 * fictive.
 *
 * Composition : le site occupe l'essentiel de la largeur, la copy reste
 * secondaire. Sur téléphone, la vue mobile passe en premier et la
 * représentation large disparaît — un site entier réduit à 390 px devient
 * illisible, et une capture illisible ne prouve rien.
 */
export function SupordoActDemo() {
  return (
    <section
      id="demonstration"
      className="scroll-mt-20 border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-16 md:py-20 lg:py-24"
      aria-labelledby="supordo-demo-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[640px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            {DEMO_LABEL}
          </p>
          <h2
            id="supordo-demo-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Voilà à quoi peut ressembler votre site.
          </h2>
          <p className="mt-5 text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Prestations, réalisations, zones d'intervention, photos et contact : voici un exemple de
            site préparé avec SUPORDO.
          </p>
        </div>

        {/* Desktop : le site large porte la composition, la vue mobile vient
            s'appuyer dessus en bas à droite — même site, deux écrans.
            Mobile : la vue téléphone seule, en grand. */}
        <div className="mt-10 lg:mt-14">
          <div className="lg:hidden">
            <SupordoSiteDemo variant="mobile" />
          </div>

          <div className="relative hidden lg:block lg:pr-[220px]">
            <SupordoSiteDemo variant="desktop" />
            <div className="absolute bottom-0 right-0 w-[260px] translate-y-6">
              <SupordoSiteDemo variant="mobile" />
            </div>
          </div>
        </div>

        <p className="mt-8 text-sm text-[var(--supordo-graphite)]/70 lg:mt-14">
          Entreprise présentée à titre de démonstration.
        </p>
      </div>
    </section>
  );
}
