import { createContext, useContext, useEffect, useState } from "react";
import { Session, User } from "@supabase/supabase-js";
import { supabase } from "../lib/supabase";

type Ctx = { user: User|null; session: Session|null; loading: boolean; signOut: () => Promise<void> };
const AuthCtx = createContext<Ctx>({ user: null, session: null, loading: true, signOut: async () => {} });
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<Omit<Ctx,"signOut">>({ user: null, session: null, loading: true });

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setState({ user: data.session?.user ?? null, session: data.session ?? null, loading: false });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setState({ user: session?.user ?? null, session: session ?? null, loading: false });
    });
    return () => { mounted = false; sub.subscription.unsubscribe(); };
  }, []);

  async function signOut() {
    await supabase.auth.signOut();
  }
  return <AuthCtx.Provider value={{ ...state, signOut }}>{children}</AuthCtx.Provider>;
}