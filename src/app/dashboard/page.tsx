import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

const kpis = [
  { label: "Transações processadas", value: "1.248", note: "últimos 30 dias" },
  { label: "Divergências abertas", value: "37", note: "prontas para revisão" },
  { label: "Receita conciliada", value: "R$ 184.920", note: "valor auditado" },
  { label: "Taxa de sucesso", value: "98,7%", note: "sem ruído operacional" }
] as const;

const recentTransactions = [
  ["PED-1001", "Amazon", "R$ 120,50", "Conciliado"],
  ["PED-1002", "Shopee", "R$ 90,00", "Divergência"],
  ["PED-1003", "Shopify", "R$ 250,00", "Conciliado"],
  ["PED-1004", "Mercado Livre", "R$ 80,00", "Não conciliado"]
] as const;

export default async function DashboardPage() {
  const auth = await getAuthenticatedUser();

  return (
    <AppShell active="dashboard" email={auth.user?.email}>
      <div className="page-head">
        <div>
          <span className="eyebrow">Dashboard</span>
          <h1>Conciliação de recebimentos</h1>
          <p>Visão operacional do RepasseCheck com atalho para CSV, relatórios e testes de login.</p>
        </div>
        <div className="page-actions">
          <Link className="button button-secondary" href="/integration-tests">
            Testar logins
          </Link>
          <Link className="button button-secondary" href="/upload">
            Importar CSV
          </Link>
          <Link className="button button-primary" href="/reports">
            Ver relatórios
          </Link>
        </div>
      </div>

      <section className="metric-grid">
        {kpis.map((item) => (
          <article className="metric-card" key={item.label}>
            <span>{item.label}</span>
            <strong>{item.value}</strong>
            <small>{item.note}</small>
          </article>
        ))}
      </section>

      <section className="dashboard-grid">
        <article className="panel-card">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Próximos passos</span>
              <h2>Fluxo pronto para operação</h2>
            </div>
          </div>
          <div className="flow-list">
            <div className="flow-item">
              <span className="flow-dot flow-completed" />
              <div>
                <strong>Importar CSV</strong>
                <small>Suba o arquivo e gere o relatório automaticamente.</small>
              </div>
            </div>
            <div className="flow-item">
              <span className="flow-dot flow-running" />
              <div>
                <strong>Validar integrações</strong>
                <small>Acesse a área de teste para conectar plataformas por login.</small>
              </div>
            </div>
            <div className="flow-item">
              <span className="flow-dot flow-scheduled" />
              <div>
                <strong>Exportar relatório</strong>
                <small>Compartilhe os resultados com a equipe financeira.</small>
              </div>
            </div>
          </div>
        </article>

        <article className="panel-card panel-accent">
          <div className="panel-head">
            <div>
              <span className="eyebrow">Login de teste</span>
              <h2>Área dedicada para validar plataformas</h2>
            </div>
          </div>
          <div className="schedule-stack">
            <div className="schedule-row">
              <div>
                <strong>Plataformas oficializadas</strong>
                <small>Shopify, eBay, Stripe e PayPal</small>
              </div>
              <Link className="button button-plan" href="/integration-tests">Abrir</Link>
            </div>
            <div className="schedule-row">
              <div>
                <strong>Próxima etapa</strong>
                <small>Magalu</small>
              </div>
              <Link className="button button-plan" href="/integrations">Ver</Link>
            </div>
          </div>
        </article>
      </section>

      <section className="table-card">
        <div className="table-head">
          <strong>Transações recentes</strong>
          <Link href="/transactions">Abrir tudo</Link>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Pedido</th>
                <th>Canal</th>
                <th>Valor</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recentTransactions.map(([id, channel, value, status]) => (
                <tr key={id}>
                  <td>{id}</td>
                  <td>{channel}</td>
                  <td>{value}</td>
                  <td>
                    <span className={`status-pill ${status === "Conciliado" ? "status-completed" : "status-running"}`}>
                      {status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
