import { createClient } from "@/lib/supabase/server";
import type { IntegrationConnectionRecord } from "@/lib/integrations/types";

export async function listIntegrationConnections() {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_connections")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []) as IntegrationConnectionRecord[];
}

export async function getIntegrationConnectionByProvider(provider: string) {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("integration_connections")
    .select("*")
    .eq("provider", provider)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data as IntegrationConnectionRecord | null;
}

