# Partenaires

| Champ | Valeur |
|---|---|
| Propriétaire | Tenant |
| Écran référent | `PartnersManager` — **déjà partagé Admin/Super Admin, c'est le modèle à copier pour le reste du backlog** |
| Composant référent | `PartnersManager` (partagé) |
| Routes | `/admin/partners` (client) · onglet "Partenaires" de `super-admin.tenants.$tenantId.tsx` (agence) — même composant, pas de duplication |
| Permissions | `tenant_admin` : écriture complète sur son tenant · `super_admin` : écriture complète sur tout tenant |
| IA | Aucune |
| Roadmap | Rien — déjà à l'état cible |

**Statut** : à l'état cible. Preuve vivante que le principe 3 fonctionne déjà en
production ailleurs dans le produit.
