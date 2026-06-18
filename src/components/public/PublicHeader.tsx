import { Link } from "@tanstack/react-router";
import { useTenant } from "@/hooks/use-tenant";
import { Phone, Menu, X } from "lucide-react";
import { CertificationBadges } from "./CertificationBadges";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export function PublicHeader() {
  const { tenant, settings } = useTenant();
  const [menuOpen, setMenuOpen] = useState(false);

  if (!tenant) return null;

  const navLinks = [
    { to: "/" as const, label: "Accueil" },
    { to: "/services" as const, label: "Services" },
    { to: "/realisations" as const, label: "Réalisations" },
    { to: "/contact" as const, label: "Contact" },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
        <Link to="/" className="flex items-center gap-3">
          {settings?.logo_url ? (
            <img
              src={settings.logo_url}
              alt={`${tenant.company_name} logo`}
              className="h-8 w-auto object-contain"
            />
          ) : (
            <span className="text-lg font-bold text-foreground">
              {tenant.company_name}
            </span>
          )}
          <CertificationBadges variant="header" />
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
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
          <Link to="/contact" className="hidden sm:block">
            <Button size="sm">{settings?.cta_text ?? "Demander un devis"}</Button>
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
            <Link to="/contact" onClick={() => setMenuOpen(false)}>
              <Button className="w-full">{settings?.cta_text ?? "Demander un devis"}</Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
