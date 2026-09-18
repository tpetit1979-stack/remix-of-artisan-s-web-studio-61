# Impact de la levée du domaine primaire — analyse en lecture seule

Objectif : établir, avant toute modification, ce que change le retrait du statut
« primaire » de `supordo.com` — seule action capable de faire servir
`easydep.supordo.com` par l'application. Aucune modification n'est proposée ici.

## Situation constatée (PROUVÉ)

| Domaine | Statut | Comportement actuel |
| --- | --- | --- |
| `supordo.com` | actif, **primaire** (14 j 10 h) | sert l'application ; `/` → 307 `/login?redirect=` |
| `www.supordo.com` | actif (13 j 19 h) | 302 → `https://supordo.com/` |
| `easydep.supordo.com` | actif (6 h 24) | 302 → `https://supordo.com/` — **le SSR n'est jamais atteint** |

DNS et vérification de propriété conformes pour les trois. Build publié à jour
(`/assets/index-DygM7NPM.js`, resolver par hostname présent).

## Ce que le retrait du primaire change

Sans domaine primaire, plus aucune redirection entre domaines connectés : chaque
domaine sert l'application à sa propre adresse.

- `easydep.supordo.com` — atteint enfin le SSR. Résolution par hostname :
  `isPlatformHost()` compare en égalité stricte à `supordo.com`, donc ce
  sous-domaine n'est pas traité comme plateforme ; lookup
  `domain.eq.easydep.supordo.com` / `domain.eq.www.easydep.supordo.com` sur
  `public_tenants`. Le tenant EASYDEP a `domain = "easydep.supordo.com"` — le
  site vitrine doit donc s'afficher. Reste à confirmer en navigateur après le
  changement (aucun test possible tant que la redirection existe).
- `supordo.com` — inchangé : reste connecté, sert l'application, `/` redirige
  vers `/login` (règle applicative dans `src/routes/__root.tsx`, indépendante du
  réglage primaire).
- `www.supordo.com` — **change de comportement** : ne redirige plus vers
  l'apex. `normalizeHostname()` retire le préfixe `www.`, donc
  `isPlatformHost("www.supordo.com")` est vrai : la page racine y redirigera vers
  `/login` au lieu de canonicaliser vers `supordo.com`. Deux adresses plateforme
  servent alors le même contenu.

## Ce qui est perdu

1. La canonicalisation `www` → apex (impact SEO faible : la plateforme est en
   `noindex` sur `/login`, mais l'apex reste la seule adresse à communiquer).
2. Le point d'entrée unique : tout futur domaine connecté servira l'application
   directement, sans redirection automatique vers `supordo.com`.

Aucune perte côté authentification : les liens d'invitation et de réinitialisation
sont construits depuis `VITE_PLATFORM_URL` / le secret Edge `PLATFORM_URL`, tous
deux à `https://supordo.com`, jamais depuis le host visité.

## Réversibilité

Le réglage est réversible à tout moment (redéfinir `supordo.com` comme primaire
rétablit les redirections). Aucune donnée, aucun DNS, aucun code n'est touché.

## Points non prouvés

- Le rendu réel du site EASYDEP sur `easydep.supordo.com` (non observable tant
  que la redirection est active).
- Le certificat TLS de `easydep.supordo.com` sur une réponse applicative (seule
  la réponse de redirection a été observée, en HTTPS valide).

## Décision demandée

Aucune action tant que vous n'avez pas tranché. Le retrait du primaire se fait
dans Réglages du projet → Domaines → menu `⋯` de `supordo.com` → « Unset as
primary » : une action d'interface, côté vous, que je ne déclenche pas.
