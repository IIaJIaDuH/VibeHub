import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";

let client: SupabaseClient<Database> | null = null;

/**
 * Returns a lazily-created Supabase anon client.
 * Returns `null` when the required Vite env variables are missing,
 * so the app can be built and imported without a configured Supabase project.
 */
export function getSupabaseClient(): SupabaseClient<Database> | null {
  const url = import.meta.env.VITE_SUPABASE_URL;
  const key = import.meta.env.VITE_SUPABASE_ANON_KEY;

  if (!url || !key) {
    return null;
  }

  if (!client) {
    client = createClient<Database>(url, key);
  }

  return client;
}
