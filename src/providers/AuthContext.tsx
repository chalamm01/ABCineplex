import {
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode,
} from 'react';
import { createClient } from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { AuthContext } from '@/providers/AuthContextDef';
import { usersApi, type UserProfile } from '@/services/api';

/**
 * Extended User type for the Frontend.
 * Combines DB profile (loyalty/admin) with Supabase Auth metadata (avatar).
 */
export interface AuthUser extends UserProfile {
  avatar_url?: string;
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  /**
   * Syncs the Supabase session with your public.users table in the DB.
   * This is where we verify if the user is an admin or has reward points.
   */
  const syncProfile = useCallback(async (supabaseUser: User) => {
    try {
      // 1. Fetch the source of truth from your FastAPI /api/v1/users/me
      const dbUser = await usersApi.getCurrentUser();

      // 2. Merge DB data with Supabase Metadata
      const combinedUser: AuthUser = {
        ...dbUser,
        // avatar_url is usually stored in Supabase metadata or can be a DB column
        avatar_url: supabaseUser.user_metadata?.avatar_url || '',
      };

      setUser(combinedUser);
    } catch (error) {
      console.error('Failed to sync user profile with backend:', error);
      // If the backend fails (e.g., user row doesn't exist yet),
      // we clear the user to prevent unauthorized access to features.
      setUser(null);
    }
  }, []);

  /**
   * Manually re-fetch the user profile (e.g., after booking a ticket)
   */
  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await syncProfile(data.user);
    } else {
      setUser(null);
    }
  }, [supabase, syncProfile]);

  useEffect(() => {
    // 1. Initial Session Check on mount
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);

      if (currentSession?.user) {
        await syncProfile(currentSession.user);
      } else {
        setUser(null);
      }
      setLoading(false);
    };

    initAuth();

    // 2. Listen for Auth State Changes (Login, Logout, Token Refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        if (newSession?.user) {
          // Only re-sync on meaningful changes to save API bandwidth
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            await syncProfile(newSession.user);
          }
        } else {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, syncProfile]);

  /**
   * Logs out the user and clears all local states
   */
  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  // Derived state for easy use in components
  const isAuthenticated = useMemo(() => !!session && !!user, [session, user]);
  const isAdmin = useMemo(() => !!user?.is_admin, [user]);

  const value = useMemo(
    () => ({
      user,
      session,
      loading,
      isAuthenticated,
      isAdmin,
      signOut,
      refreshUser
    }),
    [user, session, loading, isAuthenticated, isAdmin, signOut, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}