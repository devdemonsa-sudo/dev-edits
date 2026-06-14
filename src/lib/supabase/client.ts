"use client";

import { createBrowserClient } from "@supabase/ssr";
import { getSupabaseConfig } from "./config";

export function createClient() {
  const { publishableKey, url } = getSupabaseConfig();

  if (!url || !publishableKey) {
    throw new Error("Supabase is not configured.");
  }

  return createBrowserClient(url, publishableKey);
}
