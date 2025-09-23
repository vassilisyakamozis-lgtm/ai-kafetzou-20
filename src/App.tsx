// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "@/pages/Home";
import Cup from "@/pages/Cup";
import MyReadings from "@/pages/MyReadings";
import AuthPage from "@/pages/auth/AuthPage";
import AuthCallback from "@/pages/auth/callback";
import ReadingStartPage from "@/pages/reading/Start"; // αν το χρησιμοποιείς
import CupReadingResult from "@/pages/CupReadingResult";
import AuthRedirectGuard from "@/hooks/AuthRedirectGuard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthRedirectGuard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Προστατευμένες διαδρομές */}
        <Route path="/cup" element={<Cup />} />
        <Route path="/my-readings" element={<MyReadings />} />
        <Route path="/reading/start" element={<ReadingStartPage />} />
        <Route path="/reading/:id" element={<CupReadingResult />} />

        {/* catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
