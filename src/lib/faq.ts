import type { Tenant } from "@/lib/tenant";

export type FaqItem = { question: string; answer: string };

/**
 * FAQ générique métier, templée sur le tenant.
 * Source unique consommée par le composant UI (Accordion) ET par le
 * JSON-LD FAQPage injecté dans le <head> — garantit que Google voit
 * exactement les mêmes questions/réponses que l'utilisateur.
 */
export function buildFaqItems(tenant: Tenant): FaqItem[] {
  const name = tenant.company_name;
  const city = tenant.city ?? "votre secteur";
  const phone = tenant.phone;

  return [
    {
      question: "Le devis est-il gratuit et sans engagement ?",
      answer: `Oui, tous nos devis sont entièrement gratuits et sans engagement. ${name} se déplace pour évaluer votre projet et vous transmet une proposition détaillée sous 24 à 48h ouvrées.`,
    },
    {
      question: "Sous quel délai intervenez-vous ?",
      answer: `Pour une demande standard, nous planifions l'intervention sous quelques jours après validation du devis. En cas d'urgence, contactez-nous${phone ? ` au ${phone}` : ""} : nous ferons notre maximum pour intervenir rapidement.`,
    },
    {
      question: "Quelle est votre zone d'intervention ?",
      answer: `${name} intervient à ${city} et dans les communes environnantes. Consultez la section "Zones d'intervention" de ce site pour voir la liste complète, ou contactez-nous pour vérifier si nous couvrons votre adresse.`,
    },
    {
      question: "Vos travaux sont-ils garantis ?",
      answer: `Oui. Toutes nos prestations sont couvertes par les garanties légales en vigueur (garantie de parfait achèvement, garantie biennale et décennale selon la nature des travaux). Vous recevez systématiquement une facture détaillée.`,
    },
    {
      question: "Comment se passe le règlement ?",
      answer: `Le règlement s'effectue à la fin des travaux, sur présentation de facture. Un acompte peut être demandé à la signature du devis pour les chantiers importants. Nous acceptons les moyens de paiement usuels (virement, chèque, espèces).`,
    },
    {
      question: "Comment obtenir un rendez-vous ?",
      answer: `${phone ? `Appelez-nous directement au ${phone} ou remplissez` : "Remplissez"} le formulaire de contact de ce site en décrivant votre besoin. Nous vous recontactons rapidement pour convenir d'un créneau qui vous arrange.`,
    },
  ];
}

/**
 * JSON-LD FAQPage — permet à Google d'afficher les questions/réponses
 * directement dans les résultats de recherche (rich snippets).
 */
export function buildFaqJsonLd(items: FaqItem[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  };
}
