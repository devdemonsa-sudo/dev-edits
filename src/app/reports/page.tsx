import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { ConfigurationRequired } from "@/components/configuration-required";
import { getReportsData } from "@/lib/data/reports";
import { formatCurrency, formatDate } from "@/lib/format";
import { getImportStatusLabel } from "@/lib/reconciliation/labels";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

type ReportsPageProps = {
  searchParams: Promise<{
    recent?: string;
  }>;
};

export default async function ReportsPage({ searchParams }: ReportsPageProps) {
  const auth = await getAuthenticatedUser();

  if (!auth.configured) {
    return <ConfigurationRequired />;
  }

  const filters = await searchParams;
  const data = await getReportsData();
  const recentImport = filters.recent ? data.imports.find((item) => item.id === filters.recent) : undefined;
  const openDiscrepancies = data.discrepancies.filter((item) => item.status === "open");
  const totalImpact = openDiscrepancies.reduce(
    (sum, item) => sum + Math.abs(Number(item.actual_value ?? 0) - Number(item.expected_value ?? 0)),
    0
  );

  return (
    <AppShell active="reports" email={auth.user.email}>
      <div className="dashboard-topbar">
        <div>
          <span className="eyebrow">Relatórios</span>
          <h1>Resumo de conciliação</h1>
        </div>
        <div className="quick-actions">
          <Link className="button button-plan" href="/api/reports/discrepancies">
            Exportar CSV
          </Link>
          <Link className="button app-secondary" href="/upload">
            Importar outro CSV
          </Link>
        </div>
      </div>
      {recentImport ? (
        <section className="recent-import-banner">
          <div>
            <span className="eyebrow">Importação concluída</span>
            <h2>{recentImport.file_name}</h2>
            <p>
              {recentImport.processed_rows} linhas processadas, {recentImport.discrepancy_count} divergências e relatório
              automático pronto para download.
            </p>
          </div>
          <div className="recent-import-actions">
            <span>{getImportStatusLabel(recentImport.status)}</span>
            <Link className="button button-plan" href={`/reports/${recentImport.id}`}>
              Abrir relatório
            </Link>
          </div>
        </section>
      ) : null}
      <div className="stats-grid">
        <article className="stat-card">
          <span>Importações</span>
          <strong>{data.imports.length}</strong>
          <small>últimos envios</small>
        </article>
        <article className="stat-card">
          <span>Divergências abertas</span>
          <strong>{openDiscrepancies.length}</strong>
          <small>itens pendentes</small>
        </article>
        <article className="stat-card">
          <span>Impacto em aberto</span>
          <strong>{formatCurrency(totalImpact)}</strong>
          <small>valor que ainda precisa revisão</small>
        </article>
        <article className="stat-card">
          <span>Relatório</span>
          <strong>CSV</strong>
          <small>gerado automaticamente</small>
        </article>
      </div>
      <section className="table-shell dashboard-table">
        <div className="table-toolbar">
          <strong>Histórico de importações</strong>
          <span>Relatórios disponíveis</span>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Arquivo</th>
                <th>Status</th>
                <th>Linhas</th>
                <th>Divergências</th>
                <th>Relatório</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {data.imports.map((item) => (
                <tr key={item.id} className={item.id === filters.recent ? "table-row-highlight" : undefined}>
                  <td>{item.file_name}</td>
                  <td>{getImportStatusLabel(item.status)}</td>
                  <td>
                    {item.processed_rows}/{item.total_rows}
                  </td>
                  <td>{item.discrepancy_count}</td>
                  <td>
                    {item.report_path ? (
                      <Link className="table-link" href={`/reports/${item.id}`}>
                        Abrir relatório
                      </Link>
                    ) : (
                      "Aguardando"
                    )}
                  </td>
                  <td>{formatDate(item.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
