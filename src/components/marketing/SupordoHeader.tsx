import { Link, useLocation } from "@tanstack/react-router";

/**
 * SUPORDO brand header — marketing surfaces only (supordo.com).
 *
 * Deliberately NOT shared with the artisan sites' PublicHeader: this one
 * carries the SUPORDO brand, the other carries the tenant's own identity.
 *
 * `NAV_LINKS` is a short explicit list so a future destination (Exemples)
 * slots in without restructuring the header — no dropdown, no mega-menu.
 * Desktop-only (`hidden md:flex`): on a 390px viewport, wordmark + Comment ça
 * marche + Tarifs + "Demander mon site" + "Se connecter" would not fit
 * without shrinking a tap target below 44px. The footer already lists both,
 * so mobile loses nothing — a hamburger menu isn't built for two extra links.
 *
 * "Demander mon site" appears only when a request can really be sent
 * (leadIntakeReady) — a call to action whose page cannot deliver is exactly
 * what this lot removes. "Se connecter" is visually secondary and reachable
 * on phones without scrolling the page.
 */
const NAV_LINKS = [
  { to: "/comment-ca-marche", label: "Comment ça marche" },
  { to: "/tarifs", label: "Tarifs" },
] as const;

export function SupordoHeader({ leadIntakeReady = false }: { leadIntakeReady?: boolean }) {
  const { pathname } = useLocation();
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)]/95 backdrop-blur supports-[backdrop-filter]:bg-[var(--supordo-warm)]/80">
      <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between gap-3 px-5 md:h-[72px] md:px-8">
        <div className="flex items-center gap-1 md:gap-6">
          <Link
            to="/"
            className="-mx-2 inline-flex min-h-11 items-center rounded-[6px] px-2 text-lg font-extrabold tracking-[-0.02em] text-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] md:text-[1.375rem]"
            aria-label="SUPORDO — accueil"
          >
            SUPORDO
          </Link>

          <nav className="hidden items-center gap-1 md:flex" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  aria-current={isActive ? "page" : undefined}
                  className={`inline-flex min-h-11 items-center justify-center rounded-[6px] px-3 text-sm font-medium underline-offset-4 transition-colors hover:text-[var(--supordo-green)] hover:underline active:text-[var(--supordo-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] md:min-h-12 md:px-4 md:text-[15px] ${
                    isActive
                      ? "text-[var(--supordo-forest)] font-semibold"
                      : "text-[var(--supordo-graphite)]"
                  }`}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          {leadIntakeReady && (
            <Link
              to="/demarrer"
              className="inline-flex min-h-11 items-center justify-center rounded-[6px] bg-[var(--supordo-green)] px-4 text-sm font-semibold text-white transition-colors hover:bg-[var(--supordo-green-hover)] active:bg-[var(--supordo-forest)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-forest)] md:min-h-12 md:px-5 md:text-[15px]"
            >
              Demander mon site
            </Link>
          )}
          <Link
            to="/login"
            search={{ redirect: "" }}
            className="inline-flex min-h-11 items-center justify-center rounded-[6px] px-3 text-sm font-medium text-[var(--supordo-graphite)] underline-offset-4 transition-colors hover:text-[var(--supordo-green)] hover:underline active:text-[var(--supordo-green-hover)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--supordo-green)] md:min-h-12 md:px-4 md:text-[15px]"
          >
            Se connecter
          </Link>
        </div>
      </div>
    </header>
  );
}
