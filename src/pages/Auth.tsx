import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Auth() {
  const nav = useNavigate();

  const [tab, setTab] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  // Αν υπάρχει ήδη session, γύρνα στο returnTo ή /
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) {
        const ret = localStorage.getItem("returnTo") || "/";
        localStorage.removeItem("returnTo");
        nav(ret, { replace: true });
      }
    });
  }, [nav]);

  const done = () => {
    const ret = localStorage.getItem("returnTo") || "/";
    localStorage.removeItem("returnTo");
    nav(ret, { replace: true });
  };

  const signIn = async () => {
    try {
      setErr(null);
      setBusy(true);
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      done();
    } catch (e: any) {
      setErr(e.message || "Αποτυχία σύνδεσης");
    } finally {
      setBusy(false);
    }
  };

  const signUp = async () => {
    try {
      setErr(null);
      setBusy(true);
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) throw error;
      done(); // ή άφησέ τον στη σελίδα αν θέλεις email confirmation
    } catch (e: any) {
      setErr(e.message || "Αποτυχία εγγραφής");
    } finally {
      setBusy(false);
    }
  };

  const google = async () => {
    try {
      setErr(null);
      setBusy(true);
      // ⚠️ Άνοιξε το site σε NEW TAB / published domain (όχι iframe), αλλιώς Google κόβει το popup.
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo: window.location.origin + "/auth/callback" },
      });
      if (error) throw error;
    } catch (e: any) {
      setErr(e.message || "Αποτυχία Google OAuth");
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <h1 className="text-2xl font-semibold mb-6 text-center">Καφετζούδικο</h1>

      <div className="flex gap-2 justify-center mb-6">
        <button
          onClick={() => setTab("signin")}
          className={`px-4 py-2 rounded-lg border ${tab === "signin" ? "bg-black text-white" : ""}`}
        >
          Σύνδεση
        </button>
        <button
          onClick={() => setTab("signup")}
          className={`px-4 py-2 rounded-lg border ${tab === "signup" ? "bg-black text-white" : ""}`}
        >
          Εγγραφή
        </button>
      </div>

      <label className="block text-sm mb-1">Email</label>
      <input
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-3"
        placeholder="you@email.com"
      />
      <label className="block text-sm mb-1">Κωδικός</label>
      <input
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full border rounded-lg px-3 py-2 mb-4"
        placeholder="••••••••"
      />

      {err && <p className="text-red-600 text-sm mb-3">{err}</p>}

      <div className="flex gap-2">
        {tab === "signin" ? (
          <button
            onClick={signIn}
            disabled={busy}
            className="flex-1 rounded-lg px-4 py-2 bg-black text-white disabled:opacity-40"
          >
            Σύνδεση
          </button>
        ) : (
          <button
            onClick={signUp}
            disabled={busy}
            className="flex-1 rounded-lg px-4 py-2 bg-black text-white disabled:opacity-40"
          >
            Εγγραφή
          </button>
        )}

        <button
          type="button"
          onClick={google}
          disabled={busy}
          className="flex-1 rounded-lg px-4 py-2 border hover:bg-gray-50 disabled:opacity-40"
        >
          Συνέχεια με Google
        </button>
      </div>
    </div>
  );
}
