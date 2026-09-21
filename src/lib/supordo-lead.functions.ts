/**
 * SUPORDO — prise en charge des demandes commerciales du site marketing.
 *
 * Flux, dans cet ordre strict :
 *   validation → anti-spam → persistance `marketing_leads` → notification email
 *
 * La persistance passe avant la notification, et c'est le point important :
 * un échec d'envoi Resend ne fait plus disparaître la demande. La ligne reste
 * en base avec `notified_at` à null, ce qui suffit à retrouver les prospects
 * non signalés (index partiel dédié).
 *
 * Deux formulaires, un seul mécanisme serveur :
 *   - `callback`     — rappel express : prénom, nom, téléphone.
 *   - `site_request` — demande de site : + entreprise, métier, ville, email.
 * `source` dit d'où vient la demande. Le futur chatbot utilisera la même
 * fonction avec une source supplémentaire, sans second point d'entrée.
 *
 * Écriture via le client privilégié de `@/lib/supabase-admin.server`, qui
 * appartient au code marketing et contourne RLS : `marketing_leads` n'a aucune
 * policy d'insertion publique, donc rien ne peut y être inséré depuis un
 * navigateur. Aucun secret ne quitte le serveur.
 *
 * Limite connue, toujours non simulée : il n'y a pas de limitation par IP.
 * Le serveur tourne en isolats de courte durée sans mémoire partagée, où un
 * compteur en mémoire donnerait une fausse impression de protection.
 * L'anti-spam reste le piège à bots et le temps minimum de saisie, tous deux
 * revérifiés côté serveur. La persistance rendrait désormais une vraie
 * limitation possible (comptage en base) — hors périmètre de ce lot.
 */
import { createServerFn } from "@tanstack/react-start";
import { supabase } from "@/integrations/supabase/client";
import { getSupabaseMarketingAdmin } from "@/lib/supabase-admin.server";
import {
  isLeadIntakeReady,
  isLeadPersistenceConfigured,
  readLeadDeliveryConfig,
} from "@/lib/marketing-config";
import {
  buildNotification,
  escapeHtml,
  isLikelyBot,
  leadSchema,
  toRow,
  TRADE_OTHER,
  type LeadInput,
  type LeadResult,
} from "@/lib/supordo-lead";

/**
 * Indique aux pages marketing si une demande peut réellement être prise en
 * charge aujourd'hui — c'est-à-dire conservée ET signalée. Ne renvoie qu'un
 * booléen : jamais une adresse, jamais une clé.
 */
export const getLeadIntakeStatus = createServerFn({ method: "GET" }).handler(async () => ({
  configured: isLeadIntakeReady(),
}));

/**
 * Vérifie que le métier envoyé appartient bien à la taxonomie réelle.
 * La colonne `trade` n'a pas de clé étrangère — le slug est figé au moment de
 * la demande — donc la cohérence se vérifie ici, sinon `/exemples` filtrerait
 * plus tard sur des valeurs inventées. Lecture publique (`trade_templates`
 * est lisible par tous), pas besoin du client privilégié.
 */
async function isKnownTrade(slug: string): Promise<boolean> {
  if (slug === TRADE_OTHER) return true;
  const { data, error } = await supabase
    .from("trade_templates")
    .select("slug")
    .eq("slug", slug)
    .maybeSingle();
  if (error) {
    console.error("submitSupordoLead: lecture trade_templates impossible", error);
    return false;
  }
  return data !== null;
}

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

    // Succès silencieux volontaire : un robot n'apprend pas ce qui l'a trahi.
    // Rien n'est écrit en base, aucune notification ne part.
    if (isLikelyBot(lead)) {
      return { ok: true };
    }

    if (lead.trade && !(await isKnownTrade(lead.trade))) {
      return { ok: false, reason: "invalid", message: "Ce métier n'est pas reconnu." };
    }

    // Sans persistance, la demande serait suspendue au seul envoi d'email :
    // on préfère le dire plutôt que de risquer de la perdre.
    if (!isLeadPersistenceConfigured()) {
      console.error("submitSupordoLead: persistance non configurée (SUPABASE_SECRET_KEY)");
      return { ok: false, reason: "not_configured" };
    }

    const supabaseMarketing = getSupabaseMarketingAdmin();

    const { data: saved, error: saveError } = await supabaseMarketing
      .from("marketing_leads")
      .insert(toRow(lead))
      .select("id")
      .single();

    if (saveError || !saved) {
      console.error("submitSupordoLead: enregistrement impossible", saveError);
      return { ok: false, reason: "save_failed" };
    }

    // À partir d'ici la demande est conservée : plus rien ne peut la perdre.
    // Un échec de notification laisse `notified_at` à null, ce qui la rend
    // retrouvable, et le visiteur reçoit une confirmation légitime.
    const delivery = readLeadDeliveryConfig();
    if (!delivery) {
      console.error(`submitSupordoLead: envoi non configuré, demande ${saved.id} à relever`);
      return { ok: true };
    }

    const { subject, lines } = buildNotification(lead);
    const text = lines.join("\n");
    const html = `<div style="font-family:sans-serif;font-size:14px;line-height:1.6">${escapeHtml(
      text,
    ).replace(/\n/g, "<br>")}</div>`;

    try {
      const response = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${delivery.apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: delivery.from,
          to: delivery.to,
          // Un rappel ne porte pas d'email : rien à quoi répondre.
          ...(lead.intent === "site_request" ? { reply_to: lead.email } : {}),
          subject,
          text,
          html,
        }),
      });
      if (!response.ok) {
        console.error(
          `submitSupordoLead: échec Resend [${response.status}] sur la demande ${saved.id}: ${await response.text()}`,
        );
        return { ok: true };
      }
    } catch (error) {
      console.error(`submitSupordoLead: erreur réseau sur la demande ${saved.id}`, error);
      return { ok: true };
    }

    const { error: markError } = await supabaseMarketing
      .from("marketing_leads")
      .update({ notified_at: new Date().toISOString() })
      .eq("id", saved.id);
    if (markError) {
      // L'email est parti : la demande est traitée, seule la trace manque.
      console.error(`submitSupordoLead: notified_at non enregistré (${saved.id})`, markError);
    }

    return { ok: true };
  });
