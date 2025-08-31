'use client';
import { supabase } from '@/lib/supabase';

export function SignInWithGoogle() {
  const onClick = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}` }
    });
  };
  return <button onClick={onClick}>Σύνδεση με Google</button>;
}

export function SignOut() {
  const onClick = async () => { await supabase.auth.signOut(); location.reload(); };
  return <button onClick={onClick}>Αποσύνδεση</button>;
}