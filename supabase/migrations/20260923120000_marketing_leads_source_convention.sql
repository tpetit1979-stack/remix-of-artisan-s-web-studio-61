-- Élargit la contrainte de `source` pour que l'attribution dise la vérité.
--
-- Avant : six valeurs figées (home, pricing, how_it_works, examples, start,
-- confirmation). Les pages /metiers, /metiers/<slug> et /exemples/<slug>
-- n'avaient aucune valeur honnête à écrire, et le formulaire inscrivait
-- "start" en dur pour tout le monde — donc aucune attribution réelle.
--
-- Après : une forme, pas une liste. Un jeton de surface, éventuellement
-- suivi d'un slug pour les deux pages de détail, séparé par un point —
-- « trade.couvreur ». Un point plutôt que deux-points : ce dernier est
-- percent-encodé dans une URL (`src=trade%3Acouvreur`), ce qui fait dépendre
-- l'attribution du décodage du routeur. Le point ne l'est pas, et aucun slug
-- n'en contient. La contrainte garde la
-- FORME ; l'existence réelle du slug est vérifiée côté serveur contre les
-- données statiques du site (`supordo-demo-site.ts`, `supordo-trade-pages.ts`),
-- ce que la base ne peut pas faire.
--
-- Purement additive : les six valeurs précédentes satisfont toujours la
-- nouvelle contrainte, et la table ne contient aucune ligne.
--
-- `header` et `footer` : l'en-tête et le pied de page portent le même lien
-- sur toutes les surfaces marketing. Ils méritent leur propre valeur plutôt
-- que d'être confondus avec la page qui les affiche — sans quoi le bouton le
-- plus cliqué du site déclarerait « page d'accueil » depuis /tarifs.
--
-- `direct` couvre une arrivée sur /demarrer sans origine exploitable. C'est
-- une valeur vraie, là où réécrire "start" serait un mensonge commode.

alter table public.marketing_leads
  drop constraint marketing_leads_source_check;

alter table public.marketing_leads
  add constraint marketing_leads_source_check check (
    source ~ '^(home|pricing|how_it_works|examples|trades|header|footer|start|confirmation|direct|example\.[a-z0-9-]{1,60}|trade\.[a-z0-9-]{1,60})$'
  );
