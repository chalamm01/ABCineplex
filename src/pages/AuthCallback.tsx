import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@/lib/supabase/client';

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();

        const params = new URLSearchParams(globalThis.location.search);
        const code = params.get('code');
        if (code) {
          const { error: exchangeError, data } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) {
            setError(exchangeError.message);
            return;
          }

          if (data?.session?.access_token) {
            localStorage.setItem('token', data.session.access_token);
          }

          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError || !userData?.user?.email) {
            setError(userError?.message || 'Failed to get user info');
            return;
          }

          // Store basic user info from auth (will be enhanced when user profile loads)
          const userInfo = {
            id: userData.user.id,
            email: userData.user.email,
            first_name: userData.user.user_metadata?.first_name || '',
            last_name: userData.user.user_metadata?.last_name || '',
            user_name: userData.user.user_metadata?.user_name || userData.user.email.split('@')[0],
          };
          localStorage.setItem('user', JSON.stringify(userInfo));
        }

        // Auth callback completed, redirect to home
        navigate('/', { replace: true });
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : 'Authentication failed');
      }
    };

    handleCallback();
  }, [navigate]);

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
