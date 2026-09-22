# SUPORDO — Communications Architecture & User Stories

**Statut : WORKING HYPOTHESIS — NON FIGÉ**
**Date : 2026-09-22**
**Périmètre : SUPORDO Sites + futur SUPORDO CRM/ERP**
**Nature : document d'exploration produit et architecture**

> Ce document ne constitue PAS une décision d'architecture définitive.
>
> Il formalise les besoins métier, les user stories et les hypothèses actuelles afin
> d'éviter des choix locaux incompatibles avec la trajectoire globale de SUPORDO.
>
> Les fournisseurs cités (Resend, Brevo, Twilio, Stripe, n8n, etc.) sont des
> candidats ou exemples. Leur présence dans ce document ne vaut pas sélection.
>
> Toute décision structurante devra être validée séparément avant implémentation.

---

## 1. Pourquoi ce document existe

SUPORDO ne doit pas être pensé comme une succession d'outils indépendants :

- un site marketing SUPORDO ;
- des sites pour artisans ;
- un formulaire de contact ;
- un futur CRM ;
- un module de rendez-vous ;
- des SMS ;
- des emails ;
- des paiements ;
- des relances.

Ces fonctions appartiennent potentiellement au même système.

Un choix apparemment mineur aujourd'hui — par exemple le fournisseur utilisé pour
notifier SUPORDO d'un nouveau lead — peut devenir une dépendance structurante si
le même mécanisme est ensuite utilisé par des centaines d'entreprises clientes.

L'objectif est donc de définir d'abord les **responsabilités et les besoins métier**,
puis seulement de choisir les fournisseurs.

---

## 2. Vision produit

SUPORDO pourrait à terme couvrir trois niveaux complémentaires.

### 2.1 SUPORDO corporate

Le site de SUPORDO permet notamment :

- présenter les produits SUPORDO ;
- générer des leads commerciaux ;
- recevoir des demandes de création de site ;
- onboarder de nouvelles entreprises clientes.

Exemple :

```text
supordo.com/demarrer → lead SUPORDO
```

### 2.2 SUPORDO Sites

SUPORDO génère et héberge des sites professionnels multi-tenant pour les artisans.

Chaque entreprise peut disposer notamment :

- de son propre domaine ;
- de ses informations ;
- de ses services ;
- de ses réalisations ;
- de ses photos ;
- de ses zones d'intervention ;
- de ses formulaires de contact ;
- éventuellement d'une prise de rendez-vous en ligne.

Les leads générés appartiennent à l'entreprise concernée.

### 2.3 SUPORDO CRM / ERP

Le CRM devient progressivement le système opérationnel de l'entreprise :

- prospects ;
- clients ;
- projets ;
- devis ;
- planning ;
- rendez-vous ;
- interventions ;
- facturation ;
- paiements ;
- communications ;
- maintenance ;
- parc installé ;
- SAV ;
- relances ;
- demandes d'avis.

SUPORDO Sites devient alors l'un des points d'entrée du CRM.

---

## 3. Principe fondamental : la donnée avant la notification

Un événement métier important ne doit pas dépendre de la réussite d'un email ou
d'un SMS.

Exemple à éviter :

```text
Formulaire
    ↓
Email à l'artisan
    ↓
Espérer qu'il soit reçu
```

Architecture cible conceptuelle :

```text
Formulaire
    ↓
SUPORDO
    ↓
Supabase / donnée métier persistée
    ↓
Lead créé
    ↓
Notification
    ├── Email
    └── éventuellement SMS
```

La base de données constitue la vérité métier.
Email et SMS constituent des canaux de communication.

Un échec de notification ne doit donc pas entraîner la perte du lead, du
rendez-vous, du paiement ou d'une autre donnée métier.

---

## 4. Acteurs

### 4.1 Opérateur SUPORDO

L'opérateur SUPORDO peut notamment :

- administrer la plateforme ;
- onboarder les entreprises ;
- aider à configurer leurs sites ;
- aider à connecter leurs domaines ;
- superviser les incidents techniques ;
- éventuellement assister les entreprises dans leurs campagnes et relances.

Les possibilités de supervision commerciale restent à définir précisément.

### 4.2 Entreprise cliente / artisan

L'entreprise utilise SUPORDO pour :

