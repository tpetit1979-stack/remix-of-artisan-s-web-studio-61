# Vitrine — Portfolio & Équipe

Regroupés parce que les deux répondent à la même question pour l'artisan : "qu'est-ce
que je montre de mon travail et de mon équipe ?" — pas parce qu'ils partagent une table.

| Champ | Portfolio | Équipe |
|---|---|---|
| Propriétaire | Tenant | Tenant |
| Écran référent | `admin.portfolio.tsx` | `TeamManager` — **déjà partagé Admin/Super Admin** |
| Composant référent | `admin.portfolio.tsx` | `TeamManager` (partagé) |
| Routes | `/admin/portfolio` (client) · accessible depuis la fiche agence via le bouton "Gérer les réalisations" | `/admin/team` (client) · onglet "Équipe" côté agence — même composant |
| Permissions | `tenant_admin` : écriture complète, publication incluse · `super_admin` : écriture complète | `tenant_admin` : écriture complète · `super_admin` : écriture complète |
| IA | Aucune aujourd'hui — piste future : légende pré-rédigée à partir de la photo importée | Aucune |
| Roadmap | Harmoniser l'accès agence sur le même mécanisme que Marques (lot C/B) | Rien — déjà à l'état cible |

**Statut** : Équipe à l'état cible. Portfolio fonctionnel mais avec un accès agence
encore ad hoc (bouton dédié plutôt qu'onglet standard) — à uniformiser dans le lot B.
