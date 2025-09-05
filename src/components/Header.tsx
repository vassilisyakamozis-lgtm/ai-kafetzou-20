import { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function Header() {
  const [email, setEmail] = useState<string | null>(null);
  const nav = useNavigate();
  const loc = useLocation();

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setEmail(data.session?.user?.email ?? null);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setEmail(session?.user?.email ?? null);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  const goAuth = () => {
    localStorage.setItem("returnTo", loc.pathname + loc.search);
    nav("/auth");
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    nav("/");
  };

  return (
    <header className="w-full border-b bg-white/70 backdrop-blur sticky top-0 z-50">
      <div className="mx-auto max-w-6xl px-4 h-14 flex items-center justify-between">
        <Link to="/" className="font-bold">
          ΑΙ Καφετζού
        </Link>

        <nav className="flex items-center gap-3">
          <Link to="/cup" className="hover:underline">
            Ανάγνωση
          </Link>
          <Link to="/my-readings" className="hover:underline">
            Τα Χρησμολόγιά μου
          </Link>

          {!email ? (
            <button
              onClick={goAuth}
              className="ml-2 rounded-lg px-3 py-1.5 bg-black text-white hover:opacity-90"
            >
              Σύνδεση / Εγγραφή
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <span className="text-sm opacity-75 hidden sm:inline">{email}</span>
              <button
                onClick={signOut}
                className="rounded-lg px-3 py-1.5 border hover:bg-gray-50"
              >
                Αποσύνδεση
              </button>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
