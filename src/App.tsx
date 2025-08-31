// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from '@/pages/Home'     // ΣΤΑΤΙΚΟ import
import Cup from '@/pages/Cup'       // ΣΤΑΤΙΚΟ import
import MyReadings from '@/pages/MyReadings'
import AuthCallback from '@/pages/auth/callback'
import ReadingStartPage from '@/pages/reading/Start'
import ReadingDetail from '@/pages/reading/Detail'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cup" element={<Cup />} />
        <Route path="/my-readings" element={<MyReadings />} />
        <Route path="/reading/start" element={<ReadingStartPage />} />
        <Route path="/reading/:id" element={<ReadingDetail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
