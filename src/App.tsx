import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "@/pages/Home";
import Cup from "@/pages/Cup";
import MyReadings from "@/pages/MyReadings";
import AuthCallback from "@/pages/auth/callback";
import ReadingStartPage from "@/pages/reading/Start";
import ReadingDetail from "@/pages/reading/Detail";
import AuthRedirectGuard from "@/hooks/AuthRedirectGuard";

import ProtectedRoute from "@/components/ProtectedRoute";

export default function App() {
  return (
    <BrowserRouter>
      {/* Παραμένει όπως το έχεις */}
      <AuthRedirectGuard />

      <Routes>
        <Route path="/" element={<Home />} />

        {/* Προστατευμένες διαδρομές */}
        <Route
          path="/cup"
          element={
            <ProtectedRoute>
              <Cup />
            </ProtectedRoute>
          }
        />
        <Route
          path="/my-readings"
          element={
            <ProtectedRoute>
              <MyReadings />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reading/start"
          element={
            <ProtectedRoute>
              <ReadingStartPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/reading/:id"
          element={
            <ProtectedRoute>
              <ReadingDetail />
            </ProtectedRoute>
          }
        />

        {/* OAuth callback του Supabase/Google */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

