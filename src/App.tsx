import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import IndexPage from "@/pages/Index";
import AuthPage from "@/pages/Auth";
import CupPage from "@/pages/Cup";

const PrivateRoute: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return null; // ή spinner
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
};

const App: React.FC = () => {
  return (
    <Routes>
      <Route path="/" element={<IndexPage />} />
      <Route path="/auth" element={<AuthPage />} />
      <Route
        path="/cup"
        element={
          <PrivateRoute>
            <CupPage />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};

export default App;
