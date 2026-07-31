# Provenance des logos de certification RGE

Ce dossier alimente `guessLogoUrl()` (`src/lib/rge-api.functions.ts`), qui
choisit le logo affiché par `CertificationBadges.tsx` pour chaque
certification RGE importée.

Historique : `certibat.png`, `qualifelec.png` et `qualibat.svg` avaient été
récupérés automatiquement par erreur (page 404 sauvegardée comme image) et
ont été réparés le 2026-07-31. Les 8 fichiers "identité Qualit'EnR"
ci-dessous ont été ajoutés le même jour pour la refonte graphique 2026 de
Qualit'EnR.

| Fichier | Utilisé pour | Source | Date | Statut |
|---|---|---|---|---|
| `certibat.png` | Organisme "Certibat" | Récupéré depuis certibat.fr | 2026-07-31 | Scrapé — contenu vérifié (vraie image), URL exacte non re-vérifiée indépendamment |
| `qualifelec.png` | Organisme "Qualifelec" | Récupéré depuis qualifelec.fr | 2026-07-31 | Scrapé — contenu vérifié (vraie image), URL exacte non re-vérifiée indépendamment |
| `qualibat.svg` | Organisme "Qualibat" | Récupéré depuis qualibat.com | 2026-07-31 | Scrapé — contenu vérifié (vrai SVG, rendu visuellement contrôlé), URL exacte non re-vérifiée indépendamment |
| `qualipac.png` | Famille QualiPAC | JPEG fourni par l'administrateur (identité modernisée Qualit'EnR, juillet 2026) → converti en PNG | 2026-07-31 | Source fournie, pas de transparence (héritée du JPEG) — version SVG/PNG transparent officielle à rechercher |
| `qualibois.png` | Famille Qualibois | JPEG fourni par l'administrateur → converti en PNG | 2026-07-31 | Idem |
| `qualipv.png` | Famille QualiPV | JPEG fourni par l'administrateur → converti en PNG | 2026-07-31 | Idem |
| `qualisol.png` | Famille Qualisol | JPEG fourni par l'administrateur → converti en PNG | 2026-07-31 | Idem |
| `ventilation-plus.png` | Famille Ventilation + | JPEG fourni par l'administrateur → converti en PNG | 2026-07-31 | Idem |
| `chauffage-plus.png` | Famille Chauffage + | JPEG fourni par l'administrateur → converti en PNG | 2026-07-31 | Idem |
| `recharge-elec-plus.png` | Famille Recharge Elec + | JPEG fourni par l'administrateur → converti en PNG | 2026-07-31 | Idem |
| `qualitenr.png` | Logo institutionnel Qualit'EnR | JPEG fourni par l'administrateur → converti en PNG | 2026-07-31 | Idem |

## Comment la provenance JPEG a été établie

Les 8 fichiers "identité Qualit'EnR" contiennent tous, dans leurs métadonnées
PNG (chunk `tEXt`), le commentaire `"Compressed by jpeg-recompress"` avec des
horodatages de traitement à quelques secondes d'écart (même lot). C'est la
preuve technique qu'ils proviennent bien d'une conversion JPEG → PNG et non
d'une génération d'image sans source, contrairement à ce qui avait été
supposé dans une première analyse de ce dossier — cette hypothèse initiale a
été vérifiée et corrigée avant d'être actée dans ce README.

Le JPEG source n'a pas de canal alpha : le fond plein (coloré ou blanc) de
ces fichiers vient donc du JPEG d'origine, ce n'est pas un ajout artificiel.
La marge blanche résiduelle autour du visuel est mesurée à 1–4 px sur 160,
invisible à la taille d'affichage réelle (`h-10`, 40px).

## Action de suivi recommandée

Aucun de ces 8 fichiers n'est un export officiel (SVG ou PNG transparent)
téléchargé directement depuis Qualit'EnR — ce sont des JPEG fournis
convertis. Si un kit média officiel devient accessible plus tard (l'accès
direct à qualit-enr.org était bloqué depuis l'environnement qui a fait cette
vérification, protection anti-bot du site), remplacer ces fichiers par les
vrais exports et mettre à jour ce tableau (statut → "officiel", URL réelle).
