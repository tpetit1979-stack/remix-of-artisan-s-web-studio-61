import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

export const Route = createFileRoute("/accept-invite")({
  head: () => ({
    meta: [
      { title: "Bienvenue" },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AcceptInvitePage,
});

function AcceptInvitePage() {
  const navigate = useNavigate();
  const readyRef = useRef(false);
  const [ready, setReady] = useState(false);
  const [expired, setExpired] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // This route is only ever reached via the redirect_to passed to
  // inviteUserByEmail() (see inviteTenantAdmin in tenant-provisioning.ts) —
  // resetPasswordForEmail() always redirects to /update-password instead.
  // So SIGNED_IN here is unambiguous by construction (the destination, not
  // the event, carries the meaning) — no need to inspect the URL's `type`
  // param, which the SDK clears before app code can reliably read it.
  //
  // SIGNED_IN alone isn't enough, though: the SDK fires it via setTimeout(0)
  // from inside its own _initialize() (verified in the installed
  // @supabase/auth-js source), which can resolve before OR after this
  // effect subscribes — there is no ordering guarantee. If SIGNED_IN fires
  // first, it's lost (onAuthStateChange doesn't replay past events). The
  // fallback is INITIAL_SESSION: the SDK emits it once, unconditionally, to
  // every new subscription (_emitInitialSession), always AFTER its init
  // chain (including saving any URL-detected session) has finished — so a
  // non-null session there reliably reflects the invite session even when
  // SIGNED_IN was missed. A null session there means no session ever
  // existed (an actually invalid/expired link), correctly left to the
  // timeout below. The readyRef guard prevents a redundant second update if
  // both events end up firing.
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (readyRef.current) return;
      if (event === "SIGNED_IN" || (event === "INITIAL_SESSION" && session)) {
        readyRef.current = true;
        setReady(true);
      }
    });
    const timeout = setTimeout(() => {
      if (!readyRef.current) setExpired(true);
    }, 8000);
    return () => {
      subscription.unsubscribe();
      clearTimeout(timeout);
    };
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      toast.error("Le mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas.");
      return;
    }
    setSubmitting(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      toast.success("Compte activé.");
      navigate({ to: "/login", search: { redirect: "" } });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Erreur lors de la mise à jour.");
    } finally {
      setSubmitting(false);
    }
  };

  if (expired) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Lien invalide ou expiré</CardTitle>
            <CardDescription>Contactez votre agence pour recevoir une nouvelle invitation.</CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  if (!ready) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Bienvenue</CardTitle>
          <CardDescription>Choisissez un mot de passe pour activer votre compte.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="password">Mot de passe</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                disabled={submitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm">Confirmer le mot de passe</Label>
              <Input
                id="confirm"
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                required
                autoComplete="new-password"
                disabled={submitting}
              />
            </div>
            <Button type="submit" className="w-full" disabled={submitting}>
              {submitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Activer mon compte
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
