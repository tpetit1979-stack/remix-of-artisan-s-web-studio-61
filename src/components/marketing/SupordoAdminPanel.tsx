import type { ReactNode } from "react";

/**
 * Une représentation marketing de l'espace SUPORDO.
 *
 * Elle n'est pas une capture d'écran et ne prétend pas l'être : c'est une
 * mise en page simplifiée des informations que l'artisan renseigne vraiment.
 * Chaque champ montré correspond à une donnée que le produit gère
 * aujourd'hui — prestation, description, photo, commune, coordonnées,
 * demande reçue. Rien d'inventé, aucun tableau de bord spectaculaire qui
 * n'existe pas.
 *
 * Accessibilité : même traitement que les faux sites du lot précédent. Une
 * représentation de produit est une image, pas un document ; sans cela elle
 * injecte dans la page une seconde hiérarchie de titres et de valeurs que
 * rien ne distingue du contenu réel. Elle s'annonce donc comme une image
 * unique, nommée, et le contenu interne est masqué.
 *
 * Pourquoi un composant partagé plutôt qu'un bloc par page : les trois
 * moments de `/comment-ca-marche` (ce que vous tenez à jour, ce que vous
 * changez, ce qui vous revient) montrent le même objet sous trois angles.
 * Trois implémentations auraient divergé au premier ajustement.
 */
export function SupordoAdminPanel({
  label,
  ariaLabel,
  children,
  tone = "default",
}: {
  /** Sur-titre affiché dans le cadre, par exemple « Dans votre espace SUPORDO ». */
  label: string;
  /** Ce qu'une technologie d'assistance lit à la place du cadre. */
  ariaLabel: string;
  children: ReactNode;
  /** `flag` marque l'élément non lu, comme le fait l'espace réel. */
  tone?: "default" | "flag";
}) {
  return (
    <div
      role="img"
      aria-label={`${ariaLabel} Représentation de démonstration.`}
      className={`overflow-hidden rounded-[10px] border bg-white ${
        tone === "flag"
          ? "border-[var(--supordo-green)]/45 shadow-[0_0_0_3px_rgba(0,135,90,0.06)]"
          : "border-[var(--supordo-mint-200)]"
      }`}
    >
      <div aria-hidden="true">
        <p className="border-b border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] px-5 py-3 text-[11px] font-bold uppercase tracking-[0.12em] text-[var(--supordo-graphite)]/70">
          {label}
        </p>
        <div className="p-5 md:p-6">{children}</div>
      </div>
    </div>
  );
}

/** Un champ de l'espace : son intitulé, sa valeur. */
export function SupordoAdminField({
  label,
  children,
  divider = true,
}: {
  label: string;
  children: ReactNode;
  divider?: boolean;
}) {
  return (
    <div
      className={
        divider ? "border-t border-[var(--supordo-mint-200)] pt-3.5 first:border-0 first:pt-0" : ""
      }
    >
      <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[var(--supordo-graphite)]/60">
        {label}
      </p>
      <div className="mt-1 text-sm leading-relaxed text-[var(--supordo-forest)]">{children}</div>
    </div>
  );
}

/**
 * L'affordance d'action de l'espace réel — « Marquer comme lu » sur une
 * demande, par exemple. Rendu en `span` : c'est l'image d'un bouton, pas un
 * bouton. Un vrai bouton ici serait focusable et cliquable sans rien faire.
 */
export function SupordoAdminAction({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-[6px] border border-[var(--supordo-mint-200)] bg-[var(--supordo-warm)] px-3 py-1.5 text-xs font-semibold text-[var(--supordo-forest)]">
      {children}
    </span>
  );
}
