import { BrowserRouter, Routes, Route } from 'react-router-dom';

import Home from '@/pages/Home';          // ή ό,τι χρησιμοποιείς για την αρχική
import Cup from '@/pages/Cup';            // η σελίδα cup σου
import ReadingStartPage from '@/pages/reading/Start';
import ReadingDetail from '@/pages/reading/Detail';

import AuthRedirectGuard from '@/hooks/AuthRedirectGuard';

export default function App() {
  return (
    <BrowserRouter>
      <AuthRedirectGuard />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/cup" element={<Cup />} />
        <Route path="/reading/start" element={<ReadingStartPage />} />
        <Route path="/reading/detail" element={<ReadingDetail />} />
        {/* προαιρετικά: 404 → home */}
        <Route path="*" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
