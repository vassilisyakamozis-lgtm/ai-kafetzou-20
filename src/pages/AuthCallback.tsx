import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing callback...', window.location.href);
        
        const { data, error } = await supabase.auth.exchangeCodeForSession(window.location.href);
        
        if (error) {
          console.error('AuthCallback error:', error);
          // Redirect to auth with error
          window.location.replace('/auth?error=' + encodeURIComponent(error.message));
          return;
        }

        if (data?.session) {
          console.log('AuthCallback: Success, redirecting to home');
          // Success - redirect to home
          window.location.replace('/');
        } else {
          console.log('AuthCallback: No session, redirecting to auth');
          window.location.replace('/auth?error=no-session');
        }
      } catch (err: any) {
        console.error('AuthCallback unexpected error:', err);
        window.location.replace('/auth?error=callback-failed');
      }
    };

    handleAuthCallback();
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-background">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
        <p className="text-muted-foreground">Ολοκλήρωση σύνδεσης...</p>
      </div>
    </div>
  );
};

export default AuthCallback;