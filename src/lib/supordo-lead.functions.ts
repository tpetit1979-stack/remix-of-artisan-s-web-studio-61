/**
 * SUPORDO commercial lead intake — marketing surface only (/demarrer).
 *
 * Doctrine (plan canonique, Lot 1):
 *  - no new marketing table, no CRM persistence: the request is validated
 *    server-side and sent by email, nothing is written to the database;
 *  - the existing tenant function `notify-contact` is NOT reused: it is bound
 *    to a row of the artisan `contacts` table (it "claims" an existing row to
 *    guarantee a single send). A SUPORDO commercial request has no such row.
 *  - no secret ever reaches the browser: the Resend key and both addresses are
 *    read from process.env inside the handler only.
 *
 * Known limitation, deliberately not faked: there is no reliable per-IP rate
 * limit here. The server runs as short-lived edge isolates with no shared
 * memory or store, so an in-memory counter would reset constantly and give a
 * false sense of protection. Anti-spam is therefore limited to a honeypot
 * field and a minimum time-on-page, both re-checked server-side. If real rate
 * limiting becomes necessary it needs a shared store, which is out of scope
 * for this lot (it would mean the persistence the doctrine excludes).
 */
import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

/** A real human needs at least this long to fill the form. */
const MIN_ELAPSED_MS = 3000;

const leadSchema = z.object({
  company: z
    .string()
    .trim()
    .min(2, { message: "Indiquez le nom de votre entreprise." })
    .max(120, { message: "Le nom de l'entreprise est trop long." }),
  trade: z
    .string()
    .trim()
    .min(2, { message: "Indiquez votre métier." })
    .max(80, { message: "Le métier est trop long." }),
  city: z
    .string()
    .trim()
    .min(2, { message: "Indiquez votre ville." })
    .max(80, { message: "La ville est trop longue." }),
  email: z
    .string()
    .trim()
    .email({ message: "Cette adresse email n'est pas valide." })
    .max(255, { message: "L'adresse email est trop longue." }),
  // Optional: useful, but a request is actionable with an email alone.
  phone: z
    .string()
    .trim()
    .max(30, { message: "Le numéro de téléphone est trop long." })
    .regex(/^[0-9+().\s-]*$/, { message: "Ce numéro de téléphone n'est pas valide." })
    .optional()
    .default(""),
  message: z
    .string()
    .trim()
    .max(2000, { message: "Le message est trop long." })
    .optional()
    .default(""),
  /** Honeypot: hidden in the UI, must stay empty. */
  trap: z.string().max(0).optional().default(""),
  /** Milliseconds between page render and submit. */
  elapsedMs: z.number().int().nonnegative(),
});

export type LeadInput = z.input<typeof leadSchema>;

export type LeadResult =
  | { ok: true }
  | { ok: false; reason: "invalid"; message: string }
  | { ok: false; reason: "not_configured" }
  | { ok: false; reason: "send_failed" };

interface LeadConfig {
  apiKey: string;
  to: string;
  from: string;
}

/**
 * The three operational parameters. Missing any of them means the form cannot
 * really send, so it is never offered to visitors (see /demarrer) — no address
 * is ever invented here.
 */
function readConfig(): LeadConfig | null {
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  const to = process.env["SUPORDO_LEAD_TO_EMAIL"]?.trim();
  const from = process.env["SUPORDO_LEAD_FROM_EMAIL"]?.trim();
  if (!apiKey || !to || !from) return null;
  return { apiKey, to, from };
}

/**
 * Public, read-only: tells the marketing pages whether a request can really be
 * sent today. Returns a boolean only — never an address, never a key.
 */
export const getLeadIntakeStatus = createServerFn({ method: "GET" }).handler(async () => ({
  configured: readConfig() !== null,
}));

export const submitSupordoLead = createServerFn({ method: "POST" })
  .inputValidator((data: LeadInput) => data)
  .handler(async ({ data }): Promise<LeadResult> => {
    const parsed = leadSchema.safeParse(data);
    if (!parsed.success) {
      const first = parsed.error.issues[0];
      return {
        ok: false,
        reason: "invalid",
        message: first?.message ?? "Certaines informations ne sont pas valides.",
      };
    }
    const lead = parsed.data;

    // Anti-spam, re-checked server-side. Silent success on purpose: a bot
    // gets no signal about which check rejected it, and no email is sent.
    if (lead.trap.length > 0 || lead.elapsedMs < MIN_ELAPSED_MS) {
      return { ok: true };
    }

    const config = readConfig();
    if (!config) {
      console.error("submitSupordoLead: envoi non configuré (destinataire, expéditeur ou clé absente)");
      return { ok: false, reason: "not_configured" };
    }

    const lines = [
      `Entreprise : ${lead.company}`,
      `Métier : ${lead.trade}`,
      `Ville : ${lead.city}`,
      `Email : ${lead.email}`,
      `Téléphone : ${lead.phone || "non renseigné"}`,
      "",
      "Message :",
      lead.message || "(aucun message)",
    ];
    const text = lines.join("\n");
    const html = `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">${text
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/\n/g, "<br>")}</div>`;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${config.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: config.from,
          to: config.to,
          reply_to: lead.email,
          subject: `Demande de site — ${lead.company} (${lead.city})`,
          text,
          html,
        }),
      });
      if (!response.ok) {
        console.error(
          `submitSupordoLead: échec Resend [${response.status}]: ${await response.text()}`,
        );
        return { ok: false, reason: "send_failed" };
      }
      return { ok: true };
    } catch (error) {
      console.error("submitSupordoLead: erreur réseau", error);
      return { ok: false, reason: "send_failed" };
    }
  });
