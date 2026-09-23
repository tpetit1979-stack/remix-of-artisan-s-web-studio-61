import type { CSSProperties } from "react";
import { demoPresentationProps } from "./demo-presentation";
import {
  SUPORDO_DEMO_SITE,
  type DemoProject,
  type DemoService,
  type DemoSite,
} from "@/data/marketing/supordo-demo-site";

/**
 * Représentation d'un site artisan préparé avec SUPORDO — entièrement fictive.
 *
 * Construite en HTML/CSS plutôt qu'en capture : plus légère, nette à tous les
 * zooms, et modifiable en un seul endroit le jour où de vrais sites clients
 * autorisés la remplaceront.
 *
 * Chaque site de démonstration porte son propre thème — couleur dominante,
 * fond, typographie, rayon des boutons — défini dans les fixtures et injecté
 * en variables CSS locales. Ces valeurs n'entrent jamais dans le design
 * system SUPORDO : ce sont les couleurs du client, pas celles de la marque.
 * C'est précisément ce que la démonstration doit prouver — un socle commun,
 * des identités différentes.
 *
 * La typographie est volontairement une pile système, distincte de Manrope :
 * sans cela, le site du client ressemble à un composant SUPORDO de plus.
 *
 * Aucune donnée réelle, aucun client, aucun témoignage, aucun chiffre.
 *
 * Trois échelles, un seul composant :
 *
 * - `desktop` — le site en pleine largeur.
 * - `mobile`  — la colonne téléphone, ~300 px.
 * - `preview` — un aperçu large et tronqué, pour les endroits où l'on veut
 *   que le visiteur reconnaisse un site plutôt que d'identifier une capture.
 *
 * Deux propriétés distinctes en découlent, là où il n'y en avait qu'une :
 * `narrow` (la représentation est étroite, donc aucun point de rupture de
 * fenêtre ne doit la piloter) et `small` (l'échelle typographique du
 * téléphone). L'aperçu est étroit sans être petit — c'est exactement la
 * combinaison qui manquait, et la raison pour laquelle quatre univers
 * différents se ressemblaient tous dans une colonne de 300 px.
 *
 * Accessibilité : ces trois rendus sont des IMAGES du produit, pas des
 * documents. Sans traitement, un lecteur d'écran traverse quatre fausses
 * navigations, quatre faux titres et quatre faux numéros de téléphone comme
 * s'ils appartenaient à la page SUPORDO. Chaque représentation est donc
 * annoncée comme une image unique (`role="img"` + `aria-label`), ce qui
 * retire son contenu de l'arbre d'accessibilité. Les vrais sites des
 * artisans utilisent d'autres composants (`PublicHeader`, `HeroSection`…) et
 * ne sont pas concernés.
 */
type WithSite = { site?: DemoSite };

export type DemoVariant = "desktop" | "mobile" | "preview";

function themeVars(site: DemoSite): CSSProperties {
  return {
    ["--demo-primary" as string]: site.theme.primary,
    ["--demo-surface" as string]: site.theme.surface,
    ["--demo-text" as string]: site.theme.text,
    ["--demo-radius" as string]: site.theme.radius,
    fontFamily: site.theme.fontStack,
  };
}