- recevoir des prospects ;
- gérer ses clients ;
- organiser son activité ;
- communiquer avec ses clients ;
- planifier ses interventions ;
- envoyer devis et factures ;
- suivre son parc installé ;
- déclencher des relances.

### 4.3 Collaborateur de l'entreprise

Selon son rôle :

- dirigeant ;
- secrétaire ;
- commercial ;
- technicien ;
- poseur ;
- autre collaborateur.

Les droits d'accès devront être adaptés au rôle.

### 4.4 Client final

Le particulier ou professionnel final peut notamment :

- visiter le site de l'artisan ;
- demander un devis ;
- demander à être rappelé ;
- prendre rendez-vous ;
- recevoir une confirmation ;
- recevoir un rappel ;
- recevoir un devis ;
- payer ;
- recevoir des documents ;
- recevoir une demande d'avis ;
- être relancé pour un entretien futur.

---

## 5. User Stories principales

### US-01 — Lead depuis le site SUPORDO

En tant que prospect SUPORDO, je veux demander des informations ou la création
d'un site, afin d'être recontacté.

```text
Formulaire SUPORDO
→ lead persisté
→ notification à SUPORDO
```

### US-02 — Lead depuis le site d'un artisan

En tant que visiteur du site d'un artisan, je veux envoyer une demande de contact
ou de devis, afin d'être recontacté.

```text
Site artisan
→ tenant identifié
→ lead associé à l'entreprise
→ lead persisté
→ notification à l'entreprise
```

La notification ne constitue pas la donnée primaire.

### US-03 — Notification d'un nouveau lead

En tant qu'artisan, je veux être prévenu rapidement lorsqu'un nouveau prospect me
contacte, afin de pouvoir répondre rapidement.

Canaux potentiels : email ; notification dans SUPORDO ; éventuellement SMS selon
configuration.

### US-04 — Prise de rendez-vous en ligne

En tant que client final, je veux réserver un créneau disponible depuis le site de
mon artisan, afin de planifier une intervention sans appel téléphonique.

Exemples : ramonage ; entretien chaudière ; entretien PAC ; visite technique ;
dépannage ; autre prestation planifiable.

```text
Client
→ choix prestation
→ disponibilités
→ choix créneau
→ coordonnées
→ rendez-vous créé
→ confirmation
```

### US-05 — Confirmation de rendez-vous

En tant que client final, je veux recevoir une confirmation après ma réservation,
afin de savoir que mon rendez-vous est enregistré.

Canaux potentiels : email ; SMS ; les deux selon configuration.

### US-06 — Rappel de rendez-vous

En tant qu'artisan, je veux que mes clients soient automatiquement rappelés avant
une intervention, afin de réduire les rendez-vous oubliés.

```text
J-1
→ SMS : rappel de l'intervention de demain
```

Les délais et canaux doivent être configurables.

### US-07 — Communication manuelle depuis le CRM

En tant qu'artisan, je veux envoyer un email ou un SMS depuis la fiche d'un client,
afin de conserver mes communications dans mon outil de travail.

Exemple : « Bonjour Mme Dupont, voici votre devis. »

Les emails humains peuvent nécessiter la connexion de la boîte professionnelle
existante de l'artisan. Candidats futurs : Google / Gmail / Google Workspace ;
Microsoft / Outlook / Microsoft 365 ; éventuellement SMTP/IMAP pour d'autres
fournisseurs.

À étudier séparément des emails transactionnels.

### US-08 — Envoi d'un devis

En tant qu'artisan, je veux envoyer mon devis depuis SUPORDO, afin que mon client
puisse le consulter et poursuivre le processus commercial.

Le CRM pourrait conserver les statuts disponibles : préparé ; envoyé ; délivré ;
erreur de livraison ; consulté si techniquement et juridiquement pertinent ;
signé ; refusé.

### US-09 — Paiement

En tant que client final, je veux pouvoir payer un acompte ou une facture en ligne.

```text
Client
→ fournisseur de paiement
→ paiement confirmé
→ webhook SUPORDO
→ paiement persisté
→ projet/facture mis à jour
→ notification éventuelle
```

Le fournisseur de paiement reste à sélectionner. Stripe est un candidat, pas une
décision actée par ce document.

