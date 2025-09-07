import { Outlet, useLocation, Navigate } from "react-router-dom";
import { useAuth } from "./auth";

export function ProtectedRoute() {
  const { user, loading } = useAuth();
  const loc = useLocation();
  if (loading) return null;
  if (!user) {
    const next = encodeURIComponent(loc.pathname + loc.search);
    return <Navigate to={`/auth?next=${next}`} replace />;
  }
  return <Outlet />;
}