/** Barre supérieure du site fictif : identité, navigation, téléphone. */
function DemoHeader({
  site,
  narrow,
  small,
  preview,
}: {
  site: DemoSite;
  narrow: boolean;
  small: boolean;
  preview: boolean;
}) {
  // À la largeur de l'aperçu, quatre entrées de navigation plus un numéro
  // débordent et rognent le numéro. On en montre trois : c'est un aperçu, et
  // un bouton d'appel coupé est un défaut, pas un cadrage.
  const nav = preview ? site.nav.slice(0, 3) : site.nav;
  return (
    <div
      className={`flex items-center justify-between gap-3 py-3 ${narrow ? "px-4" : "px-4 md:px-6"}`}
      style={{ backgroundColor: "var(--demo-text)" }}
    >
      <div className="min-w-0">
        <p
          className={`truncate font-bold tracking-[0.01em] text-white ${small ? "text-[13px]" : narrow ? "text-[15px]" : "text-[13px] md:text-[15px]"}`}
        >
          {site.companyName}
        </p>
        <p
          className={`truncate uppercase tracking-[0.12em] text-white/50 ${small ? "text-[9px]" : narrow ? "text-[10px]" : "text-[9px] md:text-[10px]"}`}
        >
          {site.trade}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {/* L'aperçu peut mesurer 350 px sur un téléphone comme 700 px dans une
            page métier : sa navigation doit donc réagir à SA largeur, pas à
            celle de la fenêtre. Sans cette requête de conteneur, le bouton
            d'appel débordait de la page à 390 px. */}
        {!small && (
          <nav
            className={`min-w-0 items-center ${
              preview ? "hidden gap-3 @min-[460px]:flex" : "hidden gap-4 md:flex"
            }`}
          >
            {nav.map((item, i) => (
              <span
                key={item}
                className={`truncate ${preview ? "text-[10px]" : "text-[11px]"} ${i === 0 ? "font-semibold text-white" : "text-white/60"}`}
              >
                {item}
              </span>
            ))}
          </nav>
        )}
        <span
          className={`shrink-0 px-3 py-1.5 font-semibold text-white ${small ? "text-[10px]" : narrow ? "text-[11px]" : "text-[10px] md:text-[11px]"}`}
          style={{ backgroundColor: "var(--demo-primary)", borderRadius: "var(--demo-radius)" }}
        >
          {site.phone}
        </span>
      </div>
    </div>
  );
}

/** Bandeau d'accueil : photo, titre du site en surimpression, bouton de devis. */
function DemoHeroBand({
  site,
  narrow,
  small,
}: {
  site: DemoSite;
  narrow: boolean;
  small: boolean;
}) {
  return (
    <div className="relative">
      <div className={small ? "aspect-[4/3]" : "aspect-[16/7]"}>
        <img
          src={site.heroImage}
          alt=""
          width={1600}
          height={900}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
      <div className={`absolute inset-x-0 bottom-0 ${narrow ? "p-4" : "p-4 md:p-6"}`}>
        <p
          className={`font-bold leading-tight text-white ${
            small ? "text-[15px]" : narrow ? "text-[19px]" : "text-[17px] md:text-[22px]"
          }`}
        >
          {site.headline}
        </p>
        <span
          className="mt-3 inline-flex px-4 py-2 text-[11px] font-semibold text-white"
          style={{ backgroundColor: "var(--demo-primary)", borderRadius: "var(--demo-radius)" }}
        >
          Demander un devis
        </span>
      </div>
    </div>
  );
}

/** Une prestation telle qu'elle apparaît sur le site public du client. */
export function SupordoDemoService({
  service,
  site = SUPORDO_DEMO_SITE,
  size = "md",
}: WithSite & { service?: DemoService; size?: "md" | "lg" }) {
  const item = service ?? site.services[0]!;
  return (
    <article
      {...demoPresentationProps(site, `Fiche prestation « ${item.name} »`)}
      className="overflow-hidden border border-black/10 bg-white"
      style={{ ...themeVars(site), borderRadius: "8px" }}
    >
      <div aria-hidden="true" className={size === "lg" ? "aspect-[16/9]" : "aspect-[4/3]"}>
        <img
          src={item.image}
          alt=""
          width={1600}
          height={1086}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div aria-hidden="true" className={size === "lg" ? "p-5 md:p-6" : "p-3.5"}>
        <h4
          className={`font-bold leading-snug ${size === "lg" ? "text-lg md:text-xl" : "text-[13px]"}`}
          style={{ color: "var(--demo-text)" }}
        >
          {item.name}
        </h4>
        <p
          className={`mt-1.5 leading-relaxed text-black/60 ${
            size === "lg" ? "text-sm md:text-base" : "text-[11px]"
          }`}
        >
          {item.description}
        </p>
        <p
          className={`mt-3 border-t border-black/10 pt-2.5 text-black/50 ${
            size === "lg" ? "text-sm" : "text-[10px]"
          }`}
        >
          Intervention à {site.city} et alentours
        </p>
      </div>
    </article>
  );
}

