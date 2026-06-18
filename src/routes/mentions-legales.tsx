import { createFileRoute } from "@tanstack/react-router";
import { useTenant } from "@/hooks/use-tenant";
import { PublicHeader } from "@/components/public/PublicHeader";
import { PublicFooter } from "@/components/public/PublicFooter";

export const Route = createFileRoute("/mentions-legales")({
  head: () => ({
    meta: [
      { title: "Mentions légales" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MentionsLegalesPage,
});

function MentionsLegalesPage() {
  const { tenant } = useTenant();

  return (
    <div className="flex min-h-screen flex-col">
      <PublicHeader />
      <main className="flex-1 py-16">
        <div className="mx-auto max-w-3xl px-4 prose prose-sm">
          <h1>Mentions légales</h1>
          {tenant && (
            <>
              <h2>Éditeur du site</h2>
              <p>
                {tenant.company_name}
                {tenant.address && <><br />{tenant.address}</>}
                {tenant.city && <><br />{tenant.city}</>}
                {tenant.siret && <><br />SIRET : {tenant.siret}</>}
              </p>
              {(tenant.phone || tenant.email) && (
                <>
                  <h2>Contact</h2>
                  <p>
                    {tenant.phone && <>Tél : {tenant.phone}<br /></>}
                    {tenant.email && <>Email : {tenant.email}</>}
                  </p>
                </>
              )}
            </>
          )}
          <h2>Hébergement</h2>
          <p>Ce site est hébergé par Supabase et Cloudflare.</p>
        </div>
      </main>
      <PublicFooter />
    </div>
  );
}
