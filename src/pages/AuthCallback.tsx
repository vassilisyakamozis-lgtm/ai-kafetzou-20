import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Exchanging code for session...', window.location.href);

        // Recommended PKCE exchange for OAuth code
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);

        if (error) {
          console.error('AuthCallback: exchangeCodeForSession error:', error);

          // Fallback: check if session already exists
          const { data: sessionData } = await supabase.auth.getSession();
          if (sessionData?.session) {
            if (window.opener) {
              window.opener.postMessage({ type: 'SUPABASE_AUTH_SUCCESS', session: sessionData.session }, window.location.origin);
              window.close();
              return;
            } else {
              window.location.replace('/');
              return;
            }
          }

          if (window.opener) {
            window.opener.postMessage({ type: 'SUPABASE_AUTH_ERROR', error: error.message }, window.location.origin);
            window.close();
            return;
          } else {
            window.location.replace('/auth?error=oauth');
            return;
          }
        }

        if (data?.session) {
          console.log('AuthCallback: Session established');
          if (window.opener) {
            window.opener.postMessage({ type: 'SUPABASE_AUTH_SUCCESS', session: data.session }, window.location.origin);
            window.close();
          } else {
            window.location.replace('/');
          }
          return;
        }

        console.warn('AuthCallback: No session returned after exchange');
        if (window.opener) {
          window.opener.postMessage({ type: 'SUPABASE_AUTH_ERROR', error: 'No session returned' }, window.location.origin);
          window.close();
        } else {
          window.location.replace('/auth?error=no-session');
        }
      } catch (err: any) {
        console.error('AuthCallback: Unexpected error:', err);
        if (window.opener) {
          window.opener.postMessage({ type: 'SUPABASE_AUTH_ERROR', error: err?.message || 'Callback processing failed' }, window.location.origin);
          window.close();
        } else {
          window.location.replace('/auth?error=callback');
        }
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Completing authentication...</p>
      </div>
    </div>
  );
};

export default AuthCallback;