import { Link } from "@tanstack/react-router";

/**
 * SUPORDO brand footer — marketing surfaces only (supordo.com).
 *
 * Every entry here has a real destination. "Exemples" and any future
 * product are deliberately absent: their routes do not exist yet (Exemples
 * needs real, authorized client sites), and a footer link without a page is
 * exactly the dishonesty this lot removes. Legal pages
 * (/legal/mentions-legales, /legal/confidentialite) and /tarifs are real
 * routes, added here now that they exist.
 */
export function SupordoFooter() {
  return (
    <footer className="bg-[var(--supordo-forest)] text-white/80">
      <div className="mx-auto grid max-w-[1200px] gap-10 px-5 py-12 md:grid-cols-4 md:px-8 md:py-16">
        <div className="md:col-span-1">
          <p className="text-lg font-extrabold tracking-[-0.02em] text-white">SUPORDO</p>
          <p className="mt-3 max-w-xs text-sm leading-relaxed">
            SUPORDO développe des produits simples pour les entreprises de terrain.
          </p>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Produit</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                to="/"
                className="inline-flex min-h-11 items-center rounded-[6px] underline-offset-4 transition-colors hover:text-white hover:underline active:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-mint-200)]"
              >
                SUPORDO Sites
              </Link>
            </li>
            <li>
              <Link
                to="/tarifs"
                className="inline-flex min-h-11 items-center rounded-[6px] underline-offset-4 transition-colors hover:text-white hover:underline active:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-mint-200)]"
              >
                Tarifs
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">Légal</p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                to="/legal/mentions-legales"
                className="inline-flex min-h-11 items-center rounded-[6px] underline-offset-4 transition-colors hover:text-white hover:underline active:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-mint-200)]"
              >
                Mentions légales
              </Link>
            </li>
            <li>
              <Link
                to="/legal/confidentialite"
                className="inline-flex min-h-11 items-center rounded-[6px] underline-offset-4 transition-colors hover:text-white hover:underline active:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-mint-200)]"
              >
                Confidentialité
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/60">
            Accès client
          </p>
          <ul className="mt-4 space-y-3 text-sm">
            <li>
              <Link
                to="/login"
                search={{ redirect: "" }}
                className="inline-flex min-h-11 items-center rounded-[6px] underline-offset-4 transition-colors hover:text-white hover:underline active:text-white/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-mint-200)]"
              >
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
