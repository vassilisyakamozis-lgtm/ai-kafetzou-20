// src/App.tsx
import { Routes, Route, Navigate } from "react-router-dom";

import Home from "./pages/Home.tsx";
import Cup from "./pages/Cup.tsx";
import ReadingDemoResult from "./pages/ReadingDemoResult.tsx";
import NotFound from "./pages/NotFound.tsx";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/cup" element={<Cup />} />
      <Route path="/cup/result" element={<ReadingDemoResult />} />
      <Route path="/reading/:id" element={<ReadingDemoResult />} />
      <Route path="/home" element={<Navigate to="/" replace />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
