// src/main.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import './App.css'; // άστο αν υπάρχει, αλλιώς μπορείς να το αφαιρέσεις

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
