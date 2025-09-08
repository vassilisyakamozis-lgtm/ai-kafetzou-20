// src/hooks/useAuth.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import type { Session, User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

console.log("[SAFE_AUTH_HOOK_ACTIVE] useAuth.tsx loaded");

type AuthCtx = {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signInWithOtp: (email: string) => Promise<{ error: Error | null }>;
  signOut: () => Promise<{ error: Error | null }>;
};

// ---- Singleton Context (μοιράζεται ακόμα κι αν γίνει διπλό import με διαφορετικό path)
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

/** Ασφαλές hook: ποτέ throw. Αν λείπει Provider, γυρνά defaults + warning (για να μην κρασάρει η app). */
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