### US-10 — Notification technicien en route

En tant que technicien, je veux pouvoir prévenir le client que je suis en route,
afin d'améliorer l'expérience d'intervention.

Canal privilégié envisagé : SMS.

### US-11 — Demande d'avis Google

En tant qu'artisan, je veux pouvoir demander automatiquement un avis après une
intervention réussie, afin d'améliorer ma réputation locale.

```text
Intervention terminée
→ délai configurable
→ SMS ou email
→ lien vers la fiche Google Business Profile
```

L'automatisation doit pouvoir être activée/désactivée.

### US-12 — Entretien récurrent

En tant qu'artisan, je veux que SUPORDO identifie les équipements arrivant à
échéance d'entretien, afin de générer du chiffre d'affaires récurrent.

```text
Chaudière installée
→ entretien annuel
→ next_due
→ échéance approchante
→ relance client
→ réservation
→ intervention
→ nouvelle next_due
```

Applicable notamment à : chaudières ; PAC ; poêles ; ramonage ; climatisation ;
autres équipements nécessitant un entretien périodique.

### US-13 — Supervision des relances

En tant qu'opérateur SUPORDO, je veux éventuellement identifier les entreprises
ayant des relances importantes non traitées, afin de pouvoir les aider à exploiter
leur portefeuille clients.

Exemple potentiel : « 63 entretiens arrivent à échéance et aucune campagne n'est
active. »

Le niveau d'intervention de SUPORDO reste à définir.

### US-14 — Consentement et contrôle par l'artisan

En tant qu'entreprise cliente, je veux contrôler les communications automatiques
envoyées en mon nom.

À prévoir : activation/désactivation ; choix du canal ; templates ; délais ;
horaires ; consentements lorsque nécessaires ; quotas ; historique.

### US-15 — Gestion des erreurs de communication

En tant qu'artisan, je veux savoir lorsqu'un message important n'a pas été délivré.

Exemple : « Email non délivré — vérifier l'adresse du client. »

SUPORDO doit pouvoir exploiter les webhooks/statuts proposés par les fournisseurs.

---

## 6. Trois catégories de communication à ne pas confondre

### A. Emails transactionnels SUPORDO

Exemples : nouveau lead ; confirmation de rendez-vous ; rappel ; devis disponible ;
document disponible ; notification de paiement ; demande d'avis ; rappel
d'entretien.

Ils peuvent être envoyés par un fournisseur transactionnel commun.
Candidats à évaluer : Resend ; Brevo ; Postmark ; AWS SES ; autres.

### B. SMS transactionnels

Exemples : confirmation ; rappel de rendez-vous ; technicien en route ; demande
d'avis ; rappel d'entretien.

Candidats à évaluer : Brevo ; Twilio ; fournisseurs européens/français à
benchmarker.

Le coût unitaire doit être intégré au modèle économique SUPORDO.

### C. Messagerie humaine de l'artisan

Exemples : « Voici votre devis. » ; « Pouvez-vous m'envoyer une photo ? » ; « Je
peux passer jeudi matin. »

Cette communication peut nécessiter la connexion de la boîte existante de
l'entreprise : Google Workspace / Gmail ; Microsoft 365 / Outlook ; éventuellement
fournisseurs SMTP/IMAP.

Elle ne doit pas être confondue avec l'email transactionnel automatique.

---

## 7. Hypothèse d'architecture

```text
                         SUPORDO
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
      SUPORDO Sites     SUPORDO CRM      Admin SUPORDO
          │                 │                 │
          └─────────────────┼─────────────────┘
                            │
                         SUPABASE
                            │
          ┌─────────────────┼─────────────────┐
          │                 │                 │
        DATA              AUTH             STORAGE
          │
          │ événements métier
          ↓
                COMMUNICATION LAYER
          ┌─────────────┬─────────────┐
          │             │             │
        EMAIL          SMS       USER MAILBOX
          │             │             │
       provider      provider      Gmail /
     interchangeable interchangeable Microsoft /
                                    autres
```

Cette représentation est conceptuelle. Elle ne signifie pas qu'une nouvelle
infrastructure ou de nouvelles tables doivent être créées immédiatement.

---

## 8. Principe d'abstraction fournisseur

