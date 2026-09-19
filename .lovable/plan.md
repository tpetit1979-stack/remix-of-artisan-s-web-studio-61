# SUPORDO Sites — contre-audit décisionnel V1

Aucun fichier de code modifié, aucun build. Lecture seule.

## 1. Offre V1 — formulation en une phrase

> **Un vrai site professionnel pour votre entreprise, plus votre espace SUPORDO pour le faire vivre : vos services, vos zones, vos réalisations et vos photos de chantier.**

Ce que la phrase ne dit pas volontairement : CMS, IA, SEO, plateforme, dashboard.

## 2. Matrice de vérité

| Brique | État | Preuve |
|---|---|---|
| Site public multi-pages, SSR | **EXISTE** [PROUVÉ REPO] | `src/routes/index.tsx`, `$slug.tsx`, `services.index.tsx`, `services.$serviceSlug.tsx`, `realisations.tsx`, `contact.tsx`, rendu par loader serveur |
| Espace SUPORDO client | **EXISTE** [PROUVÉ REPO] | `AdminSidebar` : tableau de bord, services, zones, réalisations, équipe, marques, logos partenaires, « Mon site », demandes reçues |
| Certifications administrables par le client | **MANQUANT** [PROUVÉ REPO] | aucune entrée dans `navItems`; édition uniquement dans `super-admin.tenants.$tenantId.tsx` |
| Photos → réalisation → site | **EXISTE** [PROUVÉ REPO] | `PortfolioManager` : upload, ville choisie dans les zones déclarées, bascule publier, `content_kind` illustration → `real_project` dès remplacement de l'image ; `isAuthenticPublicPortfolioItem` filtre le public |
| Le client ne construit pas de pages | **EXISTE** (par conception) | aucun éditeur de blocs/sections dans `src/components/admin/**` |
| Modifications autonomes | **PARTIEL** | tout est administrable sauf certifications, textes éditoriaux de sections et SEO fin (empilés dans `admin.settings.tsx`) |
| Production IA du tenant | **PARTIEL** [PROUVÉ REPO] | `super-admin.onboarding.tsx` (6 étapes) + `supabase/functions/generate-tenant` (brief texte → nom, ville, tél, email, hero) ; `CompanySearch` / `google-places` pour les données réelles. L'IA part d'un **brief libre**, pas d'un SIRET : rien ne garantit aujourd'hui qu'un fait non confirmé ne soit pas rédigé |
| SEO technique | **PARTIEL** | voir §7 |
| GEO / lisibilité IA | **PARTIEL** | `llms.txt` par tenant (`src/routes/llms[.]txt.ts`) : entreprise, services, zones, certifications, contact. Bénéfice GEO **non démontré** — à traiter comme hygiène, jamais comme argument |
| Analytics site (visiteurs, clics) | **MANQUANT** [PROUVÉ REPO] | table `analytics_monthly` (visitors, phone_clicks, form_submissions, monthly_score) existe mais **aucune écriture ni lecture** : seule occurrence applicative = `supabase.from("analytics_monthly").delete()` à la suppression d'un tenant. Aucun traçage de clic Appeler / WhatsApp / email |
| Demandes reçues | **EXISTE** | table `contacts` + écran `/admin/contacts` + `notify-contact` |
| Google Business Profile | **FUTUR** | `google-places` sert à récupérer des infos/avis, pas de statistiques GBP |
| Search Console | **FUTUR** | aucune intégration |

## 3. Les 5 manques réellement importants

1. **Aucune collecte de résultats.** « Mes résultats » n'a aucune donnée source : ni visiteurs, ni clics Appeler/WhatsApp. Seules les demandes du formulaire existent.
2. **`canonical` absent partout sauf `/contact`.** En multi-tenant (domaine client + hôte plateforme + `?tenant=slug`), c'est le trou SEO le plus coûteux.
3. **Certifications non administrables par le client** alors qu'elles sont une preuve centrale du discours.
4. **Dettes connues bloquantes** : bug SSR dans `$slug.tsx`, `FeaturedServices` qui n'affiche qu'une carte, RLS à corriger sur `tenant_members` / portfolio / Storage média.
5. **Texte alternatif des images non piloté côté client** et absence de `BreadcrumbList` / `Organization` : les images et l'architecture restent en dessous du niveau « excellent ».

## 4. Modèle économique — challenge

0 € de création + 49 € HT/mois tient **si et seulement si** le travail humain résiduel par nouveau site descend sous ~2 h.

