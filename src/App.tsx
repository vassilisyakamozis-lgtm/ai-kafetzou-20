import { useEffect, useState } from "react";
import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";

// Pages
import Home from "@/pages/Home";           // η αρχική
import Auth from "@/pages/Auth";           // login/register
import Cup from "@/pages/Cup";             // φόρμα/κουμπί "Ξεκίνα την ανάγνωση"
import ReadingResult from "@/pages/ReadingResult"; // /reading/:id

function RequireAuth({ children }: { children: JSX.Element }) {
  const [loading, setLoading] = useState(true);
  const [isAuthed, setIsAuthed] = useState<boolean>(false);
  const location = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setIsAuthed(!!data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setIsAuthed(!!session);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (loading) return null;
  if (!isAuthed) {
    // κρατάμε target για επιστροφή μετά το login
    const to = `/auth?redirect=${encodeURIComponent(location.pathname + location.search)}`;
    return <Navigate to={to} replace />;
  }
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/auth" element={<Auth />} />
      <Route
        path="/cup"
        element={
          <RequireAuth>
            <Cup />
          </RequireAuth>
        }
      />
      <Route
        path="/reading/:id"
        element={
          <RequireAuth>
            <ReadingResult />
          </RequireAuth>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
