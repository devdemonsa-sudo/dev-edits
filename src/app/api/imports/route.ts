import { NextResponse } from "next/server";
import { parseTransactionsCsv } from "@/lib/reconciliation/csv";
import { buildImportReportCsv } from "@/lib/reconciliation/report";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!getSupabaseConfig().isConfigured) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const formData = await request.formData();
  const file = formData.get("file");

  if (!(file instanceof File)) {
    return NextResponse.json({ error: "Arquivo CSV não enviado." }, { status: 400 });
  }

  if (!file.name.toLowerCase().endsWith(".csv")) {
    return NextResponse.json({ error: "Envie um arquivo .csv." }, { status: 400 });
  }

  const csvText = await file.text();
  const parsed = parseTransactionsCsv(csvText);
  const impactValue = parsed.discrepancies.reduce((sum, discrepancy) => {
    const expected = Number(discrepancy.expected_value ?? 0);
    const actual = Number(discrepancy.actual_value ?? 0);
    return sum + Math.abs(actual - expected);
  }, 0);

  if (parsed.errors.length > 0 && parsed.transactions.length === 0) {
    return NextResponse.json({ error: parsed.errors.join(" ") }, { status: 400 });
  }

  const importId = crypto.randomUUID();
  const storagePath = `${userId}/${importId}/${file.name}`;

  const upload = await supabase.storage.from("transaction-imports").upload(storagePath, file, {
    contentType: file.type || "text/csv",
    upsert: false
  });

  if (upload.error) {
    return NextResponse.json({ error: upload.error.message }, { status: 500 });
  }

  const { error: importError } = await supabase.from("imports").insert({
    discrepancy_count: parsed.discrepancies.length,
    file_name: file.name,
    id: importId,
    processed_rows: parsed.transactions.length,
    status: "completed",
    storage_path: storagePath,
    total_rows: parsed.transactions.length,
    user_id: userId
  });

  if (importError) {
    return NextResponse.json({ error: importError.message }, { status: 500 });
  }

  const transactionRows = parsed.transactions.map((transaction) => ({
    id: crypto.randomUUID(),
    import_id: importId,
    amount: transaction.amount,
    date: transaction.date,
    currency: transaction.currency,
    metadata: {},
    expected_amount: transaction.expected_amount,
    external_id: transaction.external_id,
    marketplace: transaction.marketplace,
    reconciliation_status: transaction.reconciliation_status,
    status: transaction.status,
    transaction_date: transaction.date,
    type: transaction.type,
    user_id: userId
  }));

  const { data: insertedTransactions, error: transactionsError } = await supabase
    .from("transactions")
    .insert(transactionRows)
    .select("id, external_id, marketplace");

  if (transactionsError) {
    await supabase.from("imports").update({ error_message: transactionsError.message, status: "failed" }).eq("id", importId);
    return NextResponse.json({ error: transactionsError.message }, { status: 500 });
  }

  const transactionMap = new Map(
    (insertedTransactions ?? []).map((transaction) => [
      `${transaction.marketplace.toLowerCase()}::${transaction.external_id.toLowerCase()}`,
      transaction.id
    ])
  );

  if (parsed.discrepancies.length > 0) {
    const discrepancyRows = parsed.discrepancies.map((discrepancy) => {
      const importedTransaction = parsed.transactions.find(
        (transaction) =>
          transaction.external_id === discrepancy.external_id ||
          (!discrepancy.external_id && transaction.reconciliation_status === "discrepancy")
      );
      const key = importedTransaction
        ? `${importedTransaction.marketplace.toLowerCase()}::${importedTransaction.external_id.toLowerCase()}`
        : "";

      return {
        actual_value: discrepancy.actual_value,
        description: discrepancy.description,
        expected_value: discrepancy.expected_value,
        import_id: importId,
        severity: discrepancy.severity,
        status: "open",
        transaction_id: transactionMap.get(key) ?? null,
        type: discrepancy.type,
        user_id: userId
      };
    });

    const { error: discrepanciesError } = await supabase.from("discrepancies").insert(discrepancyRows);

    if (discrepanciesError) {
      await supabase
        .from("imports")
        .update({ error_message: discrepanciesError.message, status: "failed" })
        .eq("id", importId);
      return NextResponse.json({ error: discrepanciesError.message }, { status: 500 });
    }
  }

  const report = buildImportReportCsv({
    discrepancies: parsed.discrepancies,
    fileName: file.name,
    importId,
    processedRows: parsed.transactions.length,
    totalRows: parsed.transactions.length,
    transactions: parsed.transactions
  });

  const reportPath = `${userId}/${importId}/reports/${report.fileName}`;
  const reportUpload = await supabase.storage.from("transaction-imports").upload(reportPath, new Blob([report.csv], { type: "text/csv;charset=utf-8" }), {
    contentType: "text/csv;charset=utf-8",
    upsert: true
  });

  if (reportUpload.error) {
    await supabase.from("imports").update({ error_message: reportUpload.error.message, status: "failed" }).eq("id", importId);
    return NextResponse.json({ error: reportUpload.error.message }, { status: 500 });
  }

  await supabase
    .from("imports")
    .update({ report_generated_at: new Date().toISOString(), report_path: reportPath })
    .eq("id", importId);

  await supabase.from("audit_logs").insert({
    action: "import_completed",
    details: {
      discrepancy_count: parsed.discrepancies.length,
      file_name: file.name,
      processed_rows: parsed.transactions.length
    },
    entity_id: importId,
    entity_type: "import",
    user_id: userId
  });

  return NextResponse.json({
    discrepancyCount: parsed.discrepancies.length,
    impactValue,
    importId,
    processedRows: parsed.transactions.length,
    reportPath,
    totalRows: parsed.transactions.length
  });
}
