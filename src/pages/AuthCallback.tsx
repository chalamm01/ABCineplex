import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const { loading } = useAuth();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        // If the URL contains a code param (PKCE flow), exchange it
        const params = new URLSearchParams(globalThis.location.search);
        const code = params.get('code');
        if (code) {
          const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError(exchangeError.message);
            return;
          }
        }

        // Wait until the auth context is done loading, then redirect
        if (!loading) {
          navigate('/', { replace: true });
        }
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [loading, navigate]);

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-semibold mb-2 text-red-600">Sign in failed</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="text-primary hover:text-primary/80 font-medium"
          >
            Back to login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="text-center">
        <h1 className="text-2xl font-semibold mb-2">Completing sign in...</h1>
        <p className="text-gray-600">Please wait while we finalize your authentication.</p>
      </div>
    </div>
  );
}
