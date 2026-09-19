# Roadmap — supordo.com (marketing)

Source de vérité : `docs/product/plan-directeur-supordo-com.md`.

## Lot 1 — rendre supordo.com honnête et actionnable

- [x] 1.7 Déposer le plan canonique dans `docs/product/plan-directeur-supordo-com.md`
- [x] 1.2 Créer `/demarrer` et son formulaire (validation client + serveur, honeypot, délai minimal)
- [x] 1.2b Voie serveur dédiée aux demandes commerciales SUPORDO (Resend, aucune table)
- [x] 1.3 Créer `/demarrer/confirmation`, non indexée
- [x] 1.1 Nettoyer l'en-tête marketing (retirer CRM et Ressources, action principale, accès connexion sur téléphone)
- [x] 1.6 Activer « Demander mon site », masquer « Voir un exemple », corriger la phrase ambiguë du Hero
- [x] 1.5 Créer le pied de page de marque
- [ ] 1.4 Pages `/legal/mentions-legales` et `/legal/confidentialite` — **bloqué** : informations juridiques réelles non fournies (dénomination, forme juridique, adresse, SIREN/SIRET, TVA, responsable de publication, contact, durée de conservation, personnes ayant accès, adresse d'exercice des droits)

## Paramètres à fournir

- [ ] Adresse destinataire des demandes `/demarrer` → secret `SUPORDO_LEAD_TO_EMAIL`
- [ ] Adresse d'expédition sur un domaine vérifié chez Resend → secret `SUPORDO_LEAD_FROM_EMAIL`
- [ ] Clé Resend accessible au runtime serveur du site → secret `RESEND_API_KEY`
- [ ] Durée / règle de conservation des demandes, et personnes y ayant accès

## Hors Lot 1 (ne pas démarrer)

Lots 2 à 5 : Actes 3 à 7, offre, FAQ, `/exemples`, `/tarifs`, pages métier, référencement, aperçu social.
