'use client';
import { supabase } from '@/integrations/supabase/client';
import { getAppOrigin } from '@/utils/auth';

export default function GoogleLoginButton() {
  async function signIn() {
    const redirectTo = `${getAppOrigin()}`;
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { scopes: 'email profile', redirectTo },
    });
    if (error) console.error('Google sign-in error:', error);
  }

  return (
    <button onClick={signIn} className="px-4 py-2 rounded bg-black text-white">
      Continue with Google
    </button>
  );
}
