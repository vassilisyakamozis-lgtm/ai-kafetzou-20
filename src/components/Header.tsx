import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

export default function Header() {
  const [user, setUser] = useState<User | null>(null);
  const loc = useLocation();
  const nav = useNavigate();

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setUser(data.user ?? null));
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  const goAuth = () => {
    const redirect = encodeURIComponent(loc.pathname + loc.search);
    nav(`/auth?redirect=${redirect}`);
  };

  const signOut = async () => {
    await supabase.auth.signOut();
    nav("/");
  };

  return (
    <header className="w-full sticky top-0 z-40 bg-white/70 backdrop-blur border-b">
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold">AI Kafetzou</Link>
        <nav className="flex items-center gap-3">
          <Link to="/cup" className="px-3 py-2 rounded-xl border">Σελίδα Ανάγνωσης</Link>
          {user ? (
            <>
              <span className="text-sm opacity-70 hidden sm:inline">
                {user.email}
              </span>
              <button onClick={signOut} className="px-3 py-2 rounded-xl border">
                Αποσύνδεση
              </button>
            </>
          ) : (
            <button onClick={goAuth} className="px-3 py-2 rounded-xl border">
              Σύνδεση / Εγγραφή
            </button>
          )}
        </nav>
      </div>
    </header>
  );
}
