// src/components/SafeStartCTA.tsx
'use client';
import { MouseEvent, PropsWithChildren } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

type Props = PropsWithChildren<{
  className?: string;
  text?: string; // αν δεν περάσεις children
}>;

/**
 * Ασφαλές, στιλισμένο CTA:
 * - Μπλοκάρει οποιοδήποτε <a> ή <form> wrapper (capture + bubble)
 * - Κάνει OAuth login αν λείπει session
 * - Πλοηγεί client-side (navigate) – ποτέ full reload
 */
export default function SafeStartCTA({ className = '', text, children }: Props) {
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

    navigate('/reading/start'); // ΧΩΡΙΣ full reload
  };

  return (
    <button
      type="button"
      onMouseDown={stop}        // “σκοτώνει” τυχόν <a>/<form> πριν την φάση click
      onClickCapture={stop}     // κόβει bubbling/capture από wrappers
      onClick={start}
      className={
        // default στιλ κουμπιού + extra classes από prop
        `inline-flex items-center justify-center
         px-5 py-3 rounded-xl font-semibold
         bg-violet-600 text-white shadow-md
         hover:bg-violet-700 active:bg-violet-800
         focus:outline-none focus:ring-2 focus:ring-violet-400
         disabled:opacity-60 disabled:cursor-not-allowed
         transition-colors ${className}`
      }
    >
      {children ?? (text ?? 'Ξεκίνα την Ανάγνωση')}
    </button>
  );
}
