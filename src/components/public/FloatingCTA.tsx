import { Phone } from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";
import { BookingButton } from "./BookingButton";

/**
 * Floating phone button on mobile — sticky bottom-right.
 * Only visible on small screens when tenant has a phone number.
 * Also renders the booking button when enabled.
 */
export function FloatingCTA() {
  const { tenant } = useTenant();

  return (
    <>
      <BookingButton variant="floating" />
      {tenant?.phone && (
        <a
          href={`tel:${tenant.phone.replace(/\s/g, "")}`}
          className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg transition-transform hover:scale-110 active:scale-95 md:hidden"
          aria-label={`Appeler ${tenant.company_name}`}
        >
          <Phone className="h-6 w-6" />
        </a>
      )}
    </>
  );
}