Les modules métier ne devraient idéalement pas connaître directement les
fournisseurs. À terme, conceptuellement :

```text
sendTransactionalEmail()
sendSms()
sendUserEmail()
```

Ainsi :

```text
Appointment
    ↓
sendTransactionalEmail()
    ↓
provider
```

plutôt que :

```text
Appointment
    ↓
Resend-specific-code
```

Même principe pour les SMS.

Cette abstraction doit rester minimale et justifiée par les usages réels. Ne pas
construire prématurément une architecture complexe de providers.

---

## 9. Événements métier potentiels

Hypothèse à explorer :

```text
lead.created
appointment.created
appointment.confirmed
appointment.reminder_due
quote.sent
quote.signed
payment.succeeded
technician.on_the_way
intervention.completed
review_request_due
maintenance.due
```

Ces événements pourraient permettre de découpler progressivement les actions
métier des canaux de communication.

Ce modèle n'est PAS encore une spécification technique.

---

## 10. Multi-tenant et identité de l'expéditeur

Chaque entreprise doit rester identifiable comme l'expéditeur de ses
communications.

```text
Dupont Chauffage
contact@dupont-chauffage.fr
```

et non nécessairement :

```text
SUPORDO
noreply@supordo.com
```

Les implications doivent être étudiées : domaines multiples ; SPF ; DKIM ; DMARC ;
réputation d'envoi ; sender identities ; quotas ; isolation entre tenants ; gestion
des erreurs ; changement de domaine ; onboarding.

Aucune stratégie définitive n'est encore arrêtée.

---

## 11. Domaines et messagerie

Ne pas confondre :

```text
Nom de domaine
≠
DNS
≠
hébergement du site
≠
boîte email
≠
service d'envoi transactionnel
```

SUPORDO pourra éventuellement acheter ou administrer les domaines pour ses clients
sans devenir fournisseur de boîtes email.

```text
dupont-chauffage.fr
        │
        ├── site → SUPORDO Sites
        │
        ├── DNS → gestion à définir
        │
        └── contact@dupont-chauffage.fr
              → OVH / Google / Microsoft / autre
```

---

## 12. Supervision SUPORDO

Une future couche de supervision pourrait permettre à SUPORDO de détecter :
communications échouées ; domaine mal configuré ; rendez-vous non confirmés ;
échéances de maintenance non exploitées ; campagnes désactivées ; quotas SMS
atteints ; automatisations en erreur.

Mais il faudra distinguer clairement :

- **Administration technique** — SUPORDO maintient le fonctionnement de la
  plateforme.
- **Assistance métier** — SUPORDO aide l'artisan à exploiter son activité.
- **Action au nom de l'artisan** — SUPORDO déclenche une communication ou une
  campagne.

Ces niveaux doivent disposer de permissions et d'une traçabilité adaptées.

---

## 13. Contraintes à intégrer dans le benchmark fournisseur

Le benchmark futur ne doit pas comparer uniquement le prix d'un email.

**Multi-tenant** : 10 entreprises ; 100 entreprises ; 1 000 entreprises.

**Email** : domaines multiples ; expéditeurs multiples ; délivrabilité ; templates ;
API ; webhooks ; logs ; rebonds ; réputation ; quotas ; coûts.

**SMS** : coût France ; coût Europe ; segments ; sender ID ; réponses éventuelles ;
webhooks ; délivrabilité ; quotas ; conformité.

**Exploitation** : simplicité de configuration ; qualité de documentation ;
robustesse API ; observabilité ; gestion des erreurs ; support ; risque de
dépendance fournisseur.

**Réglementaire** : RGPD ; localisation/traitement des données ; consentements ;
désinscription ; conservation ; DPA ; exigences européennes pertinentes.

---

## 14. Modèle économique des communications

Hypothèse : les SMS ne devraient probablement pas être proposés en quantité
illimitée sans analyse économique.

Modèles à étudier : quota inclus par abonnement ; packs de crédits ; consommation
refacturée ; dépassement facturé ; combinaison de ces modèles.

Même réflexion à conduire pour les volumes importants d'emails transactionnels.

---

## 15. Place potentielle de n8n

n8n n'est actuellement PAS considéré comme le cœur du moteur de communication.

Il pourrait devenir utile pour des automatisations transversales ou internes :

