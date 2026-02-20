import { createClient } from '@/lib/supabase/client';
import type { Session, User, Provider } from '@supabase/supabase-js';

export interface AuthUser {
  id: string;
  email: string;
  user_name?: string;
  full_name?: string;
  avatar_url?: string;
}

function mapUser(user: User): AuthUser {
  return {
    id: user.id,
    email: user.email ?? '',
    user_name: user.user_metadata?.user_name,
    full_name: user.user_metadata?.full_name,
    avatar_url: user.user_metadata?.avatar_url,
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
      emailRedirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
  if (!data.user) throw new Error('Registration failed');

  return { user: mapUser(data.user), session: data.session };
}

/** Sign in with OAuth provider */
export async function signInWithOAuth(provider: Provider) {
  const supabase = createClient();
  const { error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) throw error;
}

/** Sign in with Google OAuth */
export async function signInWithGoogle() {
  return signInWithOAuth('google');
}

/** Sign in with GitHub OAuth */
export async function signInWithGitHub() {
  return signInWithOAuth('github');
}

/** Sign in with Discord OAuth */
export async function signInWithDiscord() {
  return signInWithOAuth('discord');
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
