// src/main.tsx
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

// Φόρτωσε τα global styles (Tailwind / theme)
import './index.css'     // <- tailwind directives συνήθως εδώ
// Αν υπάρχει και App.css στο project σου, άφησε την ακόλουθη γραμμή. Αν δεν υπάρχει, μπορείς να τη σβήσεις.
import './App.css'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
)
