import { Routes, Route, Navigate } from "react-router-dom";

// >>> Βάλε εδώ τα δικά σου components/σελίδες
import Home from "./pages/Home";                 // αρχική
import ReadingDemoResult from "./pages/ReadingDemoResult"; // "Αποτέλεσμα Ανάγνωσης (demo)"
import NotFound from "./pages/NotFound";         // 404

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      {/* Αν το demo γυρίζει state ή /reading/:id, κράτα και τα δύο */}
      <Route path="/reading/result" element={<ReadingDemoResult />} />
      <Route path="/reading/:id" element={<ReadingDemoResult />} />

      {/* Προαιρετικά: redirect από παλιό μονοπάτι */}
      <Route path="/home" element={<Navigate to="/" replace />} />

      {/* 404 */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
