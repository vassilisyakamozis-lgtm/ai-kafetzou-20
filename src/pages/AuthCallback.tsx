import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        console.log('AuthCallback: Processing OAuth callback...');
        console.log('Current URL:', window.location.href);
        
        // Listen for auth state changes first
        const { data: { subscription } } = supabase.auth.onAuthStateChange(
          async (event, session) => {
            console.log('AuthCallback: Auth state changed:', event, session);
            
            if (event === 'SIGNED_IN' && session) {
              console.log('AuthCallback: User signed in successfully');
              // Notify parent window of successful auth
              if (window.opener) {
                window.opener.postMessage({ 
                  type: 'SUPABASE_AUTH_SUCCESS', 
                  session: session 
                }, window.location.origin);
                window.close();
              }
            } else if (event === 'SIGNED_OUT') {
              console.log('AuthCallback: User signed out');
            }
          }
        );

        // Check if there's already a session
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'SUPABASE_AUTH_ERROR', 
              error: error.message 
            }, window.location.origin);
            window.close();
          }
        } else if (session) {
          console.log('AuthCallback: Existing session found:', session);
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'SUPABASE_AUTH_SUCCESS', 
              session: session 
            }, window.location.origin);
            window.close();
          }
        }

        // Cleanup subscription after a delay to allow auth processing
        setTimeout(() => {
          subscription?.unsubscribe();
        }, 5000);
        
      } catch (err) {
        console.error('Callback processing error:', err);
        if (window.opener) {
          window.opener.postMessage({ 
            type: 'SUPABASE_AUTH_ERROR', 
            error: 'Callback processing failed' 
          }, window.location.origin);
          window.close();
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