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

export interface AuthUser extends UserProfile {
  // We extend UserProfile so the auth user has ALL the fields from your DB
  avatar_url?: string;
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Centralized logic to fetch the REAL profile from public.users via your API
  const syncProfile = useCallback(async (supabaseUser: User) => {
    try {
      // 1. Fetch the source of truth from your database
      const dbUser = await usersApi.getCurrentUser();

      // 2. Merge Supabase Auth data (like avatar) with DB data (like is_admin)
      const combinedUser: AuthUser = {
        ...dbUser,
        // Fallback to metadata for avatar if not in your DB
        avatar_url: supabaseUser.user_metadata?.avatar_url,
      };

      setUser(combinedUser);
    } catch (error) {
      console.error('Backend sync failed. User might not exist in public.users yet.');
      // Optional: Handle case where Supabase user exists but DB record doesn't
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) {
      await syncProfile(data.user);
    } else {
      setUser(null);
    }
  }, [supabase, syncProfile]);

  useEffect(() => {
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

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);

        // Only trigger sync on specific events to avoid redundant API calls
        if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION')) {
          await syncProfile(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }

        setLoading(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, syncProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  const isAuthenticated = useMemo(() => !!session, [session]);

  const value = useMemo(
    () => ({ user, session, loading, isAuthenticated, signOut, refreshUser }),
    [user, session, loading, isAuthenticated, signOut, refreshUser]
  );

  return (
    <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
  );
}