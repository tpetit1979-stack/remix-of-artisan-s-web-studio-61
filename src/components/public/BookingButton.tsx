import { useState } from "react";
import { Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useTenant } from "@/hooks/use-tenant";
import { cn } from "@/lib/utils";

type Variant = "header" | "mobile-menu" | "floating";

interface BookingButtonProps {
  variant?: Variant;
  className?: string;
  onNavigate?: () => void;
}

/**
 * Online booking button — only renders when site_settings.booking_enabled is true.
 * If booking_url is set, opens it in a new tab. Otherwise shows a "coming soon" modal.
 */
export function BookingButton({ variant = "header", className, onNavigate }: BookingButtonProps) {
  const { tenant, settings } = useTenant();
  const [open, setOpen] = useState(false);

  // Booking columns are added by a separate migration on the user's Supabase
  // project; cast here so the component compiles before types.ts is regenerated.
  const s = settings as
    | (typeof settings & {
        booking_enabled?: boolean | null;
        booking_url?: string | null;
        booking_button_label?: string | null;
      })
    | null;

  if (!s?.booking_enabled) return null;

  const label = s.booking_button_label?.trim() || "Prendre rendez-vous";
  const url = s.booking_url?.trim() || "";
  const ariaLabel = `${label}${tenant?.company_name ? ` avec ${tenant.company_name}` : ""}`;


  function handleClick(e: React.MouseEvent) {
    onNavigate?.();
    if (!url) {
      e.preventDefault();
      setOpen(true);
    }
  }

  const commonProps = {
    onClick: handleClick,
    "aria-label": ariaLabel,
  };

  const buttonNode =
    variant === "floating" ? (
      url ? (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className={cn(
            "fixed bottom-4 right-20 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-transform hover:scale-110 active:scale-95 md:hidden",
            className,
          )}
          {...commonProps}
        >
          <Calendar className="h-6 w-6" />
        </a>
      ) : (
        <button
          type="button"
          className={cn(
            "fixed bottom-4 right-20 z-50 flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background text-foreground shadow-lg transition-transform hover:scale-110 active:scale-95 md:hidden",
            className,
          )}
          {...commonProps}
        >
          <Calendar className="h-6 w-6" />
        </button>
      )
    ) : url ? (
      <a href={url} target="_blank" rel="noopener noreferrer" {...commonProps} className={variant === "mobile-menu" ? "block" : "inline-block"}>
        <Button
          variant="outline"
          size={variant === "header" ? "sm" : "default"}
          className={cn(variant === "mobile-menu" ? "w-full gap-2" : "gap-1.5", className)}
        >
          <Calendar className="h-4 w-4" />
          <span className={variant === "header" ? "hidden sm:inline" : ""}>{label}</span>
          {variant === "header" && <span className="sm:hidden">RDV</span>}
        </Button>
      </a>
    ) : (
      <Button
        type="button"
        variant="outline"
        size={variant === "header" ? "sm" : "default"}
        className={cn(variant === "mobile-menu" ? "w-full gap-2" : "gap-1.5", className)}
        {...commonProps}
      >
        <Calendar className="h-4 w-4" />
        <span className={variant === "header" ? "hidden sm:inline" : ""}>{label}</span>
        {variant === "header" && <span className="sm:hidden">RDV</span>}
      </Button>
    );

  return (
    <>
      {buttonNode}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Prise de rendez-vous</DialogTitle>
            <DialogDescription>
              La prise de rendez-vous en ligne sera bientôt disponible pour cet artisan.
            </DialogDescription>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    </>
  );
}
