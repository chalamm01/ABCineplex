import { createClient as createSupabaseClient, type SupabaseClient } from '@supabase/supabase-js';

let instance: SupabaseClient | null = null;

export function createClient(): SupabaseClient {
  if (!instance) {
    instance = createSupabaseClient(
      import.meta.env.VITE_SUPABASE_URL,
      import.meta.env.VITE_SUPABASE_ANON_KEY,
      { auth: { flowType: 'pkce' } }
    );
  }
  return instance;
}
