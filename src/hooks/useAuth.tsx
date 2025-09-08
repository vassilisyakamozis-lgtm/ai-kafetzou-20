// src/hooks/useAuth.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

console.log("[SAFE_AUTH_HOOK_ACTIVE] useAuth.tsx loaded"); // <-- ΣΗΜΑ

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
};

// ---- Singleton Context via globalThis (για να μην δημιουργούνται ΔΥΟ διαφορετικά contexts)
const AUTH_CTX_KEY = "__AIKAF_AUTH_CTX__";
const existing = (globalThis as any)[AUTH_CTX_KEY] as React.Context<AuthCtx | undefined> | undefined;
const AuthContext =
  existing ?? ((globalThis as any)[AUTH_CTX_KEY] = createContext<AuthCtx | undefined>(undefined));

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log("[AuthProvider] mounted");
    let mounted = true;

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!mounted) return;
      setSession(session ?? null);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session ?? null);
      setUser(session?.user ?? null);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const signInWithOtp = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({ email });
    return { error: (error as unknown as Error) ?? null };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error: (error as unknown as Error) ?? null };
  };

  return (
    <AuthContext.Provider value={{ user, session, loading, signInWithOtp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};

/** ΠΟΤΕ δεν πετάει exception — αν λείπει Provider, επιστρέφει ασφαλή defaults και warning. */
export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    console.warn("useAuth called outside AuthProvider — using safe defaults");
    return {
      user: null,
      session: null,
      loading: false,
      signInWithOtp: async () => ({ error: new Error("No AuthProvider") }),
      signOut: async () => ({ error: null }),
    } as const;
  }
  return ctx;
};
