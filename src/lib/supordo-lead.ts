/**
 * SUPORDO — règles pures des demandes commerciales : validation, forme de la
 * ligne en base, contenu de la notification.
 *
 * Séparé de `supordo-lead.functions.ts` pour une raison simple : ces règles
 * sont celles qu'on veut pouvoir tester sans démarrer de serveur ni toucher
 * à la base. Le fichier .functions y ajoute les accès réseau et base.
 */
import { z } from "zod";

/** Un humain met au moins ce temps à remplir le formulaire. */
export const MIN_ELAPSED_MS = 3000;

/** Valeur de `trade` quand le métier n'est pas dans la taxonomie. */
export const TRADE_OTHER = "autre";

export const LEAD_INTENTS = ["site_request", "callback"] as const;
export const LEAD_SOURCES = [
  "home",
  "pricing",
  "how_it_works",
  "examples",
  "start",
  "confirmation",
] as const;

export type LeadIntent = (typeof LEAD_INTENTS)[number];
export type LeadSource = (typeof LEAD_SOURCES)[number];

const phoneSchema = z
  .string()
  .trim()
  .min(6, { message: "Indiquez un numéro de téléphone." })
  .max(30, { message: "Le numéro de téléphone est trop long." })
  .regex(/^[0-9+().\s-]+$/, { message: "Ce numéro de téléphone n'est pas valide." });

const nameSchema = (message: string) =>
  z.string().trim().min(2, { message }).max(80, { message: "Ce champ est trop long." });

/** Commun aux deux formulaires : qui appeler, et d'où vient la demande. */
const baseFields = {
  source: z.enum(LEAD_SOURCES),
  firstName: nameSchema("Indiquez votre prénom."),
  lastName: nameSchema("Indiquez votre nom."),
  phone: phoneSchema,
  /** Slug de `trade_templates`, ou "autre". */
  trade: z.string().trim().max(80).optional().default(""),
  /** Texte libre, seulement quand `trade` vaut "autre". */
  tradeOther: z.string().trim().max(80).optional().default(""),
  /**
   * Piège à bots : masqué dans l'interface, un visiteur ne le remplit jamais.
   *
   * Le schéma accepte volontairement une valeur ici. Le rejeter dès la
   * validation renverrait une erreur au robot, donc l'information qu'il a été
   * repéré et quel champ l'a trahi. La détection se fait plus loin, dans
   * `isLikelyBot`, pour répondre un succès ordinaire sans rien écrire ni
   * envoyer. La borne haute ne sert qu'à ne pas transporter une charge utile
   * démesurée.
   */
  trap: z.string().max(200).optional().default(""),
  /** Millisecondes entre l'affichage de la page et l'envoi. */
  elapsedMs: z.number().int().nonnegative(),
};

const callbackSchema = z.object({
  intent: z.literal("callback"),
  ...baseFields,
});

const siteRequestSchema = z.object({
  intent: z.literal("site_request"),
  ...baseFields,
  company: z
    .string()
    .trim()
    .min(2, { message: "Indiquez le nom de votre entreprise." })
    .max(120, { message: "Le nom de l'entreprise est trop long." }),
  city: z
    .string()
    .trim()
    .min(2, { message: "Indiquez votre commune." })
    .max(80, { message: "Le nom de la commune est trop long." }),
  email: z
    .string()
    .trim()
    .email({ message: "Cette adresse email n'est pas valide." })
    .max(255, { message: "L'adresse email est trop longue." }),
  currentWebsite: z
    .string()
    .trim()
    .max(255, { message: "L'adresse de votre site est trop longue." })
    .optional()
    .default(""),
  message: z
    .string()
    .trim()
    .max(2000, { message: "Le message est trop long." })
    .optional()
    .default(""),
});

export const leadSchema = z
  .discriminatedUnion("intent", [callbackSchema, siteRequestSchema])
  .superRefine((lead, ctx) => {
    // Le métier est obligatoire pour une demande de site, facultatif pour un rappel.
    if (lead.intent === "site_request" && !lead.trade) {
      ctx.addIssue({ code: "custom", path: ["trade"], message: "Indiquez votre métier." });
    }
    // "Autre" n'a de sens qu'accompagné du métier écrit en toutes lettres,
    // et le texte libre n'a pas de sens sans "Autre" — même règle que la
    // contrainte CHECK de la table.
    if (lead.trade === TRADE_OTHER && !lead.tradeOther) {
      ctx.addIssue({ code: "custom", path: ["tradeOther"], message: "Précisez votre métier." });
    }
    if (lead.trade !== TRADE_OTHER && lead.tradeOther) {
      ctx.addIssue({
        code: "custom",
        path: ["tradeOther"],
        message: "Ce champ ne se remplit que si vous avez choisi « Autre ».",
      });
    }
  });

export type LeadInput = z.input<typeof leadSchema>;
export type ParsedLead = z.output<typeof leadSchema>;

export type LeadResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; message: string }
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "save_failed" };

/** Colonnes de `marketing_leads`, dans la forme attendue par la table. */
/**
 * Décide si une soumission valide est en réalité automatisée.
 *
 * Deux signaux, tous deux revérifiés côté serveur : le piège rempli, et un
 * formulaire envoyé plus vite qu'un humain ne peut le remplir. L'appelant
 * répond alors un succès ordinaire : rien n'est enregistré, rien n'est
 * envoyé, et le robot n'apprend pas ce qui l'a trahi.
 */
export function isLikelyBot(lead: ParsedLead): boolean {
  return lead.trap.trim().length > 0 || lead.elapsedMs < MIN_ELAPSED_MS;
}

export function toRow(lead: ParsedLead) {
  const site = lead.intent === "site_request" ? lead : null;
  return {
    intent: lead.intent,
    source: lead.source,
    first_name: lead.firstName,
    last_name: lead.lastName,
    phone: lead.phone,
    trade: lead.trade || null,
    trade_other: lead.trade === TRADE_OTHER ? lead.tradeOther : null,
    company: site?.company ?? null,
    city: site?.city ?? null,
    email: site?.email ?? null,
    current_website: site?.currentWebsite || null,
    message: site?.message || null,
  };
}

/** Corps de la notification envoyée à SUPORDO. */
export function buildNotification(lead: ParsedLead) {
  const trade =
    lead.trade === TRADE_OTHER ? `${lead.tradeOther} (hors liste)` : lead.trade || "non renseigné";
  const who = `${lead.firstName} ${lead.lastName}`;

  if (lead.intent === "callback") {
    return {
      subject: `Rappel demandé — ${who}`,
      lines: [
        "Demande de rappel.",
        "",
        `Nom : ${who}`,
        `Téléphone : ${lead.phone}`,
        `Métier : ${trade}`,
        `Origine : ${lead.source}`,
      ],
    };
  }
  return {
    subject: `Demande de site — ${lead.company} (${lead.city})`,
    lines: [
      "Demande de site.",
      "",
      `Nom : ${who}`,
      `Entreprise : ${lead.company}`,
      `Métier : ${trade}`,
      `Commune : ${lead.city}`,
      `Téléphone : ${lead.phone}`,
      `Email : ${lead.email}`,
      `Site actuel : ${lead.currentWebsite || "aucun"}`,
      `Origine : ${lead.source}`,
      "",
      "Message :",
      lead.message || "(aucun message)",
    ],
  };
}

export function escapeHtml(text: string): string {
  return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
