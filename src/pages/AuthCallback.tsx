import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export default function AuthCallback() {
  useEffect(() => {
    // Το supabase-js με detectSessionInUrl=true θα "μαζέψει" τα tokens από το URL
    // και θα αποθηκεύσει το session. Μετά κάνε redirect όπου θες (π.χ. /cup).
    supabase.auth.getSession().then(() => {
      window.location.replace('/cup'); // ή σελίδα dashboard σου
    });
  }, []);

  return <p>Signing you in…</p>;
}