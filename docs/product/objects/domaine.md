# Domaine

| Champ | Valeur |
|---|---|
| Propriétaire | Plateforme — verrouillé au niveau base de données, seul le Super Admin peut l'écrire |
| Écran référent | Gestion du tenant côté agence uniquement |
| Composant référent | `tenants.domain`, résolu par `resolveTenantForSsr` (source de vérité unique de la résolution par domaine, jamais dupliquée) |
| Routes | Résolution automatique par `Host` sur toutes les routes publiques — jamais par variable applicative |
| Permissions | `tenant_admin` : aucun accès · `super_admin` : écriture complète |
| IA | Aucune |
| Roadmap | Séparer `app.lignia.fr` (administration) du domaine de chaque client (site public seul) — direction actée, non urgente : aucune fuite de données possible aujourd'hui, `/admin` et `/super-admin` ne résolvent jamais le tenant par le domaine |

**Statut** : fondation saine, ne pas toucher au mécanisme de résolution. Seul le
sujet de séparation de domaine (P2) reste ouvert, sans urgence.
