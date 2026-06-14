import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  return `"${text.replace(/"/g, '""')}"`;
}

export async function GET() {
  if (!getSupabaseConfig().isConfigured) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();

  if (claimsError || !claimsData?.claims?.sub) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("discrepancies")
    .select("id, type, description, expected_value, actual_value, severity, status, created_at")
    .order("created_at", { ascending: false });

  if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const rows = data ?? [];
  const header = ["id", "type", "description", "expected_value", "actual_value", "severity", "status", "created_at"];
  const csv = [
    header.join(","),
    ...rows.map((row) => header.map((field) => csvEscape(row[field as keyof typeof row])).join(","))
  ].join("\n");

  return new Response(csv, {
    headers: {
      "Content-Disposition": "attachment; filename=repassecheck-divergencias.csv",
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
