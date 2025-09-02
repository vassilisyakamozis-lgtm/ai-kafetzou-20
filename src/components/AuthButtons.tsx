'use client';
import { supabase } from '@/lib/supabase';

export function SignInWithGoogle() {
  const onClick = async () => {
    const returnTo =
      window.location.pathname + window.location.search + window.location.hash;
    localStorage.setItem('returnTo', returnTo);
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}${returnTo}` },
    });
  };
  return <button onClick={onClick}>Σύνδεση με Google</button>;
}

export function SignOut() {
  const onClick = async () => {
    await supabase.auth.signOut();
    localStorage.removeItem('returnTo');
    location.reload();
  };
  return <button onClick={onClick}>Αποσύνδεση</button>;
}
