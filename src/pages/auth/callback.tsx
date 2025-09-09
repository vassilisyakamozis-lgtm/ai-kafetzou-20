import { useEffect } from 'react';
import { supabase } from '../../integrations/supabase/client';

export default function AuthCallback() {
  useEffect(() => {
    // Το supabase-js (detectSessionInUrl: true) θα διαβάσει το #access_token
    // και θα αποθηκεύσει το session. Μετά κάνουμε redirect εκεί που θες.
    (async () => {
      try {
        await supabase.auth.getSession(); // πυροδοτεί ανάγνωση tokens από το URL
      } finally {
        window.location.replace('/cup'); // άλλαξέ το στο dashboard/home σου
      }
    })();
  }, []);

  return <div style={{padding: 24}}>Signing you in…</div>;
}