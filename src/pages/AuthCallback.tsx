import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

const AuthCallback = () => {
  useEffect(() => {
    const handleAuthCallback = async () => {
      try {
        // Get session from URL hash
        const { data, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('Auth callback error:', error);
          // Notify parent window of error
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'SUPABASE_AUTH_ERROR', 
              error: error.message 
            }, window.location.origin);
          }
        } else if (data.session) {
          // Notify parent window of successful auth
          if (window.opener) {
            window.opener.postMessage({ 
              type: 'SUPABASE_AUTH_SUCCESS', 
              session: data.session 
            }, window.location.origin);
          }
        }
        
        // Close popup
        if (window.opener) {
          window.close();
        }
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