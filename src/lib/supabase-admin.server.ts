/**
 * SUPORDO — client Supabase privilégié du site marketing.
 *
 * Ce module est volontairement séparé de
 * `src/integrations/supabase/client.server.ts`, qui porte l'en-tête
 * « automatically generated » : ce fichier peut être réécrit par la
 * plateforme, et le mécanisme de persistance des demandes commerciales ne
 * doit dépendre d'aucune modification durable qui y serait apportée. Le code
 * marketing possède donc son propre client, ici.
 *
 * Privilèges : la clé secrète Supabase contourne RLS. `marketing_leads` n'a
 * aucune policy d'insertion publique — c'est ce client, côté serveur
 * uniquement, qui écrit. Ne jamais l'importer depuis un composant rendu dans
 * le navigateur.
 *
 * La clé n'apparaît dans aucun message d'erreur : seuls les noms de variables
 * d'environnement sont cités.
 */
import { createClient } from "@supabase/supabase-js";
import type { Database } from "@/integrations/supabase/types";
import {
  missingCredentialsMessage,
  readSupabaseServerCredentials,
} from "@/lib/supabase-server-credentials";

function createMarketingAdminClient() {
  const credentials = readSupabaseServerCredentials();
  if (!credentials) throw new Error(missingCredentialsMessage());

  return createClient<Database>(credentials.url, credentials.secretKey, {
    auth: {
      storage: undefined,
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}

let client: ReturnType<typeof createMarketingAdminClient> | undefined;

/**
 * Construit le client au premier usage réel, pas à l'import. Sans cela, un
 * simple import dans un module chargé au démarrage ferait échouer le serveur
 * entier quand la clé n'est pas configurée, au lieu de laisser l'appelant
 * répondre proprement que la capacité n'est pas disponible.
 */
export function getSupabaseMarketingAdmin() {
  if (!client) client = createMarketingAdminClient();
  return client;
}
