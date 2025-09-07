import { Routes, Route, Navigate } from "react-router-dom";

import Header from "@/components/Header";
import ProtectedRoute from "@/components/ProtectedRoute";

import Home from "@/pages/Home";
import Cup from "@/pages/Cup";
import MyReadings from "@/pages/MyReadings";
import ReadingStartPage from "@/pages/reading/Start";
import ReadingDetail from "@/pages/reading/Detail";
import Auth from "@/pages/Auth";
import AuthCallback from "@/pages/auth/callback";

export default function App() {
  return (
    <>
      <Header />
      <Routes>
        {/* Ανοιχτές σελίδες */}
        <Route path="/" element={<Home />} />
        <Route path="/cup" element={<Cup />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Προστατευμένες σελίδες */}
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

        
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
