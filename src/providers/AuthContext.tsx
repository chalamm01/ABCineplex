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
import { usersApi, type UserProfile } from '@/services/api'; // Import your API service

export interface AuthUser {
  id: string;
  email: string;
  user_name?: string;
  full_name?: string;
  avatar_url?: string;
  is_admin?: boolean;
}

function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    user_name: user.user_metadata?.user_name,
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
    is_admin: user.user_metadata?.is_admin ?? false,
  };
}

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  // Centralized logic to sync Supabase Auth with your Backend Database
  const syncProfile = useCallback(async (supabaseUser: User) => {
    const mappedUser = mapUser(supabaseUser);
    try {
      // ✅ Uses usersApi which correctly calls /api/v1/users/me
      const dbUser: UserProfile = await usersApi.getCurrentUser();

      // Merge backend-specific flags (like is_admin) into the auth state
      // Assuming your backend UserProfile has an is_admin field
      if ((dbUser as any).is_admin) {
        mappedUser.is_admin = true;
      }
    } catch (error) {
      // If the backend call fails, we still have the basic Supabase info
      console.warn('Backend sync failed, using session metadata only.');
    }
    setUser(mappedUser);
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
    // 1. Initial Session Check
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
      async (_event, newSession) => {
        setSession(newSession);
        if (newSession?.user) {
          await syncProfile(newSession.user);
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