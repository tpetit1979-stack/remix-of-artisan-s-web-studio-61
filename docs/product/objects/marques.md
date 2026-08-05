# Marques

Deux objets liés, à ne pas confondre — voir aussi Bibliothèque métier.

| Champ | Catalogue (`brands`) | Sélection tenant (`tenant_brands`) |
|---|---|---|
| Propriétaire | Plateforme | Tenant |
| Écran référent | `super-admin.brands.tsx` | `admin.brands.tsx` — un clic, publication immédiate, déjà excellent |
| Composant référent | `super-admin.brands.tsx` | `admin.brands.tsx` |
| Routes | `/super-admin/brands` — lien ajouté à la nav principale Super Admin (commit `4dce739`) | `/admin/brands` — sélection générale ; assignation par service dans le dialogue d'édition de `admin.services.tsx` (`tenant_service_brands`, commit `0bffb3e`) |
| Permissions | `super_admin` : écriture complète · `tenant_admin` : lecture seule (catalogue affiché pour sélection) | `tenant_admin` : écriture complète sur sa sélection, générale et par service · `super_admin` : écriture complète sur tout tenant |
| IA | Aucune | Aucune |
| Roadmap | — | Lot C : bouton d'accès direct **à la sélection d'un tenant donné** depuis `super-admin.tenants.$tenantId.tsx`, sur le modèle du bouton "Gérer ce site" déjà existant |

**Statut** : deux trous distincts trouvés dans l'audit. Le premier (catalogue global
absent de la nav Super Admin) est **corrigé** depuis `4dce739`. Le second — aller
gérer les marques *d'un client précis* depuis sa fiche agence, sans deviner qu'il
faut d'abord basculer en mode client — reste ouvert et constitue le lot C.

