// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

import Home from "@/pages/Home";
import Cup from "@/pages/Cup";
import MyReadings from "@/pages/MyReadings";
import AuthCallback from "@/pages/auth/callback";
import ReadingStartPage from "@/pages/reading/Start";
import CupReadingResult from "@/pages/CupReadingResult"; // <-- Χρησιμοποιούμε αυτό
import AuthRedirectGuard from "@/hooks/AuthRedirectGuard";

export default function App() {
  return (
    <BrowserRouter>
      <AuthRedirectGuard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cup" element={<Cup />} />
        <Route path="/my-readings" element={<MyReadings />} />
        <Route path="/reading/start" element={<ReadingStartPage />} />
        <Route path="/reading/:id" element={<CupReadingResult />} /> {/* <-- εδώ */}
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
