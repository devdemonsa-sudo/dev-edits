import { parse } from "papaparse";
import type {
  DiscrepancySeverity,
  ParsedDiscrepancy,
  ParsedTransaction,
  ParseCsvResult,
  ReconciliationStatus,
  TransactionStatus,
  TransactionType
} from "./types";

const requiredColumns = [
  "external_id",
  "marketplace",
  "type",
  "amount",
  "expected_amount",
  "currency",
  "status",
  "date"
];

const validTypes = new Set<TransactionType>(["adjustment", "chargeback", "refund", "sale"]);
const validStatuses = new Set<TransactionStatus>(["cancelled", "completed", "failed", "pending"]);

type CsvRow = Record<string, unknown>;

function normalizeHeader(value: string) {
  return value.trim().toLowerCase();
}

function normalizeText(value: unknown) {
  return String(value ?? "").trim();
}

function parseMoney(value: unknown) {
  const raw = normalizeText(value)
    .replace(/\s/g, "")
    .replace("R$", "")
    .replace(/\.(?=\d{3}(?:\D|$))/g, "")
    .replace(",", ".");
  const amount = Number(raw);
  return Number.isFinite(amount) ? amount : Number.NaN;
}

function getReconciliationStatus(amount: number, expectedAmount: number, hasIssue: boolean): ReconciliationStatus {
  if (hasIssue) {
    return "discrepancy";
  }

  return Math.abs(amount - expectedAmount) > 0.009 ? "discrepancy" : "matched";
}

function getSeverity(diff: number, status: TransactionStatus, type: TransactionType): DiscrepancySeverity {
  if (status === "failed" || status === "cancelled" || type === "chargeback" || Math.abs(diff) >= 500) {
    return "high";
  }

  if (Math.abs(diff) >= 100) {
    return "medium";
  }

  return "low";
}

function makeDiscrepancy(
  transaction: Partial<ParsedTransaction>,
  type: ParsedDiscrepancy["type"],
  description: string,
  severity: DiscrepancySeverity,
  expectedValue: number | null,
  actualValue: number | null
): ParsedDiscrepancy {
  return {
    actual_value: actualValue,
    description,
    expected_value: expectedValue,
    external_id: transaction.external_id ?? null,
    severity,
    type
  };
}

export function parseTransactionsCsv(csvText: string): ParseCsvResult {
  const parsed = parse<CsvRow>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: normalizeHeader
  });

  const fields = parsed.meta.fields ?? [];
  const missingColumns = requiredColumns.filter((column) => !fields.includes(column));

  if (missingColumns.length > 0) {
    return {
      discrepancies: [],
      errors: [`Colunas obrigatorias ausentes: ${missingColumns.join(", ")}`],
      requiredColumns,
      transactions: []
    };
  }

  const seen = new Set<string>();
  const discrepancies: ParsedDiscrepancy[] = [];
  const transactions: ParsedTransaction[] = [];
  const errors: string[] = parsed.errors.map((error) => `Linha ${error.row ?? "-"}: ${error.message}`);

  parsed.data.forEach((row, index) => {
    const externalId = normalizeText(row.external_id);
    const marketplace = normalizeText(row.marketplace);
    const type = normalizeText(row.type).toLowerCase() as TransactionType;
    const status = normalizeText(row.status).toLowerCase() as TransactionStatus;
    const currency = normalizeText(row.currency).toUpperCase() || "BRL";
    const date = normalizeText(row.date);
    const amount = parseMoney(row.amount);
    const expectedAmount = parseMoney(row.expected_amount);
    const rowNumber = index + 2;
    const invalidReasons: string[] = [];

    if (!externalId) invalidReasons.push("external_id vazio");
    if (!marketplace) invalidReasons.push("marketplace vazio");
    if (!validTypes.has(type)) invalidReasons.push("type invalido");
    if (!validStatuses.has(status)) invalidReasons.push("status invalido");
    if (!Number.isFinite(amount)) invalidReasons.push("amount invalido");
    if (!Number.isFinite(expectedAmount)) invalidReasons.push("expected_amount invalido");
    if (!date || Number.isNaN(Date.parse(date))) invalidReasons.push("date invalida");

    const hasInvalidRow = invalidReasons.length > 0;
    const transaction: ParsedTransaction = {
      amount: Number.isFinite(amount) ? amount : 0,
      currency,
      date: !Number.isNaN(Date.parse(date)) ? new Date(date).toISOString() : new Date().toISOString(),
      expected_amount: Number.isFinite(expectedAmount) ? expectedAmount : 0,
      external_id: externalId || `linha-${rowNumber}`,
      marketplace: marketplace || "Indefinido",
      reconciliation_status: "unmatched",
      status: validStatuses.has(status) ? status : "pending",
      type: validTypes.has(type) ? type : "adjustment"
    };

    const dedupeKey = `${transaction.marketplace.toLowerCase()}::${transaction.external_id.toLowerCase()}`;
    const isDuplicate = seen.has(dedupeKey);
    seen.add(dedupeKey);

    const diff = transaction.amount - transaction.expected_amount;
    const hasAmountMismatch = Math.abs(diff) > 0.009;
    const hasStatusIssue =
      transaction.status === "failed" ||
      transaction.status === "cancelled" ||
      transaction.type === "chargeback";
    transaction.reconciliation_status = getReconciliationStatus(
      transaction.amount,
      transaction.expected_amount,
      hasInvalidRow || isDuplicate || hasStatusIssue
    );

    transactions.push(transaction);

    if (hasInvalidRow) {
      discrepancies.push(
        makeDiscrepancy(
          transaction,
          "invalid_row",
          `Linha ${rowNumber}: ${invalidReasons.join(", ")}`,
          "high",
          null,
          null
        )
      );
    }

    if (isDuplicate) {
      discrepancies.push(
        makeDiscrepancy(
          transaction,
          "duplicate",
          `Transacao duplicada para ${transaction.marketplace}: ${transaction.external_id}`,
          "medium",
          transaction.expected_amount,
          transaction.amount
        )
      );
    }

    if (hasAmountMismatch) {
      discrepancies.push(
        makeDiscrepancy(
          transaction,
          "amount_mismatch",
          `Valor recebido difere do esperado em ${currency} ${Math.abs(diff).toFixed(2)}`,
          getSeverity(diff, transaction.status, transaction.type),
          transaction.expected_amount,
          transaction.amount
        )
      );
    }

    if (hasStatusIssue) {
      discrepancies.push(
        makeDiscrepancy(
          transaction,
          "status_issue",
          `Status ou tipo exige revisao: ${transaction.type}/${transaction.status}`,
          getSeverity(diff, transaction.status, transaction.type),
          transaction.expected_amount,
          transaction.amount
        )
      );
    }
  });

  return {
    discrepancies,
    errors,
    requiredColumns,
    transactions
  };
}

export { requiredColumns };
