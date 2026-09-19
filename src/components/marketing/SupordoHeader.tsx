import { Link } from "@tanstack/react-router";

/**
 * SUPORDO brand header — marketing surfaces only (supordo.com).
 *
 * Deliberately NOT shared with the artisan sites' PublicHeader: this one
 * carries the SUPORDO brand, the other carries the tenant's own identity.
 *
 * Sites / CRM / Tarifs / Ressources are rendered as plain text, not links:
 * none of those routes exists yet, and a link to a non-existent route would
 * be misleading (and, with TanStack's typed Links, unbuildable). They show
 * the intended brand architecture without promising navigation. "Se
 * connecter" is the only real destination and points at the existing /login.
 */
const NAV_ITEMS = ["Sites", "CRM", "Tarifs", "Ressources"];

export function SupordoHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--supordo-warm)]/80">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-5 md:h-[72px] md:px-8">
        <Link
          to="/"
          className="-mx-2 inline-flex min-h-11 items-center rounded-[6px] px-2 text-lg font-extrabold tracking-[-0.02em] text-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] md:text-[1.375rem]"
          aria-label="SUPORDO — accueil"
        >
          SUPORDO
        </Link>

        <nav aria-label="Produits SUPORDO" className="hidden md:block">
          <ul className="flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <li
                key={item}
                className="text-[15px] font-medium text-[var(--supordo-graphite)]"
              >
                {item}
              </li>
            ))}
          </ul>
        </nav>

        <Link
          to="/login"
          search={{ redirect: "" }}
          className="inline-flex min-h-11 items-center justify-center rounded-[6px] border border-[var(--supordo-mint-200)] bg-white px-4 text-sm font-semibold text-[var(--supordo-forest)] transition-colors hover:border-[var(--supordo-green)] hover:text-[var(--supordo-green)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] active:bg-[var(--supordo-mint-100)] md:min-h-12 md:px-5 md:text-[15px]"
        >
          Se connecter
        </Link>
      </div>
    </header>
  );
}
