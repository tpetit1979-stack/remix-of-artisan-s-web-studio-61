# Erreurs de récupération — documentation Costructor

Date : 2026-09-05

## Blocage global

Aucune page n'a pu être récupérée. Le domaine est refusé par le proxy d'egress
de l'environnement d'exécution (politique réseau de l'organisation).

| URL | Outil | Résultat |
| --- | --- | --- |
| https://support.costructor.co/fr/ | `curl` | `curl: (56) CONNECT tunnel failed, response 403` |
| https://support.costructor.co/fr/ | WebFetch | `EGRESS_BLOCKED — Access to support.costructor.co is blocked by the network egress proxy` |

Trace côté proxy (`/__agentproxy/status`) :

```
{
  "ts": "2026-09-05T12:21:30.348Z",
  "kind": "connect_rejected",
  "detail": "gateway answered 403 to CONNECT (policy denial or upstream failure)",
  "host": "support.costructor.co:443"
}
```

## Conséquence

- 0 catégorie récupérée (10 attendues).
- 0 article récupéré.
- Aucun fichier `<categorie>/<slug>.md` écrit.
- Pas d'`index.md` : il n'y a rien à indexer.

## Ce qui débloquerait la récupération

Ajouter `support.costructor.co` à la liste des domaines autorisés de
l'environnement Claude Code (configuration réseau de l'environnement,
voir https://code.claude.com/docs/en/claude-code-on-the-web), puis relancer
la tâche à l'identique.

Le contournement du refus de politique (miroir, cache tiers, autre domaine)
n'a pas été tenté : c'est explicitement interdit par les règles de l'agent
proxy de cet environnement.
