import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  useMemo,
  type ReactNode
} from 'react';
import { createClient} from '@/lib/supabase/client';
import type { User, Session } from '@supabase/supabase-js';
import { usersApi, type UserProfile } from '@/services/api';
// 1. Define the User type extension
export interface AuthUser extends UserProfile {
  avatar_url?: string;
}

// Define everything here locally

// 2. Define the Context interface
interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

// 3. Create the Context
export const AuthContext = createContext<AuthContextType | undefined>(undefined);
// 4. The Provider Component
export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  const supabase = useMemo(() => createClient(), []);

  const syncProfile = useCallback(async (supabaseUser: User) => {
    try {
      const dbUser = await usersApi.getCurrentUser();
      const combinedUser: AuthUser = {
        ...dbUser,
        avatar_url: supabaseUser.user_metadata?.avatar_url,
      };
      setUser(combinedUser);
    } catch (error) {
      console.error('Backend sync failed:', error);
      setUser(null);
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) await syncProfile(data.user);
    else setUser(null);
  }, [supabase, syncProfile]);

  useEffect(() => {
    const initAuth = async () => {
      const { data: { session: currentSession } } = await supabase.auth.getSession();
      setSession(currentSession);
      if (currentSession?.user) await syncProfile(currentSession.user);
      setLoading(false);
    };

    initAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        setSession(newSession);
        if (newSession?.user && (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED')) {
          await syncProfile(newSession.user);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [supabase, syncProfile]);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  }, [supabase]);

  const value = useMemo(() => ({
    user,
    session,
    loading,
    isAuthenticated: !!session,
    signOut,
    refreshUser
  }), [user, session, loading, signOut, refreshUser]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// 5. The custom hook (The only thing you'll import in your components)
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};