/** Une réalisation telle qu'elle apparaît sur le site public du client. */
export function SupordoDemoProject({
  project,
  site = SUPORDO_DEMO_SITE,
  size = "md",
}: WithSite & { project?: DemoProject; size?: "md" | "lg" }) {
  const item = project ?? site.projects[0]!;
  return (
    <article
      {...demoPresentationProps(site, `Fiche réalisation « ${item.title} »`)}
      className="overflow-hidden border border-black/10 bg-white"
      style={{ ...themeVars(site), borderRadius: "8px" }}
    >
      <div aria-hidden="true" className={size === "lg" ? "aspect-[16/10]" : "aspect-[4/3]"}>
        <img
          src={item.image}
          alt=""
          width={1600}
          height={1086}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div aria-hidden="true" className={size === "lg" ? "p-5 md:p-6" : "p-3.5"}>
        <h4
          className={`font-bold leading-snug ${size === "lg" ? "text-lg md:text-xl" : "text-[13px]"}`}
          style={{ color: "var(--demo-text)" }}
        >
          {item.title}
        </h4>
        <p
          className={`mt-1.5 text-black/60 ${size === "lg" ? "text-sm md:text-base" : "text-[11px]"}`}
        >
          {item.city} · {item.service}
        </p>
        <span
          className={`mt-3 inline-flex font-semibold ${size === "lg" ? "text-sm" : "text-[10px]"}`}
          style={{ color: "var(--demo-primary)" }}
        >
          Voir la réalisation →
        </span>
      </div>
    </article>
  );
}

