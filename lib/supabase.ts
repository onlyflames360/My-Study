import { createClient, SupabaseClient } from "@supabase/supabase-js";

function getUrl() {
  return process.env.NEXT_PUBLIC_SUPABASE_URL || "";
}

function getAnonKey() {
  return process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
}

let _supabase: SupabaseClient | null = null;

export function getSupabase() {
  if (!_supabase) {
    const url = getUrl();
    const key = getAnonKey();
    if (!url || !key) {
      throw new Error(
        "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY."
      );
    }
    _supabase = createClient(url, key);
  }
  return _supabase;
}

export const supabase = {
  get client() {
    return getSupabase();
  },
};

// Server-side client with service role for cron jobs and mutations
export function getServiceSupabase() {
  const url = getUrl();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || getAnonKey();
  if (!url || !key) {
    throw new Error(
      "Supabase not configured. Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY."
    );
  }
  return createClient(url, key);
}
