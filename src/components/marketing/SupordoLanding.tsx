import { SupordoHeader } from "./SupordoHeader";
import { SupordoHero } from "./SupordoHero";
import { SupordoTrades } from "./SupordoTrades";
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
 * Acte 3 « Démonstration SUPORDO » : volontairement non monté. Il exige un
 * site de démonstration réel et ses captures, qui n'existent pas encore dans
 * le dépôt. Une composition fabriquée — faux navigateur, entreprise fictive
 * présentée comme cliente — est exclue. Le lien « Voir un exemple » du Hero
 * suit cet état : pas d'ancre vers une section absente.
 */
export function SupordoLanding() {
  return (
    <div className="supordo-brand min-h-screen bg-[var(--supordo-warm)] antialiased">
      <SupordoHeader />
      <main>
        {/* Acte 1 */}
        <SupordoHero showExampleLink={false} />
        {/* Acte 2 */}
        <SupordoTrades />
        {/* Acte 3 — Démonstration : en attente des captures réelles. */}
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
