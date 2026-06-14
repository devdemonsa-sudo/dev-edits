import { unstable_noStore as noStore } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import type { DiscrepancySeverity } from "@/lib/reconciliation/types";

type ImportStatus = "uploaded" | "processing" | "completed" | "failed";
type DiscrepancyStatus = "open" | "resolved" | "investigating";

type ReportImport = {
  created_at: string;
  discrepancy_count: number;
  file_name: string;
  id: string;
  processed_rows: number;
  report_generated_at: string | null;
  report_path: string | null;
  status: ImportStatus;
  total_rows: number;
};

type ReportDiscrepancy = {
  actual_value: number | null;
  created_at: string;
  description: string;
  expected_value: number | null;
  id: string;
  severity: DiscrepancySeverity;
  status: DiscrepancyStatus;
  type: string;
};

export type ReportImportDetail = {
  discrepancies: ReportDiscrepancy[];
  importRow: ReportImport;
};

export async function getReportsData() {
  noStore();
  const supabase = await createClient();

  const [imports, discrepancies] = await Promise.all([
    supabase
      .from("imports")
      .select("id, file_name, status, total_rows, processed_rows, discrepancy_count, report_generated_at, report_path, created_at")
      .order("created_at", { ascending: false })
      .limit(20),
    supabase
      .from("discrepancies")
      .select("id, type, description, expected_value, actual_value, severity, status, created_at")
      .order("created_at", { ascending: false })
      .limit(200)
  ]);

  if (imports.error) throw imports.error;
  if (discrepancies.error) throw discrepancies.error;

  return {
    discrepancies: (discrepancies.data ?? []) as ReportDiscrepancy[],
    imports: (imports.data ?? []) as ReportImport[]
  };
}

export async function getReportImportDetail(importId: string) {
  noStore();
  const supabase = await createClient();

  const [importResult, discrepancyResult] = await Promise.all([
    supabase
      .from("imports")
      .select("id, file_name, status, total_rows, processed_rows, discrepancy_count, report_generated_at, report_path, created_at")
      .eq("id", importId)
      .single(),
    supabase
      .from("discrepancies")
      .select("id, type, description, expected_value, actual_value, severity, status, created_at")
      .eq("import_id", importId)
      .order("created_at", { ascending: false })
  ]);

  if (importResult.error) throw importResult.error;
  if (discrepancyResult.error) throw discrepancyResult.error;

  return {
    discrepancies: (discrepancyResult.data ?? []) as ReportDiscrepancy[],
    importRow: importResult.data as ReportImport
  } satisfies ReportImportDetail;
}
