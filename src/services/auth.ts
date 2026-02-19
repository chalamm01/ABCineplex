import { createClient } from '@/lib/supabase/client';
import type { Session, User } from '@supabase/supabase-js';

interface AuthUser {
  id: string;
  email: string;
  user_name?: string;
  full_name?: string;
}

function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    user_name: user.user_metadata?.user_name,
    full_name: user.user_metadata?.full_name,
  };
}

/** Sign in with email and password */
export async function signIn(email: string, password: string): Promise<{ user: AuthUser; session: Session }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) throw error;
  if (!data.user || !data.session) throw new Error('Login failed');

  return { user: mapUser(data.user), session: data.session };
}

/** Sign up with email, password, and profile metadata */
export async function signUp(
  email: string,
  password: string,
  metadata: { user_name: string; full_name: string }
): Promise<{ user: AuthUser; session: Session | null }> {
  const supabase = createClient();
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: metadata,
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Registration failed');

  return { user: mapUser(data.user), session: data.session };
}

/** Sign in with Google OAuth */
export async function signInWithGoogle() {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${globalThis.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}

/** Sign out */
export async function signOut() {
  const supabase = createClient();
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

/** Get current session */
export async function getSession(): Promise<Session | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getSession();
  return data.session;
}

/** Get current user */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const supabase = createClient();
  const { data } = await supabase.auth.getUser();
  return data.user ? mapUser(data.user) : null;
}
