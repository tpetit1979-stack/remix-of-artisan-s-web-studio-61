# Zones d'intervention

| Champ | Valeur |
|---|---|
| Propriétaire | Tenant — entièrement libre |
| Écran référent | `ZonesManager` (`src/components/admin/ZonesManager.tsx`) — interface unique, client et agence |
| Composant référent | `ZonesManager` — même composant des deux côtés, `tenantId` seul varie |
| Routes | `/admin/service-areas` (client, wrapper fin) · onglet "Zones" de `super-admin.tenants.$tenantId.tsx` (agence, même composant, à droits élevés) |
| Permissions | `tenant_admin` : écriture complète sur son tenant · `super_admin` : écriture complète sur tout tenant |
| IA | Aucune aujourd'hui |
| Roadmap | Lot 7 (affectation en masse Villes × Services, sélection explicite, aperçu, confirmation) — voir `docs/product/execution-backlog.md` |

**Statut** : deuxième objet du lot B fait, avec Services. L'ancien onglet
Super Admin dupliqué avait un bouton d'ajout en masse ("✦ Tous les
services") sans aperçu ni confirmation — retiré plutôt que porté tel quel,
puisque le lot 7 le remplace immédiatement par un mécanisme correctement
spécifié, pour les deux rôles. Fenêtre courte sans affectation en masse
entre ce commit et le lot 7 ; pas de mise en production isolée entre les deux.
