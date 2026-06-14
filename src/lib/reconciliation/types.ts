export type TransactionType = "adjustment" | "chargeback" | "refund" | "sale";
export type TransactionStatus = "cancelled" | "completed" | "failed" | "pending";
export type ReconciliationStatus = "discrepancy" | "matched" | "unmatched";
export type DiscrepancySeverity = "high" | "low" | "medium";
export type DiscrepancyType =
  | "amount_mismatch"
  | "duplicate"
  | "invalid_row"
  | "late"
  | "missing"
  | "status_issue"
  | "other";

export type ParsedTransaction = {
  amount: number;
  currency: string;
  date: string;
  expected_amount: number;
  external_id: string;
  marketplace: string;
  reconciliation_status: ReconciliationStatus;
  status: TransactionStatus;
  type: TransactionType;
};

export type ParsedDiscrepancy = {
  actual_value: number | null;
  description: string;
  expected_value: number | null;
  external_id: string | null;
  severity: DiscrepancySeverity;
  type: DiscrepancyType;
};

export type ParseCsvResult = {
  discrepancies: ParsedDiscrepancy[];
  errors: string[];
  requiredColumns: string[];
  transactions: ParsedTransaction[];
};
