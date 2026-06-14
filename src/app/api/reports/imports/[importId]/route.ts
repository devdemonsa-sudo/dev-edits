import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getSupabaseConfig } from "@/lib/supabase/config";

type RouteContext = {
  params: Promise<{
    importId: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  if (!getSupabaseConfig().isConfigured) {
    return NextResponse.json({ error: "Supabase não configurado." }, { status: 503 });
  }

  const { importId } = await context.params;
  const supabase = await createClient();
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims();
  const userId = claimsData?.claims?.sub;

  if (claimsError || !userId) {
    return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
  }

  const { data: importRow, error: importError } = await supabase
    .from("imports")
    .select("id, file_name, report_path")
    .eq("id", importId)
    .single();

  if (importError || !importRow) {
    return NextResponse.json({ error: "Importação não encontrada." }, { status: 404 });
  }

  if (!importRow.report_path) {
    return NextResponse.json({ error: "Relatório ainda não foi gerado." }, { status: 404 });
  }

  const { data, error } = await supabase.storage.from("transaction-imports").download(importRow.report_path);

  if (error || !data) {
    return NextResponse.json({ error: error?.message ?? "Não foi possível baixar o relatório." }, { status: 500 });
  }

  return new Response(data, {
    headers: {
      "Content-Disposition": `attachment; filename="${importRow.file_name.replace(/\.[^.]+$/, "")}-relatorio.csv"`,
      "Content-Type": "text/csv; charset=utf-8"
    }
  });
}
