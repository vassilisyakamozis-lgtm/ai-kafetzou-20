import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

export default function AuthCallback() {
  const nav = useNavigate();

  useEffect(() => {
    let mounted = true;
    const go = async () => {
      // Μόλις ολοκληρωθεί το OAuth, η session είναι ήδη αποθηκευμένη.
      const { data } = await supabase.auth.getSession();
      const ret = localStorage.getItem("returnTo") || "/";
      localStorage.removeItem("returnTo");
      if (mounted) nav(ret, { replace: true });
    };
    go();
    return () => {
      mounted = false;
    };
  }, [nav]);

  return (
    <div className="mx-auto max-w-md px-4 py-12">
      <p>Σύνδεση ολοκληρώνεται…</p>
    </div>
  );
}
