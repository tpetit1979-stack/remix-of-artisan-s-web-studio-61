/**
 * SUPORDO — identifiants Supabase côté serveur, résolus en un seul endroit.
 *
 * Ce module vit hors de `src/integrations/supabase/`, dont les fichiers
 * portent l'en-tête « automatically generated » et peuvent être réécrits par
 * la plateforme : une règle durable n'y survivrait pas. Le code marketing
 * possède donc sa propre résolution de clé et son propre client privilégié
 * (`@/lib/supabase-admin.server`), sans dépendre du dossier généré.
 *
 * La clé utilisée est la clé secrète Supabase moderne (`sb_secret_…`), lue
 * dans `SUPABASE_SECRET_KEY`. Le SDK ne décode jamais cette valeur : il la
 * transmet dans l'en-tête `apikey` et c'est le serveur qui lui associe ses
 * privilèges. Le format de la clé n'a donc aucune incidence sur les policies
 * ni sur la RLS.
 *
 * Deux règles tenues ici :
 *  - lecture `process.env` uniquement, jamais de préfixe `VITE_` : cette
 *    valeur ne doit atteindre aucun bundle navigateur ;
 *  - la valeur n'est jamais écrite dans un message, un log ou une erreur —
 *    seul le NOM de la variable apparaît.
 */

/** Nom de la variable attendue, pour les messages d'erreur et de diagnostic. */
export const SUPABASE_SECRET_KEY_ENV = "SUPABASE_SECRET_KEY";
export const SUPABASE_URL_ENV = "SUPABASE_URL";

export interface SupabaseServerCredentials {
  url: string;
  secretKey: string;
}

/**
 * Renvoie les identifiants serveur, ou `null` si l'un des deux manque.
 * Ne lève pas : l'appelant décide quoi faire d'une configuration absente.
 */
export function readSupabaseServerCredentials(): SupabaseServerCredentials | null {
  const url = process.env[SUPABASE_URL_ENV]?.trim();
  const secretKey = process.env[SUPABASE_SECRET_KEY_ENV]?.trim();
  if (!url || !secretKey) return null;
  return { url, secretKey };
}

/**
 * Vrai quand le serveur peut réellement écrire en base. Utilisé pour décider
 * si une capacité est proposée au visiteur, sans jamais exposer la clé.
 */
export function hasSupabaseServerCredentials(): boolean {
  return readSupabaseServerCredentials() !== null;
}

/** Message d'erreur commun — cite les noms de variables, jamais leur valeur. */
export function missingCredentialsMessage(): string {
  return `Identifiants Supabase serveur absents. Renseignez ${SUPABASE_URL_ENV} et ${SUPABASE_SECRET_KEY_ENV}.`;
}
