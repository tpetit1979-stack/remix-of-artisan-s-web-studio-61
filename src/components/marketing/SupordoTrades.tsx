/**
 * Trade recognition section for the SUPORDO Sites marketing landing only.
 *
 * Illustrations are SUPORDO-owned brand assets served from the CDN through
 * `.asset.json` pointers. No tenant media is used here.
 *
 * Fond Mint-100 ("Warm très léger") : casse l'adjacence de deux fonds blancs
 * consécutifs avec l'Acte 3 juste après, dans le rythme de page Hero(Warm) →
 * Métiers(Mint-100) → Acte 3(blanc) → Acte 5(Warm) → Acte 6(blanc) → Acte 7(Warm).
 */
import chauffagiste from "@/assets/marketing/trades/chauffagiste.webp.asset.json";
import plombier from "@/assets/marketing/trades/plombier.webp.asset.json";
import electricien from "@/assets/marketing/trades/electricien.webp.asset.json";
import ramoneurCheminee from "@/assets/marketing/trades/ramoneur-cheminee.webp.asset.json";
import climaticien from "@/assets/marketing/trades/climaticien.webp.asset.json";
import couvreur from "@/assets/marketing/trades/couvreur.webp.asset.json";
import menuisier from "@/assets/marketing/trades/menuisier.webp.asset.json";
import macon from "@/assets/marketing/trades/macon.webp.asset.json";
import paysagiste from "@/assets/marketing/trades/paysagiste.webp.asset.json";
import peintre from "@/assets/marketing/trades/peintre.webp.asset.json";

const TRADES = [
  {
    name: "Chauffagiste",
    image: chauffagiste.url,
    alt: "Chauffagiste installant une pompe à chaleur",
  },
  {
    name: "Plombier",
    image: plombier.url,
    alt: "Plombier intervenant sous un meuble de salle de bain",
  },
  {
    name: "Électricien",
    image: electricien.url,
    alt: "Électricien travaillant sur un tableau électrique",
  },
  {
    name: "Ramoneur · Professionnel de la cheminée",
    image: ramoneurCheminee.url,
    alt: "Ramoneur entretenant un conduit de poêle à bois",
  },
  {
    name: "Climaticien",
    image: climaticien.url,
    alt: "Climaticien posant une unité intérieure de climatisation",
  },
  { name: "Couvreur", image: couvreur.url, alt: "Couvreur travaillant sur une toiture" },
  { name: "Menuisier", image: menuisier.url, alt: "Menuisier travaillant le bois en atelier" },
  { name: "Maçon", image: macon.url, alt: "Maçon réalisant un ouvrage de maçonnerie" },
  { name: "Paysagiste", image: paysagiste.url, alt: "Paysagiste taillant une haie" },
  { name: "Peintre", image: peintre.url, alt: "Peintre réalisant une peinture intérieure" },
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
