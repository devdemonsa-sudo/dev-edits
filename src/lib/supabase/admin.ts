import { createClient } from "@supabase/supabase-js";
import { getSupabaseConfig } from "./config";

let adminClient: ReturnType<typeof createClient> | null = null;

export function getAdminClient() {
  if (adminClient) {
    return adminClient;
  }

  const { url } = getSupabaseConfig();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Supabase service role key is not configured.");
  }

  adminClient = createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });

  return adminClient;
}
