'use client';
import { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

/**
 * Ασφαλές CTA που μπλοκάρει ΟΠΟΙΟΔΗΠΟΤΕ <a>/<form> wrapper και κάνει client-side navigate.
 */
export default function SafeStartCTA() {
  const navigate = useNavigate();

  const stop = (e: MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const start = async (e: MouseEvent<HTMLButtonElement>) => {
    stop(e);
    localStorage.setItem('returnTo', '/reading/start');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/reading/start` },
      });
      return;
    }
    navigate('/reading/start');
  };

  return (
    <button
      type="button"
      onMouseDown={stop}
      onClickCapture={stop}
      onClick={start}
    >
      Ξεκίνα την Ανάγνωση
    </button>
  );
}