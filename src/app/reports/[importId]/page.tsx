import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ConfigurationRequired } from "@/components/configuration-required";
import { PrintReportButton } from "@/components/print-report-button";
import { getReportImportDetail } from "@/lib/data/reports";
import { formatCurrency, formatDate } from "@/lib/format";
import { getDiscrepancyStatusLabel, getImportStatusLabel, getSeverityLabel } from "@/lib/reconciliation/labels";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

type ReportDetailPageProps = {
  params: Promise<{
    importId: string;
  }>;
};

export default async function ReportDetailPage({ params }: ReportDetailPageProps) {
  const auth = await getAuthenticatedUser();

  if (!auth.configured) {
    return <ConfigurationRequired />;
  }

  const { importId } = await params;
  const data = await getReportImportDetail(importId);
  const impactValue = data.discrepancies.reduce(
    (sum, item) => sum + Math.abs(Number(item.actual_value ?? 0) - Number(item.expected_value ?? 0)),
    0
  );

  return (
    <AppShell active="reports" email={auth.user.email}>
      <div className="report-detail-shell">
        <div className="dashboard-topbar report-detail-header">
          <div>
            <span className="eyebrow">Relatório detalhado</span>
            <h1>{data.importRow.file_name}</h1>
            <p className="report-detail-subtitle">
              {data.importRow.processed_rows} linhas processadas, {data.importRow.discrepancy_count} divergências e
              relatório automático pronto para compartilhamento.
            </p>
          </div>
          <div className="quick-actions report-detail-actions">
            <Link className="button button-plan" href={`/api/reports/imports/${data.importRow.id}`}>
              Baixar CSV
            </Link>
            <PrintReportButton />
            <Link className="button app-secondary" href={`/reports?recent=${data.importRow.id}`}>
              Voltar
            </Link>
          </div>
        </div>

        <div className="stats-grid">
          <article className="stat-card">
            <span>Status</span>
            <strong>{getImportStatusLabel(data.importRow.status)}</strong>
            <small>{formatDate(data.importRow.created_at)}</small>
          </article>
          <article className="stat-card">
            <span>Linhas processadas</span>
            <strong>{data.importRow.processed_rows}</strong>
            <small>de {data.importRow.total_rows}</small>
          </article>
          <article className="stat-card">
            <span>Divergências</span>
            <strong>{data.importRow.discrepancy_count}</strong>
            <small>itens abertos</small>
          </article>
          <article className="stat-card">
            <span>Impacto estimado</span>
            <strong>{formatCurrency(impactValue)}</strong>
            <small>valor a revisar</small>
          </article>
        </div>

        <section className="table-shell dashboard-table report-detail-table">
          <div className="table-toolbar">
            <strong>Divergências encontradas</strong>
            <span>{data.discrepancies.length} itens</span>
          </div>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Tipo</th>
                  <th>Severidade</th>
                  <th>Status</th>
                  <th>Esperado</th>
                  <th>Atual</th>
                  <th>Descrição</th>
                  <th>Data</th>
                </tr>
              </thead>
              <tbody>
                {data.discrepancies.map((item) => (
                  <tr key={item.id}>
                    <td>{item.type}</td>
                    <td>{getSeverityLabel(item.severity)}</td>
                    <td>{getDiscrepancyStatusLabel(item.status)}</td>
                    <td>{formatCurrency(Number(item.expected_value ?? 0))}</td>
                    <td>{formatCurrency(Number(item.actual_value ?? 0))}</td>
                    <td>{item.description}</td>
                    <td>{formatDate(item.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {data.discrepancies.length === 0 ? (
            <section className="empty-state">
              <h2>Nenhuma divergência nesta importação.</h2>
              <p>Esse arquivo foi conciliado sem pendências, então você já pode compartilhar ou arquivar o resultado.</p>
            </section>
          ) : null}
        </section>
      </div>
    </AppShell>
  );
}
