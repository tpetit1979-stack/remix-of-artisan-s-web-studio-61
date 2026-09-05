import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useTenant, usePreviewTenantSearch } from "@/hooks/use-tenant";
import { useEditorialTexts } from "@/hooks/use-editorial-texts";
import { fetchPortfolio } from "@/lib/tenant";
import { isAuthenticPublicPortfolioItem } from "@/lib/portfolio";
import { Phone, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { BookingButton } from "./BookingButton";
import { useState } from "react";


export function PublicHeader() {
  const { tenant, settings } = useTenant();
  const previewTenant = usePreviewTenantSearch();
  const { buttonLabel } = useEditorialTexts();
  const [menuOpen, setMenuOpen] = useState(false);


  const { data: portfolio = [] } = useQuery({
    queryKey: ["portfolio", tenant?.id],
    queryFn: () => fetchPortfolio(tenant!.id),
    enabled: !!tenant?.id,
  });

  if (!tenant) return null;

  const hasPortfolio = portfolio.some(isAuthenticPublicPortfolioItem);

  const navLinks = [
    { to: "/" as const, label: "Accueil" },
    { to: "/services" as const, label: "Services" },
    ...(hasPortfolio ? [{ to: "/realisations" as const, label: "Réalisations" }] : []),
    { to: "/contact" as const, label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto grid h-16 max-w-7xl grid-cols-[minmax(0,1fr)_auto] items-center gap-3 px-4 md:flex md:justify-between">
        <Link to="/" search={previewTenant} className="flex min-w-0 items-center gap-2 sm:gap-3">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={`${tenant.company_name} logo`}
              loading="lazy" decoding="async" className="h-8 w-auto shrink-0 object-contain"
            />
          ) : (
            <span className="truncate text-sm font-bold text-foreground sm:text-base md:text-lg">
              {tenant.company_name}
            </span>
          )}
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              search={previewTenant}
              className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
              activeProps={{ className: "text-sm font-medium text-foreground" }}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {/* Phone — always visible */}
          {tenant.phone && (
            <a href={`tel:${tenant.phone.replace(/\s/g, "")}`}>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Phone className="h-4 w-4" />
                <span className="hidden sm:inline">{tenant.phone}</span>
                <span className="sm:hidden">Appeler</span>
              </Button>
            </a>
          )}
          <BookingButton variant="header" />

          <Link to="/contact" search={previewTenant} className="hidden sm:block">
            <Button size="sm" className="shadow-none">Être rappelé</Button>
          </Link>
          {/* Mobile hamburger */}
          <button
            className="ml-1 inline-flex items-center justify-center rounded-md p-2 text-foreground md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="border-t border-border bg-background px-4 pb-4 pt-2 md:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.to}
                to={link.to}
                search={previewTenant}
                className="rounded-md px-3 py-2.5 text-sm font-medium text-foreground transition-colors hover:bg-muted"
                activeProps={{ className: "rounded-md px-3 py-2.5 text-sm font-medium bg-primary/10 text-primary" }}
                onClick={() => setMenuOpen(false)}
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="mt-3 grid gap-2">
            {tenant.phone && (
              <a href={`tel:${tenant.phone.replace(/\s/g, "")}`}>
                <Button variant="outline" className="w-full gap-2">
                  <Phone className="h-4 w-4" />
                  {tenant.phone}
                </Button>
              </a>
            )}
            <BookingButton variant="mobile-menu" onNavigate={() => setMenuOpen(false)} />

            <Link to="/contact" search={previewTenant} onClick={() => setMenuOpen(false)}>
              <Button className="w-full">{buttonLabel}</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
