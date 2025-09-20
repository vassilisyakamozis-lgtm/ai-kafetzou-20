import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export default function ProtectedRoute({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState(false);

  useEffect(() => {
    let mounted = true;

    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      setIsAuthed(!!data.session?.user);
      setLoading(false);
    });

    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!mounted) return;
      setIsAuthed(!!session?.user);
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (loading) return null;

  // Δεν έχεις ξεχωριστή /auth σελίδα στο router σου, άρα στέλνουμε στην αρχική
  return isAuthed ? children : <Navigate to="/" replace />;
}
