# Bibliothèque métier — catalogue de marques, templates de service, médias

Trois catalogues distincts, même patron : verrouillés à l'agence, lecture publique
ou tenant pour la sélection. C'est le modèle de référence à répliquer pour tout
futur objet global — jamais à réinventer autrement (principe 2).

| Champ | Marques (catalogue) | Templates de service | Médias métier |
|---|---|---|---|
| Propriétaire | Plateforme | Plateforme | Plateforme |
| Écran référent | `super-admin.brands.tsx` | Écran de gestion des templates (agence) | `super-admin.media-library.tsx` |
| Routes | `/super-admin/brands` | agence uniquement | `/super-admin/media-library` |
| Permissions | `super_admin` écrit, tous lisent (actifs) | `super_admin` écrit, tous lisent | `super_admin` écrit |
| Roadmap | — | — | — |

**Statut** : à l'état cible. Différence légitime avec l'espace client — le tenant
n'a pas à "parcourir" un catalogue, il pose ses propres photos sur ses objets
(portfolio, services, équipe) sans passer par un écran de bibliothèque séparé.
