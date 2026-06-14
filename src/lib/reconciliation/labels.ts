import type {
  DiscrepancySeverity,
  DiscrepancyType,
  ReconciliationStatus,
  TransactionStatus,
  TransactionType
} from "./types";

export function getReconciliationStatusLabel(status: ReconciliationStatus) {
  switch (status) {
    case "matched":
      return "Conciliado";
    case "discrepancy":
      return "Divergência";
    case "unmatched":
      return "Não conciliado";
  }
}

export function getDiscrepancyStatusLabel(status: "open" | "resolved" | "investigating") {
  switch (status) {
    case "open":
      return "Aberta";
    case "resolved":
      return "Resolvida";
    case "investigating":
      return "Em análise";
  }
}

export function getSeverityLabel(severity: DiscrepancySeverity) {
  switch (severity) {
    case "high":
      return "Alta";
    case "medium":
      return "Média";
    case "low":
      return "Baixa";
  }
}

export function getTransactionStatusLabel(status: TransactionStatus) {
  switch (status) {
    case "completed":
      return "Concluído";
    case "pending":
      return "Pendente";
    case "failed":
      return "Falha";
    case "cancelled":
      return "Cancelado";
  }
}

export function getTransactionTypeLabel(type: TransactionType) {
  switch (type) {
    case "sale":
      return "Venda";
    case "refund":
      return "Reembolso";
    case "chargeback":
      return "Estorno";
    case "adjustment":
      return "Ajuste";
  }
}

export function getDiscrepancyTypeLabel(type: DiscrepancyType) {
  switch (type) {
    case "amount_mismatch":
      return "Valor diferente";
    case "duplicate":
      return "Duplicidade";
    case "invalid_row":
      return "Linha inválida";
    case "late":
      return "Atraso";
    case "missing":
      return "Ausente";
    case "status_issue":
      return "Problema de status";
    case "other":
      return "Outro";
  }
}

export function getImportStatusLabel(status: "uploaded" | "processing" | "completed" | "failed") {
  switch (status) {
    case "uploaded":
      return "Enviado";
    case "processing":
      return "Processando";
    case "completed":
      return "Concluído";
    case "failed":
      return "Falha";
  }
}
