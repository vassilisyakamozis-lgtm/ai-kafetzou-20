import { useEffect, useState } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const location = useLocation();
  const [ready, setReady] = useState(false);
  const [authed, setAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setAuthed(!!data.session);
      setReady(true);
    });
    return () => {
      mounted = false;
    };
  }, []);

  if (!ready) return null; // μπορείς να βάλεις skeleton αν θες

  if (!authed) {
    localStorage.setItem("returnTo", location.pathname + location.search);
    return <Navigate to="/auth" replace />;
  }

  return children;
}