/** Bas de page du site fictif : zones d'intervention et coordonnées. */
function DemoFooter({ site, narrow }: { site: DemoSite; narrow: boolean }) {
  return (
    <div
      className={`border-t border-black/10 ${narrow ? "px-4 py-4" : "px-4 py-4 md:px-6 md:py-5"}`}
      style={{ backgroundColor: "var(--demo-surface)" }}
    >
      <div
        className={`flex flex-col gap-3 ${narrow ? "" : "md:flex-row md:items-start md:justify-between"}`}
      >
        <div className="min-w-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">
            Zones d'intervention
          </p>
          <p className="mt-1.5 text-[11px] leading-relaxed text-black/70">
            {site.areas.join(" · ")}
          </p>
        </div>
        <div className="shrink-0">
          <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">
            Nous contacter
          </p>
          <p className="mt-1.5 text-[11px] font-semibold" style={{ color: "var(--demo-text)" }}>
            {site.phone}
          </p>
          <p className="text-[11px] text-black/60">{site.email}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Les prestations occupent toute la largeur quelle que soit leur quantité :
 * une grille figée à trois colonnes laisserait deux trous sur un site qui
 * n'affiche qu'une prestation. Les classes sont écrites en toutes lettres,
 * Tailwind ne compilant pas une classe construite à l'exécution.
 */
const SERVICE_COLUMNS: Record<number, string> = {
  0: "",
  1: "sm:grid-cols-1",
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-3",
};

/**
 * La zone d'intervention et les coordonnées, telles qu'elles apparaissent en
 * bas du site du client — extraites pour servir de preuve à part entière.
 *
 * Pour un chauffagiste, « intervenez-vous chez moi ? » passe avant toute
 * photographie : la preuve pertinente de ce métier n'est pas une image, c'est
 * une liste de communes et un numéro. Réutilise `DemoFooter`, sans le
 * dupliquer.
 */
export function SupordoDemoCoverage({ site = SUPORDO_DEMO_SITE }: WithSite) {
  return (
    <div
      {...demoPresentationProps(site, "Zone d'intervention et coordonnées")}
      className="overflow-hidden rounded-[10px] border border-black/10"
      style={themeVars(site)}
    >
      <div aria-hidden="true">
        <DemoFooter site={site} narrow />
      </div>
    </div>
  );
}

/**
 * Barre de navigateur minimale, réservée à l'aperçu.
 *
 * Elle n'est pas décorative : c'est le signal le plus court pour qu'un
 * visiteur comprenne en une fraction de seconde qu'il regarde un site web et
 * non un composant de la page SUPORDO. Le domaine vient des fixtures — il se
 * termine par `.example`, réservé par l'IANA, donc manifestement fictif.
 *
 * Gris neutre volontairement : l'identité du client commence en dessous, et
 * c'est elle qui doit distinguer les quatre démonstrations les unes des
 * autres.
 */
function DemoBrowserBar({ site }: { site: DemoSite }) {
  return (
    <div className="flex items-center gap-2 border-b border-black/10 bg-[#ECEAE6] px-3 py-2">
      <span className="flex gap-1">
        <span className="h-2 w-2 rounded-full bg-black/15" />
        <span className="h-2 w-2 rounded-full bg-black/15" />
        <span className="h-2 w-2 rounded-full bg-black/15" />
      </span>
      <span className="ml-1 truncate rounded-[3px] bg-white px-2.5 py-1 font-sans text-[11px] text-black/45">
        {site.email.split("@")[1]}
      </span>
    </div>
  );
}

/**
 * Le site fictif. `variant="desktop"` pour la représentation large,
 * `variant="mobile"` pour la colonne téléphone, `variant="preview"` pour
 * l'aperçu large et tronqué.
 *
 * L'aperçu montre l'en-tête, le bandeau d'accueil et les prestations à une
 * échelle où le texte se lit, puis se coupe en fondu. La coupe est le choix
 * de composition central de ce lot : montrer le site entier obligeait à le
 * réduire jusqu'à ce que quatre univers différents se ressemblent. Un
 * fragment lisible prouve davantage qu'un site complet illisible — et le
 * fondu dit qu'il y a une suite, ce que le lien sous l'aperçu propose.
 *
 * Le cadrage est donné en proportion, pas en pixels : l'aperçu montre donc
 * la même part du site quelle que soit sa largeur, et les quatre
 * démonstrations ont exactement la même hauteur — une entreprise au corpus
 * plus court ne laisse pas de trou dans la grille. Rien n'est inventé pour
 * autant : c'est le cadrage qui s'aligne, pas le contenu.
 */
export function SupordoSiteDemo({
  site = SUPORDO_DEMO_SITE,
  variant = "desktop",
  previewAspect = "3 / 4",
}: WithSite & { variant?: DemoVariant; previewAspect?: string }) {
  const narrow = variant !== "desktop";
  const small = variant === "mobile";
  const preview = variant === "preview";

  const body = (
    <>
      <DemoHeader site={site} narrow={narrow} small={small} preview={preview} />
      <DemoHeroBand site={site} narrow={narrow} small={small} />

      <div className={narrow ? "px-4 py-5" : "px-4 py-6 md:px-6 md:py-8"}>
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">
          Nos prestations
        </p>
        <div
          className={`mt-3 grid gap-3 ${
            small
              ? "grid-cols-1"
              : preview
                ? PREVIEW_SERVICE_COLUMNS[Math.min(site.services.length, 2)]!
                : `grid-cols-1 ${SERVICE_COLUMNS[Math.min(site.services.length, 3)]}`
          }`}
        >
          {(narrow ? site.services.slice(0, 2) : site.services).map((service) => (
            <SupordoDemoService key={service.name} service={service} site={site} />
          ))}
        </div>

        {/* L'aperçu s'arrête aux prestations : ce qui vient après serait
            coupé par le cadrage, donc chargé pour rien. */}
        {!preview && site.projects.length > 0 && (
          <>
            <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">
              Nos réalisations
            </p>
            <div
              className={`mt-3 grid gap-3 ${small ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}
            >
              {(small ? site.projects.slice(0, 1) : site.projects).map((project) => (
                <SupordoDemoProject key={project.title} project={project} site={site} />
              ))}
            </div>
          </>
        )}
      </div>

      {!preview && <DemoFooter site={site} narrow={narrow} />}
    </>
  );

  if (!preview) {
    return (
      <div
        {...demoPresentationProps(site, "Site de démonstration")}
        className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white"
        style={themeVars(site)}
      >
        <div aria-hidden="true">{body}</div>
      </div>
    );
  }

  return (
    <div
      {...demoPresentationProps(site, "Aperçu du site")}
      className="@container w-full overflow-hidden rounded-[10px] border border-black/10 bg-white shadow-[0_1px_2px_rgba(16,41,28,0.06),0_12px_28px_-18px_rgba(16,41,28,0.45)]"
      style={themeVars(site)}
    >
      <div aria-hidden="true">
        <DemoBrowserBar site={site} />
        <div className="relative overflow-hidden" style={{ aspectRatio: previewAspect }}>
          {body}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-gradient-to-t from-white via-white/85 to-transparent" />
        </div>
      </div>
    </div>
  );
}

/**
 * Dans l'aperçu, deux prestations côte à côte restent lisibles ; une seule
 * occupe toute la largeur plutôt que de laisser une colonne vide.
 */
const PREVIEW_SERVICE_COLUMNS: Record<number, string> = {
  0: "grid-cols-1",
  1: "grid-cols-1",
  2: "grid-cols-1 @min-[460px]:grid-cols-2",
};
