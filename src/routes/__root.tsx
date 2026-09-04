import { Outlet, Link, useLocation, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TenantProvider, usePreviewTenantSearch, isAdminRoute } from "@/hooks/use-tenant";
import { AuthProvider } from "@/hooks/use-auth";
import { FloatingCTA } from "@/components/public/FloatingCTA";
import { TenantTheme } from "@/components/TenantTheme";
import {
  resolveTenantInputForRoute,
  resolveTenantForSsr,
  fetchPublicSiteSettings,
  type PublicTenant,
  type PublicSiteSettings,
} from "@/lib/tenant";
import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
  tenant: PublicTenant | null;
  settings: PublicSiteSettings | null;
}

function NotFoundComponent() {
  const previewTenant = usePreviewTenantSearch();
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-7xl font-bold text-foreground">404</h1>
        <h2 className="mt-4 text-xl font-semibold text-foreground">Page non trouvée</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          La page que vous cherchez n'existe pas.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            search={previewTenant}
            className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
          >
            Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<RouterContext>()({
  beforeLoad: async ({ location }) => {
    // Resolve the tenant server-side so the SSR HTML (SEO, JSON-LD, social
    // previews) is already correct before hydration — not just once the
    // client re-resolves from window.location. Any failure here (server fn
    // wiring, DB error) falls back silently to { tenant: null, settings:
    // null }, which makes TenantProvider behave exactly like it does today
    // (client-side resolution only). Never let this take the whole route down.
    //
    // /admin and /super-admin never resolve a public tenant here: their
    // "current tenant" comes exclusively from the authenticated session
    // (useAdminTenant), resolved client-side after the session is known.
    // Skipping this entirely for those paths guarantees no other tenant's
    // data is ever present in their SSR HTML.
    //
    // /login, /forgot-password, /update-password and /accept-invite get the
    // same exemption: all four are platform Auth surfaces — none of them
    // may ever resolve a client tenant by Host, even though none currently
    // reads the loader's tenant/settings. Authentication belongs to the
    // SUPORDO platform, never to an artisan's public site: redirect_to for
    // both the invite and the reset email is built from getPlatformOrigin()
    // (src/lib/platform-url.ts), the single shared source of truth — never
    // from a tenant's own domain.
    //
    // IMPORTANT: this check uses the router's own `location.pathname`, not
    // a pathname read inside getTenantResolutionInput() via getRequestUrl().
    // A createServerFn is invoked over its own dedicated /_serverFn/<hash>
    // RPC request whenever this beforeLoad re-runs client-side (e.g. the
    // /login → /admin/settings redirect after sign-in) — getRequestUrl()
    // inside that handler then reflects the RPC endpoint's own URL, not the
    // page being navigated to, so pathname read that way is unreliable.
    // location.pathname comes from the router itself and is correct in
    // both the SSR and client-navigation case.
    if (
      location.pathname.startsWith("/admin") ||
      location.pathname.startsWith("/super-admin") ||
      location.pathname === "/login" ||
      location.pathname === "/forgot-password" ||
      location.pathname === "/update-password" ||
      location.pathname === "/accept-invite"
    ) {
      return { tenant: null, settings: null };
    }
    try {
      const input = await resolveTenantInputForRoute();
      const tenant = await resolveTenantForSsr(input);
      if (!tenant) return { tenant: null, settings: null };
      const settings = await fetchPublicSiteSettings(tenant.id).catch(() => null);
      return { tenant, settings };
    } catch {
      return { tenant: null, settings: null };
    }
  },
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { name: "twitter:card", content: "summary" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient, tenant, settings } = Route.useRouteContext();
  const location = useLocation();
  // TenantTheme (global :root color/font override) and FloatingCTA (phone
  // number + link out to /contact) belong to the public site only — never
  // render them on /admin or /super-admin, on top of not resolving any
  // tenant data there in the first place (see TenantProvider).
  const onAdminRoute = isAdminRoute(location.pathname);
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider initialTenant={tenant} initialSettings={settings}>
          {!onAdminRoute && <TenantTheme />}
          <Outlet />
          {!onAdminRoute && <FloatingCTA />}
          <Toaster position="top-right" richColors />
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
