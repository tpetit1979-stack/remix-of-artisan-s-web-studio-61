# Audit — provisionnement automatique des sous-domaines `*.supordo.com` chez Lovable

Mission strictement lecture seule. Aucun domaine, DNS, code, variable, donnée ni
publication n'a été touché. EASYDEP intact.

## A — CE QUE SUPORDO AUTOMATISE DÉJÀ

`entreprise → slug → ?`

- Recherche d'entreprise (nom / SIRET) et création du tenant existent
  [PROUVÉ PROJET LOVABLE : `src/components/admin/CompanySearch.tsx`,
  `src/routes/super-admin.onboarding.tsx`].
- Normalisation du slug : `generateSlug()` (minuscules, accents retirés, tirets)
  [PROUVÉ PROJET LOVABLE : `src/lib/tenant-admin.ts:16`], avec détection de
  doublon par SIRET puis slug (`findExistingTenantByIdentity`).
- Résolution multi-tenant par hostname : `resolveTenantForSsr` +
  `fetchTenantByHostname` interrogent `public_tenants` sur
  `domain.eq.<host>` / `domain.eq.www.<host>`, `isPlatformHost()` en égalité
  stricte [PROUVÉ PROJET LOVABLE : `src/lib/tenant.ts`], présent dans le build
  publié [PROUVÉ TEST/RUNTIME : `/assets/index-DygM7NPM.js`].
- **Ce qui n'existe PAS** : aucune ligne de code ne compose
  `<slug>.supordo.com`. Aucune occurrence de `supordo.com` hors commentaires et
  tests [PROUVÉ PROJET LOVABLE : recherche `supordo\.com` sur `src/`,
  `supabase/`]. `tenants.domain` est donc saisi à la main aujourd'hui.

## B — CE QUE LOVABLE AUTOMATISE DÉJÀ

- Émission et renouvellement TLS pour chaque hostname connecté
  [PROUVÉ DOCUMENTATION LOVABLE : FAQ « Does Lovable provide an SSL
  certificate »].
- Vérification de propriété par TXT `_lovable`, routage par A `185.158.133.1`
  [PROUVÉ CONFIGURATION ACTUELLE : les 3 domaines du projet].
- Redirections automatiques des domaines connectés vers le Primary (temporaires,
  jamais 301) [PROUVÉ DOCUMENTATION LOVABLE + PROUVÉ TEST/RUNTIME : 302
  `easydep` → `supordo.com`].
- Ajout automatique du domaine aux Redirect URLs Auth (Cloud uniquement — sans
  effet ici, Supabase externe).
- Un seul build sert tous les hostnames connectés [PROUVÉ TEST/RUNTIME : même
  bundle `/assets/index-DygM7NPM.js`].

## C — CE QUI RESTE MANUEL

Par tenant, aujourd'hui : (1) créer l'enregistrement DNS `A slug → 185.158.133.1`
chez OVH ; (2) Project → Settings → Domains → Connect existing domain ; (3)
attendre la vérification + le certificat ; (4) renseigner `tenants.domain`.
Plus, une fois pour toutes : ne pas avoir de Primary Domain, sinon tout
sous-domaine est redirigé avant d'atteindre le SSR [PROUVÉ TEST/RUNTIME].

## D — WILDCARD LOVABLE : NON SUPPORTÉ

- Documentation : « Can I connect multiple subdomains? Yes… **but each one must
  be added and configured individually** ». Aucune mention de wildcard nulle part
  [PROUVÉ DOCUMENTATION LOVABLE : `features/custom-domain`].
- Interface/outil : l'ajout de `*.supordo.com` est refusé (« domain name is not
  valid or not allowed ») [PROUVÉ TEST/RUNTIME, essai antérieur].
- **B — wildcard DNS seul, sans déclaration Lovable : NE FONCTIONNE PAS.** Test
  décisif : requête HTTPS vers `185.158.133.1` avec Host
  `test-inexistant.supordo.com` → `TLS alert handshake failure` : l'edge ne
  présente aucun certificat pour un hostname non enregistré, la requête n'atteint
  jamais l'application [PROUVÉ TEST/RUNTIME]. Un `A *` chez OVH ne suffirait donc
  pas — le blocage est TLS, en amont du routage.
- Interaction Primary : indépendante du sujet, mais bloquante tant qu'elle est
  active (voir C).

## E — API / PROVISIONING LOVABLE : NON SUPPORTÉ

- Spécification publique `https://api.lovable.dev/v1/openapi.yaml` inspectée
  (875 ko) : **aucun chemin `/domains`**. Le groupe « Deploy & domains » ne
  contient que publish / unpublish / update publish settings / get publish status
  [PROUVÉ DOCUMENTATION LOVABLE].
