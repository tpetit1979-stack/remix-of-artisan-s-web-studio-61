/**
 * Trade recognition section for the SUPORDO Sites marketing landing only.
 *
 * Illustrations are SUPORDO-owned brand assets (photothèque SUPORDO, lot
 * `brand`), importées depuis le dépôt et servies par le build. Aucun média
 * tenant, aucune image de la bibliothèque générique multi-tenant.
 *
 * Fond Mint-100 ("Warm très léger") : casse l'adjacence de deux fonds blancs
 * consécutifs avec l'Acte 3 juste après, dans le rythme de page Hero(Warm) →
 * Métiers(Mint-100) → Acte 3(blanc) → Acte 5(Warm) → Acte 6(blanc) → Acte 7(Warm).
 */
import chauffagiste from "@/assets/marketing/brand/trades/supordo-trade-heating.webp";
import plombier from "@/assets/marketing/brand/trades/supordo-trade-plumbing.webp";
import electricien from "@/assets/marketing/brand/trades/supordo-trade-electrical.webp";
import ramoneurCheminee from "@/assets/marketing/brand/trades/supordo-trade-chimney-sweep.webp";
import poeles from "@/assets/marketing/brand/trades/supordo-trade-stove-installer.webp";
import pompeAChaleur from "@/assets/marketing/brand/trades/supordo-trade-heat-pump.webp";
import climaticien from "@/assets/marketing/brand/trades/supordo-trade-air-conditioning.webp";
import couvreur from "@/assets/marketing/brand/trades/supordo-trade-roofing.webp";
import menuisier from "@/assets/marketing/brand/trades/supordo-trade-carpentry.webp";
import macon from "@/assets/marketing/brand/trades/supordo-trade-masonry.webp";
import paysagiste from "@/assets/marketing/brand/trades/supordo-trade-landscaping.webp";
import peintre from "@/assets/marketing/brand/trades/supordo-trade-painting.webp";

const TRADES = [
  {
    name: "Chauffagiste",
    image: chauffagiste,
    alt: "Chauffagiste réglant une chaudière murale",
  },
  {
    name: "Plombier",
    image: plombier,
    alt: "Plombier intervenant sur une installation sanitaire",
  },
  {
    name: "Électricien",
    image: electricien,
    alt: "Électricien travaillant sur un tableau électrique",
  },
  {
    name: "Ramoneur · Professionnel de la cheminée",
    image: ramoneurCheminee,
    alt: "Ramoneur entretenant un conduit de cheminée",
  },
  {
    name: "Poseur de poêles",
    image: poeles,
    alt: "Installateur posant un poêle à bois dans un séjour",
  },
  {
    name: "Installateur de pompes à chaleur",
    image: pompeAChaleur,
    alt: "Technicien installant une pompe à chaleur en extérieur",
  },
  {
    name: "Climaticien",
    image: climaticien,
    alt: "Climaticien posant une unité intérieure de climatisation",
  },
  { name: "Couvreur", image: couvreur, alt: "Couvreur travaillant sur une toiture en tuiles" },
  { name: "Menuisier", image: menuisier, alt: "Menuisier travaillant le bois en atelier" },
  { name: "Maçon", image: macon, alt: "Maçon réalisant un ouvrage de maçonnerie" },
  { name: "Paysagiste", image: paysagiste, alt: "Paysagiste entretenant un jardin" },
  { name: "Peintre", image: peintre, alt: "Peintre réalisant une peinture intérieure" },
] as const;

export function SupordoTrades() {
  return (
    <section
      className="overflow-hidden border-t border-[var(--supordo-mint-200)] bg-[var(--supordo-mint-100)] py-24 md:py-28 lg:py-32"
      aria-labelledby="supordo-trades-title"
    >
      <div className="mx-auto max-w-[1200px] px-5 md:px-8">
        <div className="max-w-[760px]">
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-[var(--supordo-green)] lg:text-sm">
            DES SITES POUR LES ENTREPRISES DE TERRAIN
          </p>
          <h2
            id="supordo-trades-title"
            className="mt-4 text-[2rem] font-extrabold leading-[1.12] text-[var(--supordo-forest)] sm:text-[2.5rem] lg:text-[3rem]"
          >
            Votre métier doit se reconnaître dans votre site.
          </h2>
          <p className="mt-5 max-w-[650px] text-base leading-relaxed text-[var(--supordo-graphite)] lg:text-lg">
            Chauffage, plomberie, électricité, couverture ou autres métiers de terrain : le contenu
            part de ce que fait réellement votre entreprise.
          </p>
        </div>

        <div className="mt-8 md:mt-10">
          <ul
            className="-mx-5 flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 [scrollbar-color:var(--supordo-green)_var(--supordo-mint-100)] [scrollbar-width:thin] md:-mx-8 md:gap-5 md:px-8 lg:ml-0 lg:-mr-16 lg:pr-16"
            aria-label="Métiers accompagnés par SUPORDO Sites"
          >
            {TRADES.map((trade) => (
              <li
                key={trade.name}
                className="w-[70vw] max-w-[300px] shrink-0 snap-start md:w-[300px] lg:w-[268px]"
              >
                <article className="overflow-hidden rounded-[6px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] transition-colors duration-200 hover:border-[var(--supordo-green)]/40">
                  <div className="aspect-[4/5] bg-[var(--supordo-mint-100)]">
                    <img
                      src={trade.image}
                      alt={trade.alt}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover object-center"
                    />
                  </div>
                  <div className="flex min-h-20 items-center border-t border-[var(--supordo-mint-200)] px-5 py-4">
                    <h3 className="text-lg font-bold leading-snug text-[var(--supordo-forest)]">
                      {trade.name}
                    </h3>
                  </div>
                </article>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
