import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

import './index.css';
import './App.css'; // αν δεν υπάρχει, μπορείς να αφαιρέσεις αυτή τη γραμμή

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