Aujourd'hui, le résiduel réel est : brief à rédiger, contrôle des contenus IA, DNS chez le registrar, connexion du domaine côté hébergement, attente du certificat, saisie des certifications à la place du client (non administrable), premières réalisations (le client n'a pas encore de photos).

Conséquences : 49 €/mois n'est soutenable qu'avec une rétention longue (amortissement de la mise en route sur 12 mois au moins) ; le poste le plus rentable à automatiser n'est pas le contenu, c'est **le domaine et la mise en ligne**, aujourd'hui entièrement manuels. Si l'installation reste manuelle, préférer 0 € de création **affichée** tout en gardant un engagement de 12 mois plutôt qu'une création à 0 € résiliable au mois.

## 5. Politique de modifications (version artisan, 20 secondes)

> **Ce que vous faites vous-même est illimité** : réalisations, photos, services, zones, équipe, informations.
> **Les petites corrections, on les fait pour vous** : une faute, un numéro, une phrase, une image à remplacer.
> **Une nouveauté sur mesure fait l'objet d'un devis** avant d'être réalisée — et si elle est utile à tous, elle devient une amélioration de SUPORDO, incluse pour tout le monde.

Jamais le mot « illimité » sur la catégorie B.

## 6. « Mes résultats » V1 — 5 métriques maximum

| Métrique | Source technique probable | Disponible ? |
|---|---|---|
| Demandes reçues | table `contacts` | **maintenant, sans rien ajouter** |
| Clics pour appeler | événement enregistré côté site au clic sur le lien `tel:` | à construire |
| Clics WhatsApp | même mécanique sur le bouton WhatsApp | à construire |
| Visiteurs (visites, pas sessions) | comptage serveur au rendu SSR, sans cookie | à construire |
| Apparitions sur Google | connexion Google (GBP puis Search Console), OAuth | plus tard |

Règles de présentation : un clic sur « Appeler » se dit **« clics pour appeler »**, jamais « appels ». Un comptage serveur sans cookie ni identifiant évite la bannière de consentement ; toute connexion Google relève du consentement du client, pas du visiteur.

## 7. SEO / GEO — solide vs P0

Déjà solide : rendu serveur réel, URLs propres (`/services/{slug}`, `/{service}-{ville}`), `title` et `meta description` par page issus des données du tenant, `sitemap.xml` / `robots.txt` / `llms.txt` par tenant avec le bon domaine, JSON-LD LocalBusiness enrichi (horaires, zones, certifications) + FAQ + PublicService, pages service × ville adossées aux zones réellement déclarées (pas de génération artificielle), réalisations publiques filtrées sur la preuve réelle.

Lacunes P0 qui empêchent honnêtement de dire « excellent » :

1. `canonical` manquant sur toutes les pages sauf `/contact`.
2. Aucun `BreadcrumbList`, aucun `Organization`.
3. `alt` des images non piloté ni exigé côté client (`tenant_media.alt_text` existe mais reste optionnel).
4. Performance et poids des images non mesurés (aucune conversion WebP/AVIF systématique constatée).
5. Cohérence NAP non vérifiée entre le site et Google Business Profile.
6. Bug SSR `$slug.tsx` : tant qu'il existe, l'indexabilité des pages locales n'est pas prouvée.

GEO : la seule stratégie tenable est celle déjà en place — faits réels, entités claires, structuré cohérent avec le visible. Ne rien promettre sur la visibilité dans les IA.

## 8. Landing — 6 séquences maximum

1. **Le site.** « Un vrai site professionnel pour votre entreprise. » — Preuve : un site artisan réel sur un téléphone.
2. **La différence.** « Et votre espace SUPORDO pour le faire vivre. » — Preuve : espace SUPORDO à côté du site, même contenu des deux côtés.
3. **La boucle photo (séquence signature).** Presque sans texte. — Preuve : la même photo en 4 temps — chantier, ajoutée dans l'espace, devenue réalisation, visible sur le site.
4. **Ce que vous renseignez.** « Vous ne construisez pas des pages. » — Preuve : les vraies rubriques de l'espace (services, zones, réalisations, équipe, informations).
5. **Mes résultats.** « Savoir si votre site sert à quelque chose. » — Preuve : bloc de résultats simple. **À ne montrer que lorsque la collecte existe** ; sinon, s'en tenir aux demandes reçues.
6. **Passer à l'action.** Un seul CTA de contact, « Se connecter » discret en en-tête.

## Ce que je n'ai pas vérifié

RLS et grants réels en base, performances mesurées, rendu navigateur connecté, données réelles des tenants. Les états ci-dessus reposent sur le repo et les migrations, pas sur une exécution.
