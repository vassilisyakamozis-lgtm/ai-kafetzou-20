import { useCallback, useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

export default function Auth() {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const redirect = params.get("redirect") || "/cup";

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(redirect, { replace: true });
    });
  }, [navigate, redirect]);

  const signInWithGoogle = useCallback(async () => {
    setBusy(true);
    const site = import.meta.env.VITE_SITE_URL || window.location.origin;
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${site}/auth?redirect=${encodeURIComponent(redirect)}`,
        queryParams: { prompt: "consent", access_type: "offline" },
      },
    });
    setBusy(false);
  }, [redirect]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
  }, []);

  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (session) navigate(redirect, { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, redirect]);

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-2xl font-bold mb-4">Σύνδεση / Εγγραφή</h1>
      <button
        onClick={signInWithGoogle}
        disabled={busy}
        className="w-full rounded-xl border px-4 py-3"
      >
        {busy ? "Σύνδεση..." : "Συνέχεια με Google"}
      </button>
      <button onClick={signOut} className="mt-3 text-sm underline">
        Αποσύνδεση
      </button>
    </div>
  );
}
