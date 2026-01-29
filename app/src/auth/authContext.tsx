import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { supabase } from "../supabase/client";

export type Role = "client" | "pt";

export type AuthUser = {
  id: string;
  name: string;
  role: Role;
  email?: string;
};

type AuthContextValue = {
  user: AuthUser | null;
  isHydrating: boolean; // mentre ripristina da storage
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
};
const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isHydrating, setIsHydrating] = useState(true);

  async function buildUserFromSupabase(userId: string, email?: string | null) {
    const { data: profile, error } = await supabase
      .from("profiles")
      .select("role, full_name")
      .eq("id", userId)
      .single();

    // Se il profilo non esiste ancora, fallback su client (ma in teoria lo stai creando a mano in SQL)
    const role = (profile?.role as Role) ?? "client";
    const name = profile?.full_name ?? email ?? "Utente";

    if (error) {
      // Non bloccare il login se il profilo non è leggibile per qualche motivo
      return { id: userId, name: email ?? "Utente", role: "client" as Role, email: email ?? undefined };
    }

    return { id: userId, name, role, email: email ?? undefined };
  }

  useEffect(() => {
    let alive = true;

    (async () => {
      try {
        const { data } = await supabase.auth.getSession();
        const session = data.session;

        if (!alive) return;

        if (!session?.user) {
          setUser(null);
          return;
        }

        const u = await buildUserFromSupabase(session.user.id, session.user.email);
        if (!alive) return;
        setUser(u);
      } finally {
        if (alive) setIsHydrating(false);
      }
    })();

    const { data: sub } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (!alive) return;
      setIsHydrating(true);

      try {
        if (!session?.user) {
          setUser(null);
          return;
        }

        const u = await buildUserFromSupabase(session.user.id, session.user.email);
        if (!alive) return;
        setUser(u);
      } finally {
        if (alive) setIsHydrating(false);
      }
    });

    return () => {
      alive = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const login = async (username: string, password: string) => {
    // Per compatibilità: `username` qui è l'email
    const email = username.trim();

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) return false;

    // Lo user verrà popolato dall'onAuthStateChange
    return true;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const value = useMemo(() => ({ user, isHydrating, login, logout }), [user, isHydrating]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}