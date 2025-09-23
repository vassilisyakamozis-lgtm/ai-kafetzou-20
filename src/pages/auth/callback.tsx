// src/pages/auth/callback.tsx
import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function AuthCallback() {
  const nav = useNavigate();
  const [msg, setMsg] = useState("Ολοκλήρωση σύνδεσης...");

  useEffect(() => {
    (async () => {
      try {
        const url = new URL(window.location.href);
        const next = url.searchParams.get("next") || "/cup";
        const { data, error } = await supabase.auth.exchangeCodeForSession(url);
        if (error) throw error;

        if (data.session) {
          setMsg("Επιτυχής σύνδεση. Μεταφορά...");
          nav(next, { replace: true });
          return;
        }

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
  }, [nav]);

  return <div className="max-w-md mx-auto p-6 text-center text-sm">{msg}</div>;
}
