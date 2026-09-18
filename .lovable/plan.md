# SUPORDO — que dire, et à qui ? (analyse lecture seule, aucun code modifié)

## 1. Ce que le produit fait réellement aujourd'hui

Vérifié dans le code et les fiches produit. Ne sert pas de texte de vente : sert
à savoir ce qui est promettable.

**Solide, démontrable devant un artisan**
- Un site local complet et multi-pages : accueil, services, page par
  service × ville, réalisations, contact, mentions légales, zones d'intervention
  [PROUVÉ REPO : `src/routes/index.tsx`, `$slug.tsx`, `services.*`, `contact.tsx`].
- SEO local technique fait pour lui, sans qu'il y pense : titres/descriptions,
  données structurées LocalBusiness + FAQ, sitemap, robots, `llms.txt`
  [PROUVÉ REPO : `src/lib/seo.ts`, `faq.ts`, `sitemap[.]xml.ts`].
- Les moyens de contact réels d'un artisan : téléphone, WhatsApp, formulaire avec
  notification, lien de réservation externe activable par entreprise
  [PROUVÉ REPO : `WhatsAppButton`, `BookingButton`, `notify-contact`].
- Preuves de confiance réelles : certifications RGE rapatriées d'une source
  officielle, note et avis Google, marques/partenaires déclarés, équipe
  [PROUVÉ REPO : `rge-api.functions.ts`, `google-places`, `PartnersManager`,
  `TeamManager`].
- Traçabilité de l'authenticité des photos : une image d'illustration devient
  automatiquement « réalisation réelle » quand l'artisan met la sienne
  [PROUVÉ REPO : `PortfolioManager.tsx`, `portfolio.media_origin/content_kind`].
- Un back-office pensé par objet métier (services, zones, marques, réalisations,
  équipe), pas un éditeur de pages [PROUVÉ REPO : `src/routes/admin.*`].
- Un site déjà rempli avant le premier rendez-vous : identité, accroche, services,
  villes, couleurs dérivées du logo, générés en amont
  [PROUVÉ REPO : `generate-tenant`, `analyze-logo`].
- Hébergement, domaine et certificat gérés par l'agence, pas par l'artisan
  [PROUVÉ CONFIGURATION ACTUELLE : easydep.supordo.com].

**Partiel — ne pas vendre comme acquis**
- Preview commerciale partageable : le mécanisme existe (`?tenant=slug`) mais
  n'est pas packagé en lien client.
- Tous les sites se ressemblent : aucune variante de mise en page, seuls logo,
  couleurs et textes changent [PROUVÉ REPO : ordre des blocs fixe dans `index.tsx`].
- Le texte généré n'a aucun marqueur « relu / confirmé ».
- Mise en ligne d'un sous-domaine : encore manuelle (audit précédent).

**Absent — dangereux à promettre**
Paiement/abonnement en ligne, estimation tarifaire, rapport SEO mensuel
automatisé, analytics propriétaire, multilingue, application mobile, achat de
domaine automatisé [PROUVÉ REPO : `docs/audit/etat-reel.md` §9].

## 2. Ce qui différencie réellement (et ce qui ne différencie pas)

Ne différencie pas : « site pro », « responsive », « SEO », « créé par IA » — tout
le marché le dit, et l'IA est un moyen, pas une valeur.

Différencie, parce que c'est dans le code :
1. **Le site est prêt avant la vente**, pas commandé puis attendu.
2. **L'artisan ne gère jamais de pages** : il met à jour des objets métier
   (un service, une ville, un chantier), le site se réorganise seul.
3. **Les preuves sont vérifiées, pas déclarées** : RGE d'une source officielle,
   avis Google réels, photo réelle qui remplace l'illustration et le sait.
4. **Une agence reste derrière** : domaine, hébergement, identité visuelle
   verrouillés côté plateforme — l'artisan ne peut pas casser son site.
5. **Le maillage local service × ville** est structurel, pas une option SEO.

## 3. Hypothèses de positionnement

### H1 — « Votre site est déjà prêt. Regardez-le. »
- **Problème** : l'artisan a déjà renoncé une ou deux fois ; il ne veut pas d'un
  projet à piloter ni de contenu à rédiger.
- **Promesse** : votre site existe déjà avec vos services, vos villes et vos
  certifications ; vous corrigez, vous ne créez pas.
- **Crédible car** : génération en amont + preview par slug + données officielles.
- **Différenciant** : inverse la vente (démonstration au lieu de devis).
- **Preuves sur la landing** : preview réelle d'EASYDEP, avant/après du même
  écran, délai réel entre premier contact et site visible.
- **Risque** : « prêt » ne doit pas vouloir dire « publié » ; interdiction
  absolue d'afficher de fausses réalisations.

### H2 — « Vous mettez à jour votre métier, pas votre site web »
- **Problème** : les sites d'artisans meurent faute de mises à jour.
- **Promesse** : ajouter un service, une commune ou un chantier prend une minute
  et met le site à jour partout, y compris le référencement local.
- **Crédible car** : back-office par objet, pages service × ville dérivées.
- **Différenciant** : l'opposé d'un constructeur de sites à blocs.
- **Preuves** : capture du back-office, chronomètre d'un ajout réel, page ville
  générée automatiquement.
