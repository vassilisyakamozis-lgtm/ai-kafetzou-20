'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { SignInWithGoogle, SignOut } from '@/components/AuthButtons';

export default function MyReadingsPage() {
  const [session, setSession] = useState<any>(null);
  const [email, setEmail] = useState<string|undefined>(undefined);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setEmail(data.session?.user?.email);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_, s) => {
      setSession(s); setEmail(s?.user?.email);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  if (!session) {
    return (
      <div style={{padding:16}}>
        <p>Πρέπει να συνδεθείς με Google για να δεις τα readings σου.</p>
        <SignInWithGoogle />
      </div>
    );
  }

  return (
    <div style={{padding:16}}>
      <p>Σύνδεση ως {email}</p>
      <SignOut />
      {/* Εδώ αργότερα: λίστα readings */}
    </div>
  );
}