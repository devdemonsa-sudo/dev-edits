import { createClient } from "./server";
import { getSupabaseConfig } from "./config";

export type RequestUserResult =
  | { configured: false; user: null; userId: null }
  | { configured: true; user: { email?: string; id: string } | null; userId: string | null };

export async function getRequestUser(): Promise<RequestUserResult> {
  if (!getSupabaseConfig().isConfigured) {
    return { configured: false, user: null, userId: null };
  }

  const supabase = await createClient();
  const { data: claimsData } = await supabase.auth.getClaims();

  if (!claimsData?.claims?.sub) {
    return { configured: true, user: null, userId: null };
  }

  const { data: userData } = await supabase.auth.getUser();

  return {
    configured: true,
    user: {
      email: userData.user?.email ?? undefined,
      id: claimsData.claims.sub
    },
    userId: claimsData.claims.sub
  };
}
