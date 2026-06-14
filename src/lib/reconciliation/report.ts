import type { ParsedDiscrepancy, ParsedTransaction } from "./types";

export type GeneratedReport = {
  csv: string;
  fileName: string;
  rowCount: number;
};

type ReportRow = {
  actual_value: string;
  description: string;
  discrepancy_count: string;
  impact_value: string;
  expected_value: string;
  external_id: string;
  file_name: string;
  generated_at: string;
  import_id: string;
  marketplace: string;
  processed_rows: string;
  report_type: string;
  severity: string;
  status: string;
  status_label: string;
  total_rows: string;
  transaction_type: string;
  type: string;
};

function csvEscape(value: string | number | null | undefined) {
  const text = String(value ?? "");
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function makeHeader() {
  return [
    "report_type",
    "import_id",
    "file_name",
    "generated_at",
    "total_rows",
    "processed_rows",
    "discrepancy_count",
    "impact_value",
    "type",
    "severity",
    "status",
    "status_label",
    "transaction_type",
    "marketplace",
    "external_id",
    "description",
    "expected_value",
    "actual_value"
  ];
}

export function buildImportReportCsv(params: {
  discrepancies: ParsedDiscrepancy[];
  fileName: string;
  importId: string;
  processedRows: number;
  totalRows: number;
  transactions: ParsedTransaction[];
}) : GeneratedReport {
  const generatedAt = new Date().toISOString();
  const header = makeHeader();
  const impactValue = params.discrepancies.reduce((sum, discrepancy) => {
    const expected = Number(discrepancy.expected_value ?? 0);
    const actual = Number(discrepancy.actual_value ?? 0);
    return sum + Math.abs(actual - expected);
  }, 0);

  const summaryRow: ReportRow = {
    actual_value: "",
    description: "Resumo automático da importação",
    discrepancy_count: String(params.discrepancies.length),
    impact_value: String(impactValue.toFixed(2)),
    expected_value: "",
    external_id: "",
    file_name: params.fileName,
    generated_at: generatedAt,
    import_id: params.importId,
    marketplace: "",
    processed_rows: String(params.processedRows),
    report_type: "summary",
    severity: "",
    status: "concluido",
    status_label: "Concluído",
    total_rows: String(params.totalRows),
    transaction_type: "",
    type: ""
  };

  const discrepancyRows: ReportRow[] = params.discrepancies.map((discrepancy) => {
    const relatedTransaction = params.transactions.find((transaction) => transaction.external_id === discrepancy.external_id);

    return {
      actual_value: String(discrepancy.actual_value ?? ""),
      description: discrepancy.description,
      discrepancy_count: String(params.discrepancies.length),
      impact_value: String(Math.abs(Number(discrepancy.actual_value ?? 0) - Number(discrepancy.expected_value ?? 0)).toFixed(2)),
      expected_value: String(discrepancy.expected_value ?? ""),
      external_id: discrepancy.external_id ?? "",
      file_name: params.fileName,
      generated_at: generatedAt,
      import_id: params.importId,
      marketplace: relatedTransaction?.marketplace ?? "",
      processed_rows: String(params.processedRows),
      report_type: "discrepancy",
      severity: discrepancy.severity,
      status: "aberto",
      status_label: "Aberta",
      total_rows: String(params.totalRows),
      transaction_type: relatedTransaction?.type ?? "",
      type: discrepancy.type
    };
  });

  const rows = [summaryRow, ...discrepancyRows];
  const csv = [
    header.join(","),
    ...rows.map((row) => header.map((field) => csvEscape(row[field as keyof ReportRow])).join(","))
  ].join("\n");

  return {
    csv,
    fileName: `relatorio-repassecheck-${params.fileName.replace(/\.[^.]+$/, "")}-${params.importId}.csv`,
    rowCount: rows.length
  };
}
