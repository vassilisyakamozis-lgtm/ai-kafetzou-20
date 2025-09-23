// src/hooks/AuthRedirectGuard.tsx
import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

const PROTECTED_PREFIXES = ["/cup", "/my-readings", "/reading"];

export default function AuthRedirectGuard() {
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const needsAuth = PROTECTED_PREFIXES.some((p) => loc.pathname.startsWith(p));

      if (!session && needsAuth) {
        const next = encodeURIComponent(loc.pathname + loc.search);
        nav(`/auth?next=${next}`, { replace: true });
      }
    };

    check();

    const { data: sub } = supabase.auth.onAuthStateChange(() => {
      if (!mounted) return;
      check();
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [loc.pathname, loc.search, nav]);

  return null;
}
