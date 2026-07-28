import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export type AppRole = "super_admin" | "tenant_admin";

interface AuthState {
  user: User | null;
  session: Session | null;
  role: AppRole | null;
  tenantId: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthState>({
  user: null,
  session: null,
  role: null,
  tenantId: null,
  isLoading: true,
  isAuthenticated: false,
  signIn: async () => {},
  signOut: async () => {},
});

async function fetchRoleAndTenant(userId: string): Promise<{ role: AppRole | null; tenantId: string | null }> {
  const [{ data: roleRow }, { data: memberRow }] = await Promise.all([
    supabase.from("user_roles").select("role").eq("user_id", userId).maybeSingle(),
    supabase.from("tenant_members").select("tenant_id").eq("user_id", userId).maybeSingle(),
  ]);
  return {
    role: (roleRow?.role as AppRole | undefined) ?? null,
    tenantId: memberRow?.tenant_id ?? null,
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [role, setRole] = useState<AppRole | null>(null);
  const [tenantId, setTenantId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Listener FIRST (synchronous state update only)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession);
      if (!newSession) {
        setRole(null);
        setTenantId(null);
        setIsLoading(false);
      } else {
        // isAuthenticated flips true here, before role/tenantId are known —
        // keep isLoading true so route guards don't treat "role not fetched
        // yet" as "access denied" and bounce back to /login mid-sign-in.
        setIsLoading(true);
        // Defer Supabase calls to avoid deadlock inside the callback
        setTimeout(() => {
          fetchRoleAndTenant(newSession.user.id).then(({ role, tenantId }) => {
            setRole(role);
            setTenantId(tenantId);
            setIsLoading(false);
          });
        }, 0);
      }
    });

    // 2. Then check existing session
    supabase.auth.getSession().then(async ({ data: { session: existing } }) => {
      setSession(existing);
      if (existing) {
        const { role, tenantId } = await fetchRoleAndTenant(existing.user.id);
        setRole(role);
        setTenantId(tenantId);
      }
      setIsLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
  };

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider
      value={{
        user: session?.user ?? null,
        session,
        role,
        tenantId,
        isLoading,
        isAuthenticated: !!session,
        signIn,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
