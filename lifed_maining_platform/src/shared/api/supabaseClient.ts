import { createClient } from "@supabase/supabase-js";
import { env } from "@/shared/config/env";

const hasSupabaseEnv = Boolean(env.supabaseUrl && env.supabaseAnonKey);

if (!hasSupabaseEnv) {
  // eslint-disable-next-line no-console
  console.error("Supabase env не заполнены: VITE_SUPABASE_URL и/или VITE_SUPABASE_ANON_KEY");
}

export const supabase = createClient(
  hasSupabaseEnv ? env.supabaseUrl : "http://127.0.0.1:54321",
  hasSupabaseEnv ? env.supabaseAnonKey : "public-anon-key",
  {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true
  }
}
);
