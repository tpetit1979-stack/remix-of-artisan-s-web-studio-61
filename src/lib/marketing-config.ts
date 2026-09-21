/**
 * SUPORDO — paramètres opérationnels du site marketing, lus en un seul endroit.
 *
 * Règle unique de ce fichier : une capacité qui n'est pas réellement
 * configurée n'est jamais simulée. Aucune adresse, aucun numéro, aucune clé
 * n'est inventé ici — l'appelant se contente de ne pas proposer ce qui
 * n'existe pas. C'est le même principe que la garde `leadIntakeReady` déjà
 * appliquée aux boutons du site : jamais d'appel à l'action sans mécanisme
 * derrière.
 *
 * Lecture serveur uniquement (`process.env`) : ce module ne doit jamais être
 * importé depuis un composant rendu côté navigateur.
 */

import { hasSupabaseServerCredentials } from "@/lib/supabase-server-credentials";

/** Envoi de la notification email (Resend). */
export interface LeadDeliveryConfig {
  apiKey: string;
  to: string;
  from: string;
}

/**
 * Les trois paramètres d'envoi. L'un d'eux manquant signifie qu'aucune
 * notification ne peut partir.
 */
export function readLeadDeliveryConfig(): LeadDeliveryConfig | null {
  const apiKey = process.env["RESEND_API_KEY"]?.trim();
  const to = process.env["SUPORDO_LEAD_TO_EMAIL"]?.trim();
  const from = process.env["SUPORDO_LEAD_FROM_EMAIL"]?.trim();
  if (!apiKey || !to || !from) return null;
  return { apiKey, to, from };
}

/**
 * La demande est écrite en base avec la clé secrète Supabase, qui contourne
 * RLS : `marketing_leads` n'a volontairement aucune policy d'insertion
 * publique, donc rien ne peut être inséré depuis un navigateur.
 *
 * PRÉREQUIS DE DÉPLOIEMENT : `SUPABASE_URL` et `SUPORDO_SUPABASE_SECRET_KEY`
 * doivent
 * exister dans l'environnement serveur. Sans elles, aucune demande ne peut
 * être conservée, et le formulaire n'est pas proposé du tout — on ne remplace
 * pas la persistance par une policy publique, qui laisserait n'importe qui
 * écrire dans la table.
 */
export function isLeadPersistenceConfigured(): boolean {
  return hasSupabaseServerCredentials();
}

/**
 * Une demande n'est proposée au visiteur que si elle peut être à la fois
 * conservée et signalée. La persistance seule ne suffit pas : personne ne
 * relèverait la demande. La notification seule ne suffit pas non plus : un
 * échec d'envoi perdrait le prospect.
 */
export function isLeadIntakeReady(): boolean {
  return isLeadPersistenceConfigured() && readLeadDeliveryConfig() !== null;
}