- **Risque** : ne pas promettre de position Google ni de trafic chiffré.

### H3 — « Le site qui prouve que vous êtes un vrai professionnel »
- **Problème** : le client final doute avant d'appeler (qualifications ? avis ?
  chantiers réels ?).
- **Promesse** : vos certifications, vos avis et vos chantiers affichés de façon
  vérifiable.
- **Crédible car** : RGE officiel, Google, distinction illustration/réel.
- **Différenciant** : l'authenticité est contrôlée par le produit.
- **Preuves** : badges de certification réels, mention de la source, explication
  de la règle photo.
- **Risque** : dépend des données de l'artisan ; inutilisable pour un
  non-certifié — prévoir un second angle.

### H4 — « Une agence locale, au prix d'un abonnement » (encadrant possible)
- **Problème** : agence = cher et lent ; outil = travail non fait.
- **Promesse** : quelqu'un s'occupe du domaine, de l'hébergement, du contenu et
  de la mise en ligne ; vous gardez la main sur votre métier.
- **Crédible car** : rôles agence/artisan réellement séparés, verrous côté
  plateforme, domaine géré par l'agence.
- **Différenciant** : le service, pas le logiciel.
- **Preuves** : ce qui est inclus / ce qui reste à l'artisan, un client réel.
- **Risque** : promet une disponibilité humaine — engagement de délai à ne pas
  écrire avant d'en être capable ; un seul client payant aujourd'hui, donc pas de
  preuve sociale chiffrée.

**Recommandation de cadrage** : H1 comme accroche (c'est le seul angle qui crée
l'envie de cliquer), H2 comme corps de page (c'est la valeur durable), H3 comme
bloc de preuves, H4 comme réponse à « pourquoi pas une agence ? ».

## 4. Rôle futur de supordo.com — état actuel vérifié

- `/` sur le domaine plateforme redirige aujourd'hui vers `/login`
  [PROUVÉ REPO : `src/routes/__root.tsx` lignes 106-107] : la place de la landing
  est donc libre et déjà réservée, sans toucher au routage tenant.
- `/login` est déjà **unique et partagé** : même écran pour l'agence et les
  artisans [PROUVÉ REPO : `src/routes/login.tsx`].
- Les rôles sont déjà lus séparément : `user_roles` (`super_admin` /
  `tenant_admin`) et `tenant_members` (rattachement à une entreprise)
  [PROUVÉ REPO : `src/hooks/use-auth.tsx`].
- La redirection après connexion existe déjà et est testée : super admin →
  `/super-admin`, artisan → `/admin`, refus explicite si le rôle ou le
  rattachement manque, destination demandée validée avant d'être suivie
  [PROUVÉ REPO : `src/lib/access-guard.ts`, `safe-redirect.ts`, tests associés].
- `/login`, `/admin`, `/super-admin` et les pages de mot de passe sont exemptés
  de la résolution par nom de domaine [PROUVÉ REPO : `__root.tsx`].

**Conclusion** : l'architecture souhaitée (landing publique + gros bouton
commercial + « Se connecter » discret + `/login` partagé + redirection par rôle)
est déjà entièrement supportée. Elle ne demanderait, plus tard, qu'un seul
changement : remplacer la redirection de `/` vers `/login` par l'affichage de la
landing. Aucune modification d'authentification, de rôles ni de routes admin.
Point de vigilance : `www.supordo.com` et la question du domaine principal
resteront à traiter, puisqu'une landing publique devient indexable.

## 5. Ce que la landing ne doit pas dire aujourd'hui

Pas de chiffre de clients, de trafic ou de position Google ; pas de « site en
X minutes » sans mesure réelle ; pas de fausses réalisations ni de faux avis ;
pas de paiement, d'abonnement en ligne, de devis automatique ni de rapport SEO ;
pas de promesse de personnalisation visuelle libre (elle n'existe pas) ; pas de
mise en avant de l'IA comme argument principal.

## 6. Décisions produit/commerciales que le code ne peut pas trancher

1. **À qui parle la landing** : à l'artisan directement, ou à un réseau /
   apporteur d'affaires ? Cela change tout le texte.
2. **Ce qui est vendu** : un site, ou un accompagnement mensuel ? Prix affiché
   ou non ?
3. **CTA principal** : « Voir mon site préparé » (demande de preview, exigeant
   côté production) ou « Être rappelé » (plus sûr, moins différenciant) ?
4. **Le mono-métier** : SUPORDO parle-t-il à tous les artisans, ou d'abord à un
   métier précis (chauffage/cheminée, au vu du contenu existant) ?
5. **Engagement de délai** que vous acceptez de tenir seul aujourd'hui.
6. **EASYDEP comme référence publique** : nom, logo et capture autorisés ?
7. **Périmètre géographique** affiché (France seule ? Belgique/Luxembourg ?).
8. **Positionnement de l'IA** : cachée, mentionnée, ou assumée ?

## Prochaine action minimale

Trancher les points 1, 2 et 3 ci-dessus. Tant qu'ils ne le sont pas, tout
copywriting serait une supposition. Aucune implémentation, aucun design, aucun
changement de code n'est engagé par ce document.
