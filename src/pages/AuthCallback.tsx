import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createClient } from '@/lib/supabase/client';
import { userApi } from '@/services/api';
import type { SupabaseClient } from '@supabase/supabase-js';

// ── Token extraction helpers ──────────────────────────────────────────────────

async function extractTokensPkce(supabase: SupabaseClient, code: string) {
  console.log('[AuthCallback] PKCE flow — calling exchangeCodeForSession...');
  const { error, data } = await supabase.auth.exchangeCodeForSession(code);
  if (error) {
    console.error('[AuthCallback] exchangeCodeForSession error:', error.message);
    throw error;
  }
  console.log('[AuthCallback] PKCE exchange success');
  return {
    accessToken:  data?.session?.access_token  ?? null,
    refreshToken: data?.session?.refresh_token ?? null,
  };
}

async function extractTokensImplicit(
  supabase: SupabaseClient,
  hashToken: string,
  hashRefresh: string | null,
) {
  console.log('[AuthCallback] Implicit flow — using tokens from hash fragment');
  if (!hashRefresh) {
    return { accessToken: hashToken, refreshToken: null };
  }
  const { error, data } = await supabase.auth.setSession({
    access_token:  hashToken,
    refresh_token: hashRefresh,
  });
  if (error) {
    console.warn('[AuthCallback] setSession warning (non-fatal):', error.message);
  }
  return {
    accessToken:  data?.session?.access_token  ?? hashToken,
    refreshToken: data?.session?.refresh_token ?? hashRefresh,
  };
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function AuthCallback() {
  const navigate = useNavigate();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const handleCallback = async () => {
      try {
        const supabase = createClient();
        console.log('[AuthCallback] full URL:', globalThis.location.href);

        const queryParams = new URLSearchParams(globalThis.location.search);
        const hashParams  = new URLSearchParams(globalThis.location.hash.slice(1));

        const code        = queryParams.get('code');
        const hashToken   = hashParams.get('access_token');
        const hashRefresh = hashParams.get('refresh_token');

        console.log('[AuthCallback] code (PKCE):', code ? `${code.slice(0, 20)}...` : 'none');
        console.log('[AuthCallback] hash token (implicit):', hashToken ? `${hashToken.slice(0, 20)}...` : 'none');

        let accessToken: string | null = null;
        let refreshToken: string | null = null;

        if (code) {
          ({ accessToken, refreshToken } = await extractTokensPkce(supabase, code));
        } else if (hashToken) {
          ({ accessToken, refreshToken } = await extractTokensImplicit(supabase, hashToken, hashRefresh));
        } else {
          console.warn('[AuthCallback] No auth data in URL — redirecting to /');
          navigate('/', { replace: true });
          return;
        }

        if (!accessToken) {
          console.error('[AuthCallback] No access token after processing');
          navigate('/login', { replace: true });
          return;
        }

        localStorage.setItem('token', accessToken);
        if (refreshToken) localStorage.setItem('refresh_token', refreshToken);
        console.log('[AuthCallback] Token stored in localStorage');

        try {
          console.log('[AuthCallback] Fetching backend profile...');
          const profile = await userApi.getProfile();
          console.log('[AuthCallback] Profile:', { id: profile.id, has_password: profile.has_password });
          localStorage.setItem('user', JSON.stringify(profile));

          if (profile.has_password === false) {
            console.log('[AuthCallback] has_password=false → /setup-password');
            navigate('/setup-password', { replace: true });
            return;
          }
        } catch (error_: unknown) {
          console.error('[AuthCallback] Profile fetch failed:', error_);
        }

        console.log('[AuthCallback] Done — redirecting to /');
        navigate('/', { replace: true });
      } catch (err: unknown) {
        console.error('[AuthCallback] Unexpected error:', err);
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
