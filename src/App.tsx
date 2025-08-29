import { Suspense, lazy } from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// Code-splitting (προαιρετικό)
const Home = lazy(() => import("@/pages/Home"));
const Cup = lazy(() => import("@/pages/Cup"));
const NotFound = lazy(() => import("@/pages/NotFound"));

// Βοηθητικό: scroll στην κορυφή σε κάθε αλλαγή route
function ScrollToTop() {
  return null; // optional, αν χρησιμοποιείς κάποιον listener
}

export default function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Suspense fallback={<div style={{ padding: 24 }}>Φόρτωση…</div>}>
        <Routes>
          {/* ROOT: Home */}
          <Route path="/" element={<Home />} />

          {/* Cup page */}
          <Route path="/cup" element={<Cup />} />

          {/* Alias /home -> /  */}
          <Route path="/home" element={<Navigate to="/" replace />} />

          {/* Fallback για οποιοδήποτε άλλο path */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
