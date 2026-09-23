/**
 * Le partage des responsabilités entre l'artisan et SUPORDO, en un endroit.
 *
 * Trois formulations circulaient dans le code : « vous le gardez à jour »,
 * « vous n'avez pas de site à gérer », « vous êtes sur le terrain, nous nous
 * occupons du site ». Elles ne se contredisent que si l'on oublie ce qui les
 * sépare — et c'est précisément ce que ce fichier fixe :
 *
 *   l'artisan garde à jour LES INFORMATIONS DE SON ENTREPRISE ;
 *   SUPORDO s'occupe DU SITE et de sa partie technique.
 *
 * Ce n'est pas un gabarit de copy. Les pages gardent leur voix : une page
 * métier peut dire « vous n'avez pas de site à gérer », c'est vrai. Ce que
 * ce fichier empêche, c'est qu'une page attribue à SUPORDO le contenu de
 * l'entreprise, ou à l'artisan la technique du site.
 *
 * Pourquoi pas `commercial-promises.ts` : ce module-là résout les promesses
 * commerciales d'un TENANT envers ses propres clients (devis gratuit, délai
 * de réponse, urgence), à partir de champs de base. Le partage de
 * responsabilité entre SUPORDO et l'artisan est un autre sujet, sans donnée
 * en base et sans tenant. Les mélanger aurait produit un module qui répond à
 * deux questions.
 *
 * Chaque ligne ci-dessous correspond à une capacité réellement présente dans
 * le produit ou déjà actée dans `/tarifs`. Aucune promesse nouvelle.
 */

/**
 * Forme courte, pour la page d'accueil : deux colonnes lues d'un coup d'œil,
 * à gros caractères. La forme détaillée ci-dessous sert à `/tarifs`, où la
 * question posée n'est plus « qui fait quoi » mais « qu'est-ce que je paie ».
 * Les deux registres vivent dans le même fichier précisément pour qu'ils ne
 * puissent pas se contredire.
 */
export const ARTISAN_KEEPS_SHORT = [
  "Votre activité",
  "Vos prestations",
  "Vos photos",
  "Vos zones d'intervention",
  "Vos coordonnées",
] as const;

export const SUPORDO_KEEPS_SHORT = [
  "La structure",
  "La présentation",
  "La mise en ligne",
  "L'hébergement",
  "La maintenance technique",
] as const;

/** Ce que l'artisan tient à jour, depuis son espace. */
export const ARTISAN_KEEPS = [
  "Vos prestations, et lesquelles sont visibles",
  "Les communes où vous intervenez",
  "Vos chantiers, avec leurs photos",
  "Vos coordonnées",
] as const;

/** Ce dont SUPORDO s'occupe, sans que l'artisan ait à y penser. */
export const SUPORDO_KEEPS = [
  "Le site et sa mise en ligne",
  "L'hébergement et la maintenance technique",
  "L'affichage sur téléphone comme sur ordinateur",
  "Les évolutions communes à tous les sites SUPORDO",
] as const;

/**
 * La phrase de synthèse. Elle existait déjà, à l'identique, en clôture de
 * `/comment-ca-marche` — elle est simplement devenue lisible depuis ailleurs
 * plutôt que recopiée.
 */
export const RESPONSIBILITY_SENTENCE =
  "Vous gardez vos informations à jour. SUPORDO garde la partie technique.";

/** Intitulés des deux colonnes, partout où le partage est montré. */
export const RESPONSIBILITY_COLUMNS = {
  artisan: "Vous",
  supordo: "SUPORDO",
} as const;
