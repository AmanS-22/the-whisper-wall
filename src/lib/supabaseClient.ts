import { createClient } from '@supabase/supabase-js'

// Contract
// - Reads env from Vite: import.meta.env.VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY
// - Provides typed client for database operations

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

if (!url || !anonKey) {
  // Log a friendly warning (don’t throw to allow static demo to run without env)
  console.warn('[Supabase] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. Falling back to local-only notes.');
}

export const supabase = (url && anonKey)
  ? createClient(url, anonKey)
  : (null as unknown as ReturnType<typeof createClient>)

export function hasSupabase(): boolean {
  return Boolean(url && anonKey)
}
