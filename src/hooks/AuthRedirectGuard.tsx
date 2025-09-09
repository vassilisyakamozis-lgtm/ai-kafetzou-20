// src/hooks/AuthRedirectGuard.tsx
'use client';
import { useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export default function AuthRedirectGuard() {
  useEffect(() => {
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      if (!session) return;
      const saved = localStorage.getItem('returnTo');
      if (!saved) return;
      localStorage.removeItem('returnTo');
      const here = window.location.pathname + window.location.search + window.location.hash;
      if (here !== saved) window.location.replace(saved);
    });
    return () => sub.subscription.unsubscribe();
  }, []);
  return null;
}
