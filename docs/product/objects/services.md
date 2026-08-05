# Services

| Champ | Valeur |
|---|---|
| Propriétaire | Tenant — créés librement à partir du catalogue plateforme (voir Bibliothèque métier) |
| Écran référent | `admin.services.tsx` (client) — **cible et référence**, l'onglet Super Admin doit disparaître à son profit (lot B) |
| Composant référent | `admin.services.tsx` — à réutiliser tel quel côté agence, à droits élevés |
| Routes | `/admin/services` (client) · onglet "Services" de `super-admin.tenants.$tenantId.tsx` (agence, `ServicesTab`, dupliqué) → supprimé lot B |
| Permissions | `tenant_admin` : écriture complète sur son tenant · `super_admin` : écriture complète sur tout tenant |
| IA | Aucune aujourd'hui — les services proposés viennent du catalogue de templates, sans suggestion automatique |
| Roadmap | Rien de prévu au-delà du lot B — cet objet fonctionne déjà bien, il sert de modèle au reste du backlog |

**Lien avec Marques** : le dialogue d'édition de service permet d'assigner une
marque à un service précis (`tenant_service_brands`, commit `0bffb3e`), scopée aux
marques déjà retenues dans "Mes marques" — un service ne peut pas afficher une
marque que le tenant n'a pas confirmé utiliser ailleurs.

**Statut** : premier objet du lot B, le risque le plus faible du chantier.
