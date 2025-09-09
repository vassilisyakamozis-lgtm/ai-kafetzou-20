import { Routes, Route, Navigate } from "react-router-dom";

import Home from "@/pages/Home";
import Cup from "@/pages/Cup";
import MyReadings from "@/pages/MyReadings";
import Auth from "@/pages/Auth";                    // <-- ΝΕΟ: σελίδα Σύνδεσης/Εγγραφής
import AuthCallback from "@/pages/auth/callback";   // <-- OAuth callback
import ReadingStartPage from "@/pages/reading/Start";
import ReadingDetail from "@/pages/reading/Detail";
import AuthRedirectGuard from "@/hooks/AuthRedirectGuard";

export default function App() {
  return (
    <>
      {/* Αν κάνεις guard/redirect όταν δεν υπάρχει session, άφησέ το εδώ */}
      <AuthRedirectGuard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cup" element={<Cup />} />
        <Route path="/my-readings" element={<MyReadings />} />
        <Route path="/reading/start" element={<ReadingStartPage />} />
        <Route path="/reading/:id" element={<ReadingDetail />} />

        {/* ΝΕΑ routes για πλήρες auth flow */}
        <Route path="/auth" element={<Auth />} />
        <Route path="/auth/callback" element={<AuthCallback />} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}