```text
lead important
→ enrichissement
→ notification interne
→ CRM externe
→ tâche
```

ou :

```text
nouveau client SUPORDO
→ onboarding
→ opérations internes
→ notifications
```

Hypothèse actuelle : les workflows métier critiques de SUPORDO doivent rester
maîtrisés par SUPORDO. n8n peut éventuellement compléter la plateforme plutôt que
devenir une dépendance obligatoire de son fonctionnement principal.

À confirmer ultérieurement.

---

## 16. État actuel — septembre 2026

Le formulaire `/demarrer` utilise actuellement :

- Supabase pour la persistance ;
- Resend pour la notification email.

La configuration actuelle attend notamment :

```text
SUPABASE_URL
SUPORDO_SUPABASE_SECRET_KEY
RESEND_API_KEY
SUPORDO_LEAD_TO_EMAIL
SUPORDO_LEAD_FROM_EMAIL
```

Le choix de Resend existe donc actuellement dans l'implémentation.

Cela ne signifie pas que Resend est validé comme fournisseur global définitif de
SUPORDO.

---

## 17. Décisions déjà suffisamment stables

Les éléments suivants peuvent être considérés comme des principes de travail :

1. La donnée métier doit être persistée indépendamment de la notification.
2. SUPORDO reste multi-tenant.
3. Les leads des sites artisans doivent appartenir au tenant concerné.
4. Les communications doivent être historisables.
5. Les erreurs de communication importantes doivent être observables.
6. Email transactionnel, SMS et messagerie humaine sont trois problèmes distincts.
7. Les fournisseurs externes doivent rester remplaçables lorsque cela est
   raisonnablement possible.
8. Aucun fournisseur supplémentaire ne doit être introduit sans besoin métier
   démontré.

---

## 18. Éléments NON décidés

À la date de ce document, les points suivants restent ouverts :

- fournisseur email transactionnel global ;
- maintien ou remplacement futur de Resend ;
- Brevo ou autre plateforme unifiée ;
- fournisseur SMS ;
- fournisseur de paiement ;
- stratégie Gmail ;
- stratégie Microsoft 365 ;
- support SMTP/IMAP générique ;
- registrar/domain management ;
- stratégie multi-domaines d'envoi ;
- stratégie exacte de sous-comptes/providers ;
- modèle de facturation des SMS ;
- rôle éventuel de n8n ;
- niveau de supervision commerciale accordé à SUPORDO ;
- architecture technique exacte du moteur d'événements ;
- schéma de données définitif des communications.

Ne pas traiter ces éléments comme des décisions actées.

---

## 19. Prochaine décision attendue

Avant d'industrialiser les communications du CRM : **Benchmark Communications
Provider**.

Comparer les solutions pertinentes pour : email transactionnel ; SMS ;
multi-tenant ; multi-domaines ; France / Europe ; 10 / 100 / 1 000 entreprises ;
coût ; délivrabilité ; API/webhooks ; robustesse ; complexité opérationnelle ;
conformité européenne.

Ce benchmark doit précéder toute décision de standardisation globale.

---

## 20. Règle pour les futurs agents IA

Avant toute modification liée aux emails, SMS, domaines, automatisations ou
communications :

1. lire ce document ;
2. distinguer état actuel, hypothèse et décision actée ;
3. ne pas transformer une hypothèse en architecture définitive sans validation ;
4. ne pas introduire un nouveau fournisseur sans justification ;
5. privilégier la modification minimale compatible avec la trajectoire produit ;
6. ne pas créer de nouvelle table Supabase uniquement sur la base de ce document ;
7. documenter toute décision qui invalide ou confirme une hypothèse importante.

---

## Résumé

SUPORDO doit progressivement permettre :

```text
ACQUÉRIR
Site → Lead

CONVERTIR
Lead → Client → Devis

PLANIFIER
Client → Rendez-vous → Intervention

COMMUNIQUER
Email + SMS + messagerie humaine

ENCAISSER
Devis → Paiement → Facture

FIDÉLISER
Parc installé → Maintenance → Relance → Nouveau RDV

DÉVELOPPER
Intervention réussie → Avis → Réputation → Nouveaux leads
```

La technologie de communication doit servir cette boucle.
Elle ne doit pas la définir.
