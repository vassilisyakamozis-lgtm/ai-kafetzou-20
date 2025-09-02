'use client';
import { supabase } from '@/lib/supabase';

export default function StartReadingButton() {
  const start = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    localStorage.setItem('returnTo', '/reading/start');
    if (!session) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/reading/start` },
      });
      return;
    }
    window.location.href = '/reading/start';
  };
  return <button onClick={start}>Ξεκίνα την Ανάγνωση</button>;
}