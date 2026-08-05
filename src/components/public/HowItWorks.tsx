import { PhoneCall, FileText, Wrench, ShieldCheck } from "lucide-react";
import { useTenant } from "@/hooks/use-tenant";

/**
 * "Comment ça se passe" — process en 4 étapes.
 * 100% statique, aucune donnée BDD requise. Rassure le visiteur qui
 * ne connaît pas l'artisan en montrant le déroulé d'une prestation type.
 * Inspiré des sites Simplébo/Solocal (section systématique).
 */
const STEPS = [
  {
    icon: PhoneCall,
    title: "Prenez contact",
    description:
      "Appelez-nous ou remplissez le formulaire. Nous étudions votre demande.",
  },
  {
    icon: FileText,
    title: "Étude & devis",
    description:
      "Nous étudions votre besoin et vous transmettons un devis détaillé, sans engagement.",
  },
  {
    icon: Wrench,
    title: "Intervention",
    description:
      "Une fois le devis validé, nous planifions et réalisons les travaux dans les délais convenus.",
  },
  {
    icon: ShieldCheck,
    title: "Garantie & suivi",
    description:
      "Vos travaux sont garantis. Nous restons disponibles pour toute question après la livraison.",
  },
];

export function HowItWorks() {
  const { tenant } = useTenant();
  if (!tenant) return null;

  return (
    <section className="border-t border-border bg-muted/30 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl px-4">
        <div className="mx-auto max-w-2xl text-center">
          <span className="text-sm font-semibold uppercase tracking-wider text-primary">
            Notre méthode
          </span>
          <h2 className="mt-2 text-3xl font-bold text-foreground sm:text-4xl">
            Comment ça se passe ?
          </h2>
          <p className="mt-4 text-muted-foreground">
            Un processus simple et transparent, de votre premier appel jusqu'à la fin des travaux.
          </p>
        </div>

        <ol className="mx-auto mt-12 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {STEPS.map((step, idx) => (
            <li
              key={step.title}
              className="relative flex flex-col items-start rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
            >
              <span
                aria-hidden="true"
                className="absolute -top-3 -left-3 flex h-8 w-8 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-md"
              >
                {idx + 1}
              </span>
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                <step.icon className="h-6 w-6 text-primary" aria-hidden="true" />
              </div>
              <h3 className="text-base font-semibold text-foreground">{step.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
