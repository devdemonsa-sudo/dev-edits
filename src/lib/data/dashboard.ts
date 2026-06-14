import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DiscrepancySeverity, ReconciliationStatus, TransactionStatus } from "@/lib/reconciliation/types";

export type DashboardFilters = {
  marketplace?: string;
  period?: string;
  status?: string;
};

export type DashboardTransaction = {
  amount: number;
  currency: string;
  external_id: string;
  id: string;
  marketplace: string;
  reconciliation_status: ReconciliationStatus;
  status: TransactionStatus;
  transaction_date: string;
};

export type DashboardDiscrepancy = {
  actual_value: number | null;
  description: string;
  expected_value: number | null;
  id: string;
  severity: DiscrepancySeverity;
  status: string;
  type: string;
};

type DashboardAggregateRow = {
  amount: number | string | null;
  expected_amount?: number | string | null;
  marketplace?: string | null;
  reconciliation_status: string | null;
  transaction_date?: string | null;
};

function getStartDate(period?: string) {
  const days = period === "7d" ? 7 : period === "90d" ? 90 : 30;
  const date = new Date();
  date.setDate(date.getDate() - days);
  return date.toISOString();
}

type FilterableQuery = any;

function applyTransactionFilters(query: FilterableQuery, filters: DashboardFilters) {
  let filtered = query.gte("transaction_date", getStartDate(filters.period));

  if (filters.marketplace && filters.marketplace !== "all") {
    filtered = filtered.eq("marketplace", filters.marketplace);
  }

  if (filters.status && filters.status !== "all") {
    filtered = filtered.eq("reconciliation_status", filters.status);
  }

  return filtered;
}

export async function getDashboardData(filters: DashboardFilters) {
  noStore();
  const supabase = await createClient();
  const db = supabase as any;

  const transactionsQuery = applyTransactionFilters(
    db
      .from("transactions")
      .select("id, external_id, marketplace, amount, currency, status, reconciliation_status, transaction_date")
      .order("transaction_date", { ascending: false })
      .limit(50),
    filters
  );

  const allTransactionsQuery = applyTransactionFilters(
    db
      .from("transactions")
      .select("amount, expected_amount, reconciliation_status, marketplace, transaction_date"),
    filters
  );

  const [recentTransactions, allTransactions, discrepancies, imports, marketplaces] = await Promise.all([
    transactionsQuery,
    allTransactionsQuery,
    db
      .from("discrepancies")
      .select("id, type, description, expected_value, actual_value, severity, status, created_at")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(6),
    db
      .from("imports")
      .select("id, file_name, status, total_rows, discrepancy_count, created_at")
      .order("created_at", { ascending: false })
      .limit(8),
    db.from("transactions").select("marketplace").order("marketplace")
  ]);

  if (recentTransactions.error) throw recentTransactions.error;
  if (allTransactions.error) throw allTransactions.error;
  if (discrepancies.error) throw discrepancies.error;
  if (imports.error) throw imports.error;
  if (marketplaces.error) throw marketplaces.error;

  const rows = (allTransactions.data ?? []) as DashboardAggregateRow[];
  const total = rows.length;
  const discrepancyCount = rows.filter((row) => row.reconciliation_status === "discrepancy").length;
  const revenue = rows.reduce((sum, row) => sum + Number(row.amount ?? 0), 0);
  const successRate = total === 0 ? 0 : (total - discrepancyCount) / total;
  const marketplaceOptions = Array.from(
    new Set((marketplaces.data ?? []).map((row: { marketplace?: string }) => row.marketplace).filter(Boolean))
  ) as string[];

  return {
    discrepancies: (discrepancies.data ?? []) as DashboardDiscrepancy[],
    imports: imports.data ?? [],
    marketplaceOptions,
    stats: {
      discrepancyCount,
      revenue,
      successRate,
      total
    },
    transactions: (recentTransactions.data ?? []) as DashboardTransaction[]
  };
}
