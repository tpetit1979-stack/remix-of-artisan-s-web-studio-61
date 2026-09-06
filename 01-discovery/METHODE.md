Deux façons dont un éditeur héberge sa documentation :

SOUS-DOMAINE — la doc a son propre domaine.
Exemples : help.tolteck.com/fr/ et docv5.progbat.com/
Pour collecter : on prend tout ce que contient ce sous-domaine.

INTÉGRÉE AU SITE — la doc est une section du site principal,
reconnaissable à son préfixe d'URL.
Exemples : batikko.com/documentation et leobati.fr/bati/guide
Pour collecter : on filtre le sitemap du site principal et on
ne garde que les URL commençant par ce préfixe.

Conséquence : on classe chaque URL par son CHEMIN, jamais par
son domaine. Un même concurrent peut cumuler les deux cas.

Les 6 concurrents déjà collectés (axonaut, costructor, inter-fast,
openfire, sellsy, vertuoza) ne doivent pas être recollectés.