- Aucun CLI, webhook, fichier déclaratif versionné ni automatisation documentée
  n'ajoute un domaine. Le dépôt Git ne porte aucune configuration de domaines.
- Une éventuelle API interne derrière l'interface : NON PROUVÉE, et de toute
  façon **NON SUPPORTÉE POUR PRODUCTION**.
- Note : l'API publique est réservée aux plans Business et supérieurs, et ne
  changerait rien ici puisqu'elle n'expose pas les domaines.

## F — LIMITES À 10 / 50 / 100 / 1 000 TENANTS

- Aucune limite chiffrée de domaines par projet, workspace ou plan n'est
  documentée ; les domaines personnalisés exigent un plan payant [PROUVÉ
  DOCUMENTATION LOVABLE].
- Limite réelle = coût opérationnel humain, linéaire : 2 gestes (DNS + connexion)
  et une attente de certificat par tenant. 10 tenants ≈ acceptable ; 50 ≈ pénible
  mais faisable ; 100 ≈ ~200 gestes manuels ; 1 000 ≈ intenable [INFÉRENCE].
- Plafond technique éventuel de l'edge (nombre de certificats par zone) : NON
  PROUVÉ.

## G — SOLUTION LA PLUS SIMPLE AUJOURD'HUI

**Solution 1 — Lovable + connexion manuelle par sous-domaine**, complétée par
deux automatisations internes gratuites côté SUPORDO :
1. calculer et pré-remplir `tenants.domain = <slug>.supordo.com` à la création
   (aujourd'hui absent du code) ;
2. afficher dans l'onboarding une check-list « DNS créé / domaine connecté /
   certificat actif », le tenant restant hors ligne jusque-là.

Comparaison : Solution 2 (wildcard natif) impossible (D) ; Solution 3 (API de
provisionnement) inexistante (E) ; Solution 4 — aucune capacité Lovable
officiellement supportée ne couvre le besoin (recherche documentaire complète).
Aucun changement d'hébergeur ni proxy externe n'est nécessaire à ce stade.

## H — À PARTIR DE QUEL PROBLÈME ELLE DEVIENT INSUFFISANTE

Trois seuils concrets, pas un nombre théorique :
- création de tenants en libre-service ou en lot (l'artisan ou un prospect
  déclenche la mise en ligne sans vous) ;
- délai de mise en ligne devenu argument commercial (« en ligne en 5 minutes »)
  incompatible avec DNS + certificat manuels ;
- au-delà de ~50 tenants, le coût de gestion et le risque d'oubli (domaine
  connecté mais DNS absent, ou inverse) dépassent le gain.

## I — AUTOMATISATION MAXIMALE EN RESTANT CHEZ LOVABLE

Peuvent être automatisés : le slug, la valeur de `tenants.domain`, la création de
l'enregistrement DNS chez OVH (API registrar, hors Lovable), la détection de
l'état réel du domaine, l'activation du tenant seulement quand son hôte répond.
Ne peut pas l'être : **la déclaration du hostname côté Lovable et l'émission du
certificat** — geste d'interface, sans API supportée [PROUVÉ DOCUMENTATION
LOVABLE + PROUVÉ TEST/RUNTIME]. C'est le plafond d'automatisation.

## J — LE 101e CLIENT (`acme-chauffage.supordo.com`)

Solution 1 (seule réellement disponible) : créer le DNS `A acme-chauffage →
185.158.133.1` chez OVH ; ajouter le hostname dans Project → Settings → Domains ;
attendre vérification TXT + certificat ; vérifier que `tenants.domain`
correspond. **Republication non nécessaire** (le projet est déjà publié, un seul
build sert tous les hostnames) ; **aucune API à appeler** ; ne rien faire ne
fonctionne pas — le hostname échouerait en TLS avant d'atteindre l'application
[PROUVÉ TEST/RUNTIME].

## K — INCONNUES RESTANTES

- Existence d'une capacité wildcard non documentée, activable par le support
  Lovable (enterprise / SaaS-for-SaaS) : NON PROUVÉ — seule une demande au
  support peut trancher.
- Nombre maximal de certificats/hostnames par projet : NON PROUVÉ.
- Comportement réel de `easydep.supordo.com` servi par l'application : NON PROUVÉ
  tant que le Primary Domain reste actif.

## L — PROCHAINE ACTION MINIMALE

Poser une seule question au support Lovable : « un projet peut-il accepter un
wildcard `*.supordo.com`, ou déclarer des hostnames par API ? » — sa réponse
tranche définitivement D et E. En parallèle, retirer le Primary Domain pour que
`easydep.supordo.com` serve enfin l'application. Rien d'autre n'est à construire
aujourd'hui.
