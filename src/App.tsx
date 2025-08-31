// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from '@/pages/Home'     // ΣΤΑΤΙΚΟ import
import Cup from '@/pages/Cup'       // ΣΤΑΤΙΚΟ import
import AuthCallback from '@/pages/AuthCallback'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cup" element={<Cup />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
