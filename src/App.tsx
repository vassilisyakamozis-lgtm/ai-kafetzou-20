import { Routes, Route, Navigate } from "react-router-dom";
import CupPage from "./pages/cup";
import ReadingPage from "./pages/reading";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/cup" replace />} />
      <Route path="/cup" element={<CupPage />} />
      <Route path="/reading" element={<ReadingPage />} />
      {/* προαιρετικά: 404 */}
      <Route path="*" element={<Navigate to="/cup" replace />} />
    </Routes>
  );
}
