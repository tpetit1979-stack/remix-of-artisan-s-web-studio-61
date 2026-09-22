import { SupordoHeader } from "./SupordoHeader";
import { SupordoHero } from "./SupordoHero";
import { SupordoTrades } from "./SupordoTrades";
import { SupordoActDemo } from "./SupordoActDemo";
import { SupordoActThree } from "./SupordoActThree";
import { SupordoActRealisation } from "./SupordoActRealisation";
import { SupordoActContenu } from "./SupordoActContenu";
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
 * Narration : reconnaissance → résultat → preuve du mécanisme → preuve du
 * travail → contenu concret → partage des rôles → prix → réassurance →
 * action. Montrer avant d'expliquer, expliquer avant de vendre.
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
        {/* Acte 4A */}
        <SupordoActThree />
        {/* Acte 4B */}
        <SupordoActRealisation />
        {/* Acte 5 */}
        <SupordoActContenu />
        {/* Acte 6 */}
        <SupordoActFive />
        {/* Acte 7 */}
        <SupordoActSix />
        {/* Acte 8 */}
        <SupordoActSeven />
        {/* Acte 9 */}
        <SupordoActFinal />
      </main>
      <SupordoFooter />
    </div>
  );
}
