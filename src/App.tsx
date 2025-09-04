import { Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import Cup from "./pages/Cup";
import ReadingDemoResult from "./pages/ReadingDemoResult";
import NotFound from "./pages/NotFound";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />

      <Route path="/cup" element={<Cup />} />
      <Route path="/cup/result" element={<ReadingDemoResult />} />

      {/* Αν δείχνεις αποτελέσματα και με id από DB */}
      <Route path="/reading/:id" element={<ReadingDemoResult />} />

      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}

