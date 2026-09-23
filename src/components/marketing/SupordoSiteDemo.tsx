import type { CSSProperties } from "react";
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
 */
type WithSite = { site?: DemoSite };

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
function DemoHeader({ site, compact }: { site: DemoSite; compact: boolean }) {
  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 md:px-6"
      style={{ backgroundColor: "var(--demo-text)" }}
    >
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold tracking-[0.01em] text-white md:text-[15px]">
          {site.companyName}
        </p>
        <p className="truncate text-[9px] uppercase tracking-[0.12em] text-white/50 md:text-[10px]">
          {site.trade}
        </p>
      </div>
      <div className="flex items-center gap-4">
        {!compact && (
          <nav className="hidden items-center gap-4 md:flex">
            {site.nav.map((item, i) => (
              <span
                key={item}
                className={`text-[11px] ${i === 0 ? "font-semibold text-white" : "text-white/60"}`}
              >
                {item}
              </span>
            ))}
          </nav>
        )}
        <span
          className="shrink-0 px-3 py-1.5 text-[10px] font-semibold text-white md:text-[11px]"
          style={{ backgroundColor: "var(--demo-primary)", borderRadius: "var(--demo-radius)" }}
        >
          {site.phone}
        </span>
      </div>
    </div>
  );
}

/** Bandeau d'accueil : photo, titre du site en surimpression, bouton de devis. */
function DemoHeroBand({ site, compact }: { site: DemoSite; compact: boolean }) {
  return (
    <div className="relative">
      <div className={compact ? "aspect-[4/3]" : "aspect-[16/7]"}>
        <img
          src={site.heroImage}
          alt={site.heroImageAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <p
          className={`font-bold leading-tight text-white ${
            compact ? "text-[15px]" : "text-[17px] md:text-[22px]"
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
      className="overflow-hidden border border-black/10 bg-white"
      style={{ ...themeVars(site), borderRadius: "8px" }}
    >
      <div className={size === "lg" ? "aspect-[16/9]" : "aspect-[4/3]"}>
        <img
          src={item.image}
          alt={item.imageAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className={size === "lg" ? "p-5 md:p-6" : "p-3.5"}>
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
      className="overflow-hidden border border-black/10 bg-white"
      style={{ ...themeVars(site), borderRadius: "8px" }}
    >
      <div className={size === "lg" ? "aspect-[16/10]" : "aspect-[4/3]"}>
        <img
          src={item.image}
          alt={item.imageAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className={size === "lg" ? "p-5 md:p-6" : "p-3.5"}>
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
function DemoFooter({ site }: { site: DemoSite }) {
  return (
    <div
      className="border-t border-black/10 px-4 py-4 md:px-6 md:py-5"
      style={{ backgroundColor: "var(--demo-surface)" }}
    >
      <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
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
 * Le site fictif entier. `variant="desktop"` pour la représentation large,
 * `variant="mobile"` pour la colonne étroite — c'est le même site, pas deux
 * démonstrations différentes.
 */
export function SupordoSiteDemo({
  site = SUPORDO_DEMO_SITE,
  variant = "desktop",
}: WithSite & { variant?: "desktop" | "mobile" }) {
  const compact = variant === "mobile";
  return (
    <div
      className="w-full overflow-hidden rounded-[10px] border border-black/10 bg-white"
      style={themeVars(site)}
    >
      <DemoHeader site={site} compact={compact} />
      <DemoHeroBand site={site} compact={compact} />

      <div className={compact ? "px-4 py-5" : "px-4 py-6 md:px-6 md:py-8"}>
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">
          Nos prestations
        </p>
        <div
          className={`mt-3 grid gap-3 ${compact ? "grid-cols-1" : `grid-cols-1 ${SERVICE_COLUMNS[Math.min(site.services.length, 3)]}`}`}
        >
          {(compact ? site.services.slice(0, 2) : site.services).map((service) => (
            <SupordoDemoService key={service.name} service={service} site={site} />
          ))}
        </div>

        {site.projects.length > 0 && (
          <>
            <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">
              Nos réalisations
            </p>
            <div
              className={`mt-3 grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}
            >
              {(compact ? site.projects.slice(0, 1) : site.projects).map((project) => (
                <SupordoDemoProject key={project.title} project={project} site={site} />
              ))}
            </div>
          </>
        )}
      </div>

      <DemoFooter site={site} />
    </div>
  );
}
