import { useNavigate } from "@tanstack/react-router";
import { ShieldAlert } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";

/**
 * Terminal state for an authenticated session whose role/tenant doesn't
 * grant access to the space it's in. Never navigates anywhere on its own —
 * the only way out is signing out, which is what the guards this replaces
 * used to loop on trying to reach via /login.
 */
export function AccessDenied({ title, description }: { title: string; description: string }) {
  const { signOut } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-4 text-center">
      <ShieldAlert className="h-10 w-10 text-muted-foreground" aria-hidden="true" />
      <div className="space-y-1.5">
        <h1 className="text-lg font-semibold text-foreground">{title}</h1>
        <p className="max-w-sm text-sm text-muted-foreground">{description}</p>
      </div>
      <Button
        variant="outline"
        onClick={() => signOut().then(() => navigate({ to: "/login", search: { redirect: "" } }))}
      >
        Se déconnecter
      </Button>
    </div>
  );
}
