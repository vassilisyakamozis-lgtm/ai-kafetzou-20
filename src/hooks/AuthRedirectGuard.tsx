import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";

/**
 * Αφήνουμε πάντα ανοιχτές τις:
 *  - /, /cup  (δημιουργία νέου reading)
 *  - /auth, /auth/callback  (ροή σύνδεσης)
 * Όλα τα υπόλοιπα θεωρούνται προστατευμένα (π.χ. /my-readings, /reading/:id).
 */
const OPEN_ROUTES = ["/", "/cup", "/auth", "/auth/callback"];

export default function AuthRedirectGuard() {
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;

    const check = async () => {
      const { data } = await supabase.auth.getSession();
      const session = data.session;
      const path = location.pathname;

      const isOpen = OPEN_ROUTES.some(
        (r) => path === r || path.startsWith(r + "/")
      );

      // 1) Είμαστε στη /auth (ή /auth/callback):
      //    - Αν έχουμε session, πάμε στο returnTo ή /
      //    - Αν δεν έχουμε, δεν κάνουμε τίποτα (μένουμε στη σελίδα)
      if (path.startsWith("/auth")) {
        if (session) {
          const ret = localStorage.getItem("returnTo") || "/";
          localStorage.removeItem("returnTo");
          if (mounted) navigate(ret, { replace: true });
        }
        return;
      }

      // 2) Ανοιχτές διαδρομές: δεν αγγίζουμε
      if (isOpen) return;

      // 3) Προστατευμένες σελίδες χωρίς session -> πάμε /auth
      if (!session) {
        localStorage.setItem("returnTo", path + location.search);
        if (mounted) navigate("/auth", { replace: true });
      }
    };

    check();

    // Αν αλλάξει session ενώ είμαστε στο /auth, κάνε returnTo
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => {
      if (!mounted) return;
      if (location.pathname.startsWith("/auth") && s) {
        const ret = localStorage.getItem("returnTo") || "/";
        localStorage.removeItem("returnTo");
        navigate(ret, { replace: true });
      }
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [location.pathname, location.search, navigate]);

  return null;
}
