import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check } from "lucide-react";

export type TenantCreatedRecapTenant = {
  id: string;
  company_name: string;
  slug: string;
  domain?: string | null;
};

type Props = {
  tenant: TenantCreatedRecapTenant;
  onOpenTenant: () => void;
  onBackToList: () => void;
};

const checklist = [
  "Compte Auth créé (Supabase Dashboard)",
  "Ligne dans tenant_members reliant l'utilisateur au tenant",
  "Rôle tenant_admin attribué",
  "Accès envoyés à l'artisan (email + mot de passe temporaire)",
];

export function TenantCreatedRecap({ tenant, onOpenTenant, onBackToList }: Props) {
  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const hasDomain = !!tenant.domain?.trim();
  const siteUrl = hasDomain ? `https://${tenant.domain}` : `${origin}/?tenant=${tenant.slug}`;
  const siteLabel = hasDomain ? "URL du site" : "URL de prévisualisation";
  const loginUrl = `${origin}/login`;

  return (
    <Card className="border-green-500/40 bg-green-500/5">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-green-700 dark:text-green-400">
          <Check className="h-5 w-5" />
          {tenant.company_name}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-[160px_1fr] gap-y-2 text-sm">
          <span className="text-muted-foreground">Entreprise</span>
          <span className="font-medium">{tenant.company_name}</span>
          <span className="text-muted-foreground">Slug</span>
          <span className="font-mono text-xs">{tenant.slug}</span>
          <span className="text-muted-foreground">{siteLabel}</span>
          <a href={siteUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{siteUrl}</a>
          <span className="text-muted-foreground">URL de connexion</span>
          <a href={loginUrl} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline break-all">{loginUrl}</a>
          <span className="text-muted-foreground">État du compte</span>
          <span className="text-amber-700 dark:text-amber-400">À configurer manuellement</span>
        </div>

        <div className="border-t border-border pt-4">
          <p className="text-sm font-medium mb-2">Checklist administrateur</p>
          <ul className="space-y-1.5 text-sm">
            {checklist.map((label, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="mt-0.5 inline-flex h-4 w-4 shrink-0 items-center justify-center rounded border border-muted-foreground/40 text-muted-foreground">☐</span>
                <span>{label}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-muted-foreground">
            Ces étapes ne sont pas encore automatisées : effectuez-les manuellement avant de transmettre les accès à l'artisan.
          </p>
        </div>

        <div className="flex flex-wrap gap-2 pt-2">
          <Button onClick={onOpenTenant}>Ouvrir la fiche client</Button>
          <Button variant="outline" onClick={onBackToList}>Retour à la liste</Button>
        </div>
      </CardContent>
    </Card>
  );
}
