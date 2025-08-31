'use client';
import { supabase } from '@/lib/supabase';

export default function StartReadingButton() {
  const start = async () => {
    const { data: { session } } = await supabase.auth.getSession();

    // κρατάμε σημαία ότι θέλουμε "ανάγνωση τώρα"
    localStorage.setItem('returnTo', '/reading/start');

    if (!session) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        // μετά το OAuth γύρνα ΠΑΝΤΑ στον orchestrator της ανάγνωσης
        options: { redirectTo: `${window.location.origin}/reading/start` }
      });
      return;
    }

    // αν ήδη είμαι logged in, πάμε κατευθείαν στον orchestrator
    window.location.href = '/reading/start';
  };

  return <button onClick={start}>Ξεκίνα την Ανάγνωση</button>;
}