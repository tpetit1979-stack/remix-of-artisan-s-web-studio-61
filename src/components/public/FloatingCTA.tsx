import { Phone } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { useTenant } from "@/hooks/use-tenant";
import { BookingButton } from "./BookingButton";

/**
 * Sticky bottom CTA bar on mobile (md:hidden).
 * - Left: tel:{phone} "Appeler" — hidden if phone is null.
 * - Right: /contact "Devis gratuit" — always visible.
 * BookingButton (floating variant) remains above when enabled.
 */
export function FloatingCTA() {
  const { tenant } = useTenant();
  const phone = tenant?.phone?.trim();

  return (
    <>
      <BookingButton variant="floating" />
      <div className="fixed inset-x-0 bottom-0 z-40 flex gap-2 border-t border-border bg-background/95 p-3 shadow-elegant backdrop-blur supports-[backdrop-filter]:bg-background/80 md:hidden">
        {phone && (
          <a
            href={`tel:${phone.replace(/\s/g, "")}`}
            className="flex flex-1 items-center justify-center gap-2 rounded-md border border-border bg-background px-4 py-3 text-sm font-semibold text-foreground active:scale-95"
            aria-label={`Appeler ${tenant?.company_name ?? ""}`}
          >
            <Phone className="h-4 w-4" />
            Appeler
          </a>
        )}
        <Link
          to="/contact"
          className="flex flex-1 items-center justify-center rounded-md bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground active:scale-95"
        >
          Devis gratuit
        </Link>
      </div>
    </>
  );
}
