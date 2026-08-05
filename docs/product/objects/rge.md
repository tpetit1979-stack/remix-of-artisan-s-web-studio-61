# RGE / Certifications

| Champ | Valeur |
|---|---|
| Propriétaire | Plateforme — plus strict que l'intuition ("c'est sa certification") : enjeux légaux d'une fausse déclaration, contrôle humain avant publication |
| Écran référent | Onglet "RGE" de `super-admin.tenants.$tenantId.tsx` (agence, `CertificationsTab`) — **aucun équivalent côté client aujourd'hui, même en lecture** |
| Composant référent | `CertificationsTab` (agence uniquement) |
| Routes | Pas de route client aujourd'hui |
| Permissions | `tenant_admin` : lecture seule (rien à écrire) · `super_admin` : écriture complète |
| IA | Aucune |
| Roadmap | Rendre le statut visible côté client, même en lecture seule — un objet qu'on ne peut ni changer ni voir a l'air d'avoir disparu, pas d'appartenir à quelqu'un (backlog Pareto, priorité P0) |

**Statut** : verrouillage confirmé et à documenter explicitement à l'écran (comme le
logo) plutôt que de rester une règle plus stricte que tout le reste sans explication.
