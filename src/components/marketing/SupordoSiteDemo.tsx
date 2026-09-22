import {
  SUPORDO_DEMO_SITE,
  type DemoProject,
  type DemoService,
} from "@/data/marketing/supordo-demo-site";

/**
 * Représentation d'un site artisan préparé avec SUPORDO — entièrement fictive.
 *
 * Elle est construite en HTML/CSS plutôt qu'en capture d'écran : plus légère,
 * nette à tous les zooms, et surtout modifiable en un seul endroit le jour où
 * un vrai site client autorisé la remplacera.
 *
 * Direction graphique volontairement distincte de la landing SUPORDO — barre
 * supérieure sombre avec numéro de téléphone, titre en surimpression d'une
 * photo, prestations en cartes photo, bouton de devis arrondi. Sans cela, le
 * visiteur croit regarder un composant SUPORDO de plus au lieu du site de
 * l'artisan. Les tokens restent ceux du projet : aucune couleur nouvelle.
 *
 * Aucune donnée réelle, aucun client, aucun témoignage, aucun chiffre. Les
 * composants appelants affichent l'étiquette « Démonstration SUPORDO ».
 */
const site = SUPORDO_DEMO_SITE;

/** Barre supérieure du site fictif : identité, navigation, téléphone. */
function DemoHeader({ compact = false }: { compact?: boolean }) {
  return (
    <div className="flex items-center justify-between gap-3 bg-[var(--supordo-forest-dark)] px-4 py-3 md:px-6">
      <div className="min-w-0">
        <p className="truncate text-[13px] font-bold tracking-[0.02em] text-white md:text-[15px]">
          {site.companyName}
        </p>
        <p className="truncate text-[9px] uppercase tracking-[0.12em] text-white/50 md:text-[10px]">
          {site.trade}
        </p>
      </div>
      {compact ? (
        <span className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[10px] font-semibold text-white">
          {site.phone}
        </span>
      ) : (
        <div className="flex items-center gap-4">
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
          <span className="shrink-0 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-white">
            {site.phone}
          </span>
        </div>
      )}
    </div>
  );
}

/** Bandeau d'accueil : photo, titre en surimpression, bouton de devis. */
function DemoHeroBand({ compact = false }: { compact?: boolean }) {
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
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-black/10" />
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
        <p
          className={`font-bold leading-tight text-white ${compact ? "text-[15px]" : "text-[17px] md:text-[22px]"}`}
        >
          {site.tagline}
        </p>
        <p className="mt-1 text-[11px] text-white/70">{site.city} et alentours</p>
        <span className="mt-3 inline-flex rounded-full bg-[var(--supordo-green)] px-4 py-2 text-[11px] font-semibold text-white">
          Demander un devis
        </span>
      </div>
    </div>
  );
}

/** Une prestation telle qu'elle apparaît sur le site public. */
export function SupordoDemoService({
  service = site.services[0]!,
  size = "md",
}: {
  service?: DemoService;
  size?: "md" | "lg";
}) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-black/10 bg-white">
      <div className={size === "lg" ? "aspect-[16/9]" : "aspect-[4/3]"}>
        <img
          src={service.image}
          alt={service.imageAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className={size === "lg" ? "p-5 md:p-6" : "p-3.5"}>
        <h4
          className={`font-bold leading-snug text-[var(--supordo-forest-dark)] ${
            size === "lg" ? "text-lg md:text-xl" : "text-[13px]"
          }`}
        >
          {service.name}
        </h4>
        <p
          className={`mt-1.5 leading-relaxed text-black/60 ${
            size === "lg" ? "text-sm md:text-base" : "text-[11px]"
          }`}
        >
          {service.description}
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

/** Une réalisation telle qu'elle apparaît sur le site public. */
export function SupordoDemoProject({
  project = site.projects[0]!,
  size = "md",
}: {
  project?: DemoProject;
  size?: "md" | "lg";
}) {
  return (
    <article className="overflow-hidden rounded-[8px] border border-black/10 bg-white">
      <div className={size === "lg" ? "aspect-[16/10]" : "aspect-[4/3]"}>
        <img
          src={project.image}
          alt={project.imageAlt}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      </div>
      <div className={size === "lg" ? "p-5 md:p-6" : "p-3.5"}>
        <h4
          className={`font-bold leading-snug text-[var(--supordo-forest-dark)] ${
            size === "lg" ? "text-lg md:text-xl" : "text-[13px]"
          }`}
        >
          {project.title}
        </h4>
        <p
          className={`mt-1.5 text-black/60 ${size === "lg" ? "text-sm md:text-base" : "text-[11px]"}`}
        >
          {project.city} · {project.service}
        </p>
        <span
          className={`mt-3 inline-flex font-semibold text-[var(--supordo-green)] ${
            size === "lg" ? "text-sm" : "text-[10px]"
          }`}
        >
          Voir la réalisation →
        </span>
      </div>
    </article>
  );
}

/** Bas de page du site fictif : zones d'intervention et coordonnées. */
function DemoFooter() {
  return (
    <div className="border-t border-black/10 bg-[var(--supordo-warm)] px-4 py-4 md:px-6 md:py-5">
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
          <p className="mt-1.5 text-[11px] font-semibold text-[var(--supordo-forest-dark)]">
            {site.phone}
          </p>
          <p className="text-[11px] text-black/60">{site.email}</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Le site fictif entier. `variant="desktop"` pour la représentation large,
 * `variant="mobile"` pour la colonne étroite — c'est le même site, pas deux
 * démonstrations différentes.
 */
export function SupordoSiteDemo({ variant = "desktop" }: { variant?: "desktop" | "mobile" }) {
  const compact = variant === "mobile";
  return (
    <div
      className={`overflow-hidden rounded-[10px] border border-black/10 bg-white shadow-none ${
        compact ? "w-full" : "w-full"
      }`}
    >
      <DemoHeader compact={compact} />
      <DemoHeroBand compact={compact} />

      <div className={compact ? "px-4 py-5" : "px-4 py-6 md:px-6 md:py-8"}>
        <p className="text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">
          Nos prestations
        </p>
        <div
          className={`mt-3 grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-3"}`}
        >
          {(compact ? site.services.slice(0, 2) : site.services).map((service) => (
            <SupordoDemoService key={service.name} service={service} />
          ))}
        </div>

        <p className="mt-6 text-[9px] font-bold uppercase tracking-[0.12em] text-black/45">
          Nos réalisations
        </p>
        <div
          className={`mt-3 grid gap-3 ${compact ? "grid-cols-1" : "grid-cols-1 sm:grid-cols-2"}`}
        >
          {(compact ? site.projects.slice(0, 1) : site.projects).map((project) => (
            <SupordoDemoProject key={project.title} project={project} />
          ))}
        </div>
      </div>

      <DemoFooter />
    </div>
  );
}
