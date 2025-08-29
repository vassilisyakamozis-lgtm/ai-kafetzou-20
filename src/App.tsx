// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";

// ΧΩΡΙΣ lazy() για να μη χρειάζεται dynamic import (καλύπτει το error σου)
import Home from "./pages/Home";
import Cup from "./pages/Cup";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cup" element={<Cup />} />
        {/* Οτιδήποτε άλλο -> σπίτι */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
