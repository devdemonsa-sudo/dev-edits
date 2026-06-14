import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function getTransactionsPageData() {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("transactions")
    .select("id, external_id, marketplace, type, amount, expected_amount, currency, status, reconciliation_status, confidence_score, transaction_date")
    .order("transaction_date", { ascending: false })
    .limit(100);

  if (error) throw error;

  return data ?? [];
}

export async function getDiscrepanciesPageData() {
  noStore();
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("discrepancies")
    .select("id, type, description, expected_value, actual_value, severity, status, created_at")
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) throw error;

  return data ?? [];
}
