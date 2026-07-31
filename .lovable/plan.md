# Diagnostic : la preview n'est ni désynchronisée, ni en cache périmé

## 1. Ta vérification est juste — le reset est annulé

`src/components/public/CertificationBadges.tsx` est **strictement identique** entre `6eb8320` et l'état actuel de `main`.

Diff complet entre les deux commits, tous fichiers confondus :

```text
M  .lovable/plan.md     (fichier de plan interne Lovable)
M  bun.lock
M  package.json         (@lovable.dev/vite-tanstack-config 2.7.7 -> 2.8.2)
```

Aucun fichier applicatif ne diffère. Les deux commits `39421bb` ("Work in progress") et `12f0475` ("Update plan") sont des commits d'intendance de la plateforme : une montée de version de l'outillage de build et le fichier de plan. Le reset `--hard` n'apporterait donc rien, et je ne le recommande plus. L'arbre de travail est par ailleurs propre (`git status` vide), et le fichier sur disque est identique au commit.

## 2. Pourquoi la preview semblait afficher un état inconnu

Ce n'est pas un cache de build. Le serveur de développement a d'ailleurs redémarré à 10:34 sur le code courant, et le comportement est inchangé — parce qu'il est **voulu par le code**.

La page d'accueil renvoie un 404 applicatif, pas une erreur de build :

```text
GET http://localhost:8080/                        -> HTTP 404
GET http://localhost:8080/?tenant=bfie-easydep    -> HTTP 200
```

Le HTML rendu le confirme : le routeur résout `__root__` puis `notFound`, avec `tenant: null, settings: null`.

Cause exacte, dans `src/routes/index.tsx` ligne 29 :

```ts
const tenant = await resolveTenantForSsr(input);
if (!tenant) throw notFound();
```

Et `resolveTenantForSsr` dans `src/lib/tenant.ts` est documenté comme **fail-closed**, volontairement :

- un `?tenant=` explicite est autoritaire ;
- sinon la résolution se fait strictement par nom d'hôte ;
- aucun hôte de preview ne retombe sur un tenant par défaut.

L'URL de preview `id-preview--f9d7add1-...lovable.app` ne correspond à aucun `tenant.domain`. Sans paramètre `?tenant=`, la home rend donc la page 404 générique — ce qui, vu depuis le navigateur, ressemble à une preview cassée ou périmée, alors que c'est le comportement attendu de la sécurité multi-tenant.

C'est aussi pour cette raison que tous les audits précédents pointaient sur `?tenant=bfie-easydep`.

## 3. Conclusion

- Aucune action Git n'est nécessaire. L'historique reste intact.
- Aucun rebuild forcé n'est nécessaire : le serveur sert déjà le HEAD courant de `main`, et un redémarrage ne changerait pas le 404.
- Pour visualiser un site en preview, utiliser une URL portant le tenant, par exemple `/?tenant=bfie-easydep`.

## 4. Décision à prendre (aucune modification effectuée)

Trois options possibles, à ton choix :

**A. Ne rien changer.** Le comportement fail-closed est correct en production. On continue à tester avec `?tenant=`.

**B. Améliorer seulement l'écran 404 sur hôte non résolu.** Afficher, uniquement sur les hôtes de preview, un message explicite du type « Aucun site associé à cette adresse » avec la liste des tenants disponibles en lien. La règle de résolution reste inchangée, aucun tenant n'est deviné.

**C. Rediriger l'hôte de preview nu vers un tenant de démonstration.** Plus confortable pour les démonstrations client, mais cela affaiblit le principe fail-closed et introduit un tenant par défaut. Non recommandé.
