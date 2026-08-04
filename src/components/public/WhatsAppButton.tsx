import { MessageCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useTenant } from "@/hooks/use-tenant";
import { buildWhatsAppUrl } from "@/lib/whatsapp";
import { cn } from "@/lib/utils";

type Variant = "header" | "mobile-menu" | "floating" | "inline";

interface WhatsAppButtonProps {
  variant?: Variant;
  className?: string;
  /** Button text for header/mobile-menu/inline variants. Defaults to "WhatsApp". */
  label?: string;
}

/**
 * WhatsApp click-to-chat button — only renders when the tenant has explicitly
 * enabled it AND provided a number. Never assumes WhatsApp is available.
 * Plain wa.me link, no third-party script/widget.
 */
export function WhatsAppButton({ variant = "inline", className, label = "WhatsApp" }: WhatsAppButtonProps) {
  const { settings } = useTenant();

  if (!settings?.whatsapp_enabled || !settings.whatsapp_number?.trim()) return null;

  const url = buildWhatsAppUrl(settings.whatsapp_number, settings.whatsapp_message_template);

  if (variant === "floating") {
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        aria-label="Discuter sur WhatsApp"
        className={cn(
          "fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#25D366] text-white shadow-lg transition-transform hover:scale-110 active:scale-95",
          className,
        )}
      >
        <MessageCircle className="h-7 w-7" fill="currentColor" />
      </a>
    );
  }

  return (
    <a href={url} target="_blank" rel="noopener noreferrer" className={variant === "mobile-menu" ? "block" : "inline-block"}>
      <Button
        type="button"
        size={variant === "header" ? "sm" : "default"}
        className={cn(
          "gap-1.5 bg-[#25D366] text-white hover:bg-[#1ebe57]",
          variant === "mobile-menu" && "w-full",
          className,
        )}
      >
        <MessageCircle className="h-4 w-4" />
        <span>{label}</span>
      </Button>
    </a>
  );
}
