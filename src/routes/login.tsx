import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, type FormEvent, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { resolveLoginRedirect } from "@/lib/access-guard";
import { AccessDenied } from "@/components/AccessDenied";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/login")({
  validateSearch: (search: Record<string, unknown>) => ({
    redirect: (search.redirect as string) || "",
  }),
  head: () => ({
    meta: [
      { title: "Connexion" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const { signIn, isAuthenticated, role, tenantId, isLoading } = useAuth();
  const navigate = useNavigate();
  const search = Route.useSearch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const decision = isLoading
    ? ({ kind: "wait" } as const)
    : resolveLoginRedirect({ isAuthenticated, role, tenantId, requestedRedirect: search.redirect });

  // Redirect once authenticated and role is known. `target` is a
  // pathname+search string, so it must be split back into `to`/`search` --
  // passing "?tab=rdv" embedded in `to` would not be parsed as query params
  // by the router. A role with no valid destination (denied-*) never
  // navigates -- see the AccessDenied render below instead.
  useEffect(() => {
    if (decision.kind !== "navigate") return;
    const [path, queryString] = decision.target.split("?");
    navigate({
      to: path,
      search: queryString ? Object.fromEntries(new URLSearchParams(queryString)) : undefined,
    });
  }, [decision, navigate]);

  if (decision.kind === "denied-no-tenant") {
    return (
      <AccessDenied
        title="Compte non rattaché"
        description="Ce compte n'est rattaché à aucune entreprise. Contactez votre agence."
      />
    );
  }
  if (decision.kind === "denied-role") {
    return (
      <AccessDenied
        title="Accès non autorisé"
        description="Votre compte ne dispose d'aucun rôle valide. Contactez votre agence."
      />
    );
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await signIn(email, password);
      toast.success("Connexion réussie");
    } catch (err) {
      const message = err instanceof Error ? err.message : "Erreur de connexion";
      toast.error(message === "Invalid login credentials" ? "Email ou mot de passe incorrect" : message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Accédez à votre espace d'administration</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Mot de passe</Label>
                <Link to="/forgot-password" className="text-xs text-muted-foreground hover:text-foreground">
                  Mot de passe oublié ?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                disabled={submitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Se connecter
            </Button>
            <div className="text-center text-sm text-muted-foreground">
              <Link to="/" className="hover:text-foreground">← Retour au site</Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
