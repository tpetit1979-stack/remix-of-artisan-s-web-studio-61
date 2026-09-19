# Contrôle de clôture du Lot 1 — constats et deux corrections proposées

Vérification en lecture seule des quatre points demandés. Aucun fichier produit
n'a été modifié. Deux anomalies réelles sont identifiées ; les corrections
proposées ci-dessous sont strictement limitées à ces anomalies.

## 1 — roadmap.md : redondant

- Créé pendant l'exécution comme liste de tâches de travail (règle générale de
  suivi des missions à plusieurs tâches), pas comme document stratégique.
- Contenu : les mêmes sous-tâches 1.1 à 1.7 que le plan canonique, plus les
  paramètres manquants (destinataire, expéditeur, clé d'envoi, conservation) —
  déjà tous listés dans `docs/product/plan-directeur-supordo-com.md`.
- Aucune information exclusive. Aucun code, aucune configuration, aucun outil ne
  le lit (recherche sur tout le dépôt : aucune référence).

**Correction 1 : supprimer `roadmap.md`.** Aucun autre document ne sera créé.

## 2 — src/routes/__root.tsx : modification vérifiée, non-régression confirmée

Modification unique, dans `RootComponent` (lignes 179-184) :

```
const onMarketingRoute =
  location.pathname === "/demarrer" || location.pathname.startsWith("/demarrer/");
const withoutTenantChrome = onAdminRoute || isPlatformLanding || onMarketingRoute;
```

- Routes concernées : uniquement `/demarrer` et ses sous-pages. Le test est une
  égalité de chemin plus un préfixe, jamais un test d'hôte ni un fallback.
- Sites artisans : `isPlatformLanding` est faux et le chemin ne commence pas par
  `/demarrer`, donc `TenantTheme` et la barre « demander un devis » s'affichent
  exactement comme avant.
- `/login`, `/admin/*`, `/super-admin/*` : comportement inchangé — ils étaient
  déjà exclus par `onAdminRoute` / par le `beforeLoad` (lignes 90-99), qui n'a
  pas été touché.
- Aucun fallback tenant modifié : la résolution par hôte (lignes 108-125) est
  identique.

Portée : strictement nécessaire, rien à corriger ici.

## 3 — État visuel : captures impossibles aujourd'hui (anomalie réelle)

La landing SUPORDO et `/demarrer` ne sont accessibles que sur l'hôte exact
`supordo.com`. Sur l'hôte de prévisualisation Lovable et en local, les deux
pages renvoient 404 (vérifié : `/` et `/demarrer` affichent « Page non trouvée »).
En production, `supordo.com/` redirige encore vers `/login` : le Lot 1 n'y est
pas déployé.

Conséquence : l'état intermédiaire (CTA masqués, message « formulaire pas encore
ouvert ») n'est pas visualisable, ni par moi, ni par vous dans la
prévisualisation.

**Correction 2 : rendre les surfaces marketing visibles sur l'hôte de
prévisualisation**, sans toucher aux sites artisans :

- `__root.tsx` : `isPlatformLanding` devient vrai à `/` aussi sur un hôte de
  développement/prévisualisation, en réutilisant la détection existante
  (`isDevOrPreviewHost`) — ces hôtes ne résolvent déjà aucun tenant aujourd'hui,
  donc aucun comportement tenant ne change.
- `demarrer.index.tsx` et `demarrer.confirmation.tsx` : même assouplissement de
  leur garde d'hôte.

Les captures desktop et mobile de l'accueil et de `/demarrer` sont produites
juste après cette correction, avant toute fermeture du Lot 1. Aucun changement
de design : rien n'est ajouté pour « remplir » l'espace laissé par les CTA
masqués.

## 4 — Flux /demarrer actuellement implémenté

```text
navigateur (formulaire)
  -> validation client (champs requis + format email)
  -> appel de la fonction serveur submitSupordoLead
       -> validation serveur zod (longueurs, format, honeypot, délai)
       -> lecture de la configuration d'envoi
       -> appel HTTPS de Resend
  -> navigation vers /demarrer/confirmation uniquement si ok
```

- **Ce qui décide que l'envoi est « configuré »** : `readConfig()` dans
  `src/lib/supordo-lead.functions.ts`. Il exige les trois paramètres serveur
  `RESEND_API_KEY`, `SUPORDO_LEAD_TO_EMAIL`, `SUPORDO_LEAD_FROM_EMAIL`. La page
  et la landing consultent `getLeadIntakeStatus()`, qui ne renvoie qu'un booléen
  — jamais une adresse, jamais une clé.
- **Si un paramètre manque** : le formulaire n'est pas rendu du tout (message
  « Le formulaire n'est pas encore ouvert. ») et les CTA sont masqués dans
  l'en-tête et le Hero. Un appel forcé retourne `not_configured` et affiche une
  erreur explicite.
- **Si Resend renvoie une erreur** : statut et corps journalisés côté serveur,
  retour `send_failed`, message d'erreur affiché, aucune navigation.
- **Protection de la page de confirmation** : la navigation n'a lieu que si le
  serveur a répondu `ok`. Toute autre réponse, comme une erreur réseau, laisse
  l'utilisateur sur le formulaire avec un message. Aucun échec silencieux.
- **Données personnelles** : aucune écriture en base, aucune table, aucun
  journal des valeurs saisies. Les informations ne vivent que dans l'email
  envoyé et la messagerie de destination.
- Limite assumée et documentée dans le fichier : pas de limitation par IP
  fiable sur ce runtime ; anti-spam limité au honeypot et au délai minimal.

## Anomalies trouvées

1. `roadmap.md` redondant (correction 1).
2. Surfaces marketing inaccessibles hors de l'hôte `supordo.com`, donc non
   vérifiables en prévisualisation (correction 2).

## Lot 1 prêt à être fermé ?

**Non** — pas avant la correction 2 et la vérification visuelle qu'elle rend
possible. Les blocages déjà connus restent inchangés : pages légales sans
informations juridiques réelles, et ouverture publique du formulaire en attente
des adresses d'envoi. Le Lot 2 n'est pas démarré.
