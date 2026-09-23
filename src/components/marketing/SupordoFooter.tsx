import { Link } from "@tanstack/react-router";
import { MARKETING_FOOTER_SECTIONS } from "@/data/marketing/supordo-nav";

/**
 * SUPORDO brand footer — marketing surfaces only (supordo.com).
 *
 * Les colonnes viennent de `src/data/marketing/supordo-nav.ts`, partagé avec
 * l'en-tête et `/sitemap.xml`. Ce fichier portait jusqu'ici un commentaire
 * expliquant pourquoi « Exemples » en était absent : la page n'existait pas.
 * Elle existe, et la liste unique fait que ce genre d'écart ne peut plus
 * s'installer sans qu'on le voie.
 *
 * L'accès client reste sa propre colonne : ce n'est pas une page marketing,
 * et il n'a rien à faire dans le sitemap public.
 */
const LINK_CLASS =
  "inline-flex min-h-11 items-center rounded-[6px] underline-offset-4 transition-colors hover:text-white hover:underline active:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-mint-200)]";

export function SupordoFooter() {
  return (
    <footer className="bg-[var(--supordo-forest)] text-white/80">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 md:grid-cols-5 md:px-8 md:py-16">
        <div className="md:col-span-1">
          <p className="text-lg font-extrabold tracking-[-0.02em] text-white">SUPORDO</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            SUPORDO développe des produits simples pour les entreprises de terrain.
          </p>
        </div>

        {MARKETING_FOOTER_SECTIONS.map((section) => (
          <div key={section.title}>
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
              {section.title}
            </p>
            <ul className="mt-4 space-y-3 text-sm">
              {section.links.map((link) => (
                <li key={link.to}>
                  {"src" in link ? (
                    <Link to={link.to} search={{ src: link.src }} className={LINK_CLASS}>
                      {link.label}
                    </Link>
                  ) : (
                    <Link to={link.to} className={LINK_CLASS}>
                      {link.label}
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
            Accès client
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link to="/login" search={{ redirect: "" }} className={LINK_CLASS}>
                Se connecter
              </Link>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1200px] px-5 py-6 text-xs text-white/50 md:px-8">
          SUPORDO
        </div>
      </div>
    </footer>
  );
}
