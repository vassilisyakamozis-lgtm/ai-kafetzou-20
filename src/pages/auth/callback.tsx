// src/pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const nav = useNavigate();
  const loc = useLocation();
  const [msg, setMsg] = useState("Ολοκλήρωση σύνδεσης...");

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const next = url.searchParams.get("next") || "/cup";

        // PKCE / OAuth code exchange
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) throw error;

        if (data.session) {
          setMsg("Επιτυχής σύνδεση. Μεταφορά...");
          nav(next, { replace: true });
          return;
        }

        // Αν δεν είναι OAuth, δοκίμασε να πάρεις υπάρχουσα session (π.χ. magic link)
        const { data: s } = await supabase.auth.getSession();
        if (s.session) {
          nav(next, { replace: true });
          return;
        }

        setMsg("Δεν βρέθηκε session.");
        setTimeout(() => nav("/auth", { replace: true }), 1200);
      } catch (e: any) {
        setMsg(e?.message || "Αποτυχία ολοκλήρωσης σύνδεσης.");
        setTimeout(() => nav("/auth", { replace: true }), 1500);
      }
    })();
  }, [nav, loc.search]);

  return <div className="max-w-md mx-auto p-6 text-center text-sm">{msg}</div>;
}
