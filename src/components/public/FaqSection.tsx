import { useTenant } from "@/hooks/use-tenant";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { buildFaqItems } from "@/lib/faq";

/**
 * FAQ dépliable, rendue sur la home et alignée sur le JSON-LD FAQPage
 * injecté dans le <head> (voir src/routes/index.tsx).
 * Utilise la même source (buildFaqItems) pour garantir la cohérence entre
 * ce que voit l'utilisateur et ce que voit Google.
 */
export function FaqSection() {
  const { tenant } = useTenant();
  if (!tenant) return null;

  const items = buildFaqItems(tenant);

  return (
    <section className="py-16 lg:py-24">
      <div className="mx-auto max-w-4xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Vos questions
          </span>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            Questions fréquentes
          </h2>
          <p className="mt-4 text-muted-foreground">
            Tout ce qu'il faut savoir avant de nous confier vos travaux.
          </p>
        </div>

        <Accordion type="single" collapsible className="mt-10 w-full">
          {items.map((item, idx) => (
            <AccordionItem key={idx} value={`item-${idx}`}>
              <AccordionTrigger className="text-left text-base font-semibold text-foreground hover:text-primary">
                {item.question}
              </AccordionTrigger>
              <AccordionContent className="text-sm leading-relaxed text-muted-foreground">
                {item.answer}
              </AccordionContent>
            </AccordionItem>
          ))}
        </Accordion>
      </div>
    </section>
  );
}
