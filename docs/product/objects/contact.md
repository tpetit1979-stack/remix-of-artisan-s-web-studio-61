# Contact — Demandes, WhatsApp, réservation

Regroupés parce que ce sont tous des canaux par lesquels un client joint l'artisan
— pas parce qu'ils partagent une table. WhatsApp et la réservation vivent
aujourd'hui dans l'écran Apparence ; ils doivent le rejoindre (lot F).

| Champ | Demandes reçues | WhatsApp & réservation |
|---|---|---|
| Propriétaire | Tenant | Tenant |
| Écran référent | `admin.contacts.tsx` | Champs `whatsapp_*` / `booking_*` de `admin.settings.tsx` → à déplacer ici (lot F) |
| Composant référent | `admin.contacts.tsx` | À extraire de `admin.settings.tsx` lors du lot F |
| Routes | `/admin/contacts` — **aujourd'hui inaccessible depuis la fiche agence sauf via impersonation manuelle** | `/admin/settings` (temporaire, avant lot F) |
| Permissions | `tenant_admin` : lecture/écriture sur son tenant · `super_admin` : écriture complète | `tenant_admin` : écriture complète · `super_admin` : écriture complète |
| IA | Aucune | Aucune |
| Roadmap | Filtre "sans réponse récente" dans le futur écran Pilotage agence (lot A) | Déplacement complet lors du lot F |

**Statut** : Demandes fonctionnel côté client. WhatsApp/réservation attendent le lot F.
