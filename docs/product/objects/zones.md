# Zones d'intervention

| Champ | Valeur |
|---|---|
| Propriétaire | Tenant — entièrement libre |
| Écran référent | `admin.service-areas.tsx` (client) — **cible et référence**, l'onglet Super Admin doit disparaître à son profit (lot B) |
| Composant référent | `admin.service-areas.tsx` — à réutiliser tel quel côté agence, à droits élevés |
| Routes | `/admin/service-areas` (client) · onglet "Zones" de `super-admin.tenants.$tenantId.tsx` (agence, `ZonesTab`, dupliqué) → supprimé lot B |
| Permissions | `tenant_admin` : écriture complète sur son tenant · `super_admin` : écriture complète sur tout tenant |
| IA | Aucune aujourd'hui |
| Roadmap | Rien de prévu au-delà du lot B |

**Statut** : deuxième objet du lot B, avec Services — même risque faible.
