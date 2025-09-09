// src/components/StartReadingButton.tsx
'use client';
import { MouseEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function StartReadingButton() {
  const navigate = useNavigate();

  const onClick = async (e: MouseEvent<HTMLButtonElement>) => {
    // μπλοκάρει οποιοδήποτε <a> / <form> wrapper γύρω από το κουμπί
    e.preventDefault();
    e.stopPropagation();

    localStorage.setItem('returnTo', '/reading/start');

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: { redirectTo: `${window.location.origin}/reading/start` },
      });
      return;
    }
    // client-side πλοήγηση (όχι full reload)
    navigate('/reading/start');
  };

  return (
    <button type="button" onClick={onClick}>
      Ξεκίνα την Ανάγνωση
    </button>
  );
}
