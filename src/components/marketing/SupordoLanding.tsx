import { SupordoHeader } from "./SupordoHeader";
import { SupordoHero } from "./SupordoHero";
import { SupordoTrades } from "./SupordoTrades";
import { SupordoActDemo } from "./SupordoActDemo";
import { SupordoActFive } from "./SupordoActFive";
import { SupordoActSix } from "./SupordoActSix";
import { SupordoActSeven } from "./SupordoActSeven";
import { SupordoActFinal } from "./SupordoActFinal";
import { SupordoFooter } from "./SupordoFooter";

/**
 * La landing de marque SUPORDO, servie sur "/" du seul hôte plateforme
 * (supordo.com — voir __root.tsx beforeLoad). Un hôte de tenant n'atteint
 * jamais ce composant : son "/" rend le site artisan, inchangé.
 *
 * `.supordo-brand` limite les tokens SUPORDO et Manrope à cet arbre, pour que
 * le langage visuel de la marque ne devienne jamais le système de design des
 * sites artisans générés par la plateforme.
 *
 * Narration : le produit → mon métier → à quoi ça ressemble → qui fait quoi
 * → combien → ce qu'il reste à savoir → action.
 *
 * Sept actes, contre dix auparavant. Les trois retirés — la prestation qui
 * prend place sur le site, le chantier publié, le site entier d'un client —
 * ne manquent pas : ils démontraient le mécanisme, et `/comment-ca-marche`
 * le démontre désormais mieux, avec le composant public réel. La page
 * d'accueil les introduit et ouvre le chemin ; elle ne refait plus le
 * travail des pages profondes.
 *
 * Chaque acte conservé mène quelque part : les métiers vers `/metiers`, la
 * démonstration vers `/exemples`, le partage des rôles vers
 * `/comment-ca-marche`, le prix vers `/tarifs`.
 *
 * Les appels à l'action marketing ne dépendent plus de `leadIntakeReady` :
 * leur destination existe, et `/demarrer` dit honnêtement quand une demande
 * ne peut pas encore être reçue. Seule la soumission du formulaire est gardée.
 *
 * Acte 3 « Démonstration SUPORDO » : le site montré est une démonstration
 * construite par SUPORDO, avec une entreprise fictive — fixtures dans
 * `src/data/marketing/supordo-demo-site.ts`, rendu en HTML/CSS par
 * `SupordoSiteDemo`. Il est étiqueté comme tel partout où il apparaît, et
 * n'est jamais présenté comme un client, un témoignage ou un résultat. Le
 * jour où un vrai site client autorisé existe, seules les fixtures changent.
 */
export function SupordoLanding() {
  return (
    <div className="supordo-brand min-h-screen bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader />
      <main>
        {/* Acte 1 */}
        <SupordoHero />
        {/* Acte 2 */}
        <SupordoTrades />
        {/* Acte 3 */}
        <SupordoActDemo />
        {/* Acte 4 */}
        <SupordoActFive />
        {/* Acte 5 */}
        <SupordoActSix />
        {/* Acte 6 */}
        <SupordoActSeven />
        {/* Acte 7 */}
        <SupordoActFinal />
      </main>
      <SupordoFooter />
    </div>
  );
}
