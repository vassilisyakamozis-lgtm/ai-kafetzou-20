// src/App.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'

import Home from '@/pages/Home'
import Cup from '@/pages/Cup'
import MyReadings from '@/pages/MyReadings'
import AuthCallback from '@/pages/auth/callback'
import ReadingStartPage from '@/pages/reading/Start'
import ReadingDetail from '@/pages/reading/Detail'

// (προαιρετικό, αν το έχεις) import AuthRedirectGuard from '@/hooks/AuthRedirectGuard'

export default function App() {
  return (
    <BrowserRouter>
      {/* <AuthRedirectGuard />  // αν το χρησιμοποιείς, βάλ’ το εδώ μία φορά */}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cup" element={<Cup />} />
        <Route path="/my-readings" element={<MyReadings />} />
        <Route path="/reading/start" element={<ReadingStartPage />} />
        {/* ✅ ΝΕΟ route που ταιριάζει με το redirect /reading/detail?id=... */}
        <Route path="/reading/detail" element={<ReadingDetail />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        {/* fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}
