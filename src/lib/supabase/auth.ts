import { redirect } from "next/navigation";
import { getSupabaseConfig } from "./config";
import { createClient } from "./server";

export type AuthResult =
  | { configured: false; user: null; userId: null }
  | { configured: true; user: { email?: string; id: string }; userId: string };

export async function getAuthenticatedUser(): Promise<AuthResult> {
  if (!getSupabaseConfig().isConfigured) {
    return { configured: false, user: null, userId: null };
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    redirect("/login");
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
