import { Outlet, Link, createRootRouteWithContext, HeadContent, Scripts } from "@tanstack/react-router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import { TenantProvider } from "@/hooks/use-tenant";
import { AuthProvider } from "@/hooks/use-auth";
import { FloatingCTA } from "@/components/public/FloatingCTA";
import { TenantTheme } from "@/components/TenantTheme";
import {
  getTenantResolutionInput,
  resolveTenantForSsr,
  fetchSiteSettings,
  type Tenant,
  type SiteSettings,
} from "@/lib/tenant";
import appCss from "../styles.css?url";

interface RouterContext {
  queryClient: QueryClient;
  tenant: Tenant | null;
  settings: SiteSettings | null;
}

function NotFoundComponent() {
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
  beforeLoad: async () => {
    // Resolve the tenant server-side so the SSR HTML (SEO, JSON-LD, social
    // previews) is already correct before hydration — not just once the
    // client re-resolves from window.location. Any failure here (server fn
    // wiring, DB error) falls back silently to { tenant: null, settings:
    // null }, which makes TenantProvider behave exactly like it does today
    // (client-side resolution only). Never let this take the whole route down.
    try {
      const input = await getTenantResolutionInput();
      const tenant = await resolveTenantForSsr(input);
      if (!tenant) return { tenant: null, settings: null };
      const settings = await fetchSiteSettings(tenant.id).catch(() => null);
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
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TenantProvider initialTenant={tenant} initialSettings={settings}>
          <TenantTheme />
          <Outlet />
          <FloatingCTA />
          <Toaster position="top-right" richColors />
        </TenantProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
