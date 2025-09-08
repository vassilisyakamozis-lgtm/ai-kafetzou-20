import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "./auth";

export default function ProtectedRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null; // δείξε το υπάρχον skeleton/loader σου, αν έχεις
  if (!user) return <Navigate to={`/auth?next=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <Outlet />;
}