// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "@/pages/Home";
import Cup from "@/pages/Cup";               // κράτα το ίδιο casing με το αρχείο σου
import MyReadings from "@/pages/MyReadings";
import AuthCallback from "@/pages/auth/callback";
import ReadingStartPage from "@/pages/reading/Start";
import ReadingDetail from "@/pages/reading/Detail";
import AuthRedirectGuard from "@/hooks/AuthRedirectGuard";

export default function App() {
  // ΣΗΜΑΝΤΙΚΟ: ΔΕΝ βάζουμε BrowserRouter εδώ,
  // γιατί το Lovable παρέχει ήδη Router γύρω από το <App />.
  return (
    <>
      <AuthRedirectGuard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cup" element={<Cup />} />
        <Route path="/my-readings" element={<MyReadings />} />
        <Route path="/reading/start" element={<ReadingStartPage />} />
        <Route path="/reading/:id" element={<ReadingDetail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
