# Services

| Champ | Valeur |
|---|---|
| Propriétaire | Tenant — créés librement à partir du catalogue plateforme (voir Bibliothèque métier) |
| Écran référent | `ServicesManager` (`src/components/admin/ServicesManager.tsx`) — interface unique, client et agence |
| Composant référent | `ServicesManager` — même composant des deux côtés, `tenantId` seul varie |
| Routes | `/admin/services` (client, wrapper fin) · onglet "Services" de `super-admin.tenants.$tenantId.tsx` (agence, même composant, à droits élevés) |
| Permissions | `tenant_admin` : écriture complète sur son tenant · `super_admin` : écriture complète sur tout tenant |
| IA | Aucune aujourd'hui — les services proposés viennent du catalogue de templates, sans suggestion automatique |
| Roadmap | Lot 7 (affectation en masse Villes × Services) et lot 8 (simplification du formulaire, verrou du slug) — voir `docs/product/execution-backlog.md` |

**Lien avec Marques** : le dialogue d'édition de service permet d'assigner une
marque à un service précis (`tenant_service_brands`, commit `0bffb3e`), scopée aux
marques déjà retenues dans "Mes marques" — un service ne peut pas afficher une
marque que le tenant n'a pas confirmé utiliser ailleurs. `ServicesManager` porte
cette section telle quelle, désormais aussi disponible côté Super Admin.

**Statut** : premier objet du lot B fait (interface unique Services + Zones).
L'ancien onglet Super Admin dupliqué (`ServicesTab`/`ZonesTab`, catalogue par
métier coché en masse, sans FK ni zones) a été supprimé — cette capacité de
sélection depuis le catalogue global n'existe plus nulle part pour l'instant,
volontairement : elle relève du lot 9 (différé), pas de ce lot.

Lot 8A fait : `ServicesManager` prend désormais une prop `canEditAdvancedFields`
(Super Admin uniquement) qui réserve Slug, Ordre d'affichage et les templates
SEO à l'agence — le tenant_admin ne voit que Nom, Description, Photo, Publié
sur le site, En vedette et Marques. Le slug reste généré automatiquement à la
création pour les deux rôles ; rien ne change dans les 122 slugs existants.
La suppression demande désormais une confirmation nommée mentionnant les
zones et marques réellement supprimées en cascade (vérifié sur le schéma).
La vignette photo dans l'Admin/Super Admin affichait toujours le placeholder
générique, jamais la vraie photo (bug préexistant de `ServiceMedia`/
`useTenant()` désactivé sur ces routes, découvert en spécifiant ce lot) —
**implémenté, validation manuelle en attente** : `ServicesManager` résout
désormais la photo avec un contexte tenant explicite (`tradeTemplateId` en
prop), même resolver que le public. Le compteur "publié/masqué" et le lien
"voir sur mon site" restent pour un Lot 8B éventuel.
