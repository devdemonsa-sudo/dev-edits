import Link from "next/link";

const kpis = [
  { label: "Transações importadas", value: "1.248", note: "últimos 30 dias" },
  { label: "Divergências abertas", value: "37", note: "prontas para revisão" },
  { label: "Receita conciliada", value: "R$ 184.920", note: "valor auditado" },
  { label: "Taxa de sucesso", value: "98,7%", note: "sem ruído operacional" }
] as const;

const transactions = [
  ["PED-1001", "Amazon", "R$ 120,50", "Conciliado", "OK"],
  ["PED-1002", "Shopee", "R$ 90,00", "Divergência", "Valor abaixo"],
  ["PED-1003", "Shopify", "R$ 250,00", "Conciliado", "OK"],
  ["PED-1004", "Mercado Livre", "R$ 80,00", "Não conciliado", "Chargeback"],
  ["PED-1005", "Stripe", "R$ 430,00", "Em análise", "Aguardando retorno"]
] as const;

const alerts = [
  { title: "Taxa fora do contrato", description: "A comissão do Mercado Livre ficou acima do previsto neste import." },
  { title: "Duplicidade detectada", description: "O mesmo pedido foi importado duas vezes e ficou marcado para revisão manual." },
  { title: "Chargeback aberto", description: "A transação PED-1004 foi classificada como não conciliada e entra no relatório." }
] as const;

export function RepasseCheckDemo() {
  return (
    <main className="dashboard-page public-demo-page">
      <aside className="sidebar">
        <Link className="brand sidebar-brand" href="/">
          <span className="brand-mark">RC</span>
          <span>RepasseCheck</span>
        </Link>
        <nav className="side-nav" aria-label="Navegação da demonstração">
          <a className="active" href="#visao-geral">Visão geral</a>
          <a href="#importacao">Upload CSV</a>
          <a href="#transacoes">Transações</a>
          <a href="#divergencias">Divergências</a>
          <a href="#relatorios">Relatórios</a>
        </nav>
        <div className="sidebar-account">
          <span>Demonstração pública</span>
          <a
            className="button button-plan"
            href="https://wa.me/5594987771476?text=Ola%2C%20quero%20uma%20demo%20do%20RepasseCheck"
          >
            Falar no WhatsApp
          </a>
        </div>
      </aside>

      <section className="dashboard-main">
        <div className="demo-hero" id="visao-geral">
          <div>
            <span className="eyebrow">Demonstração pública</span>
            <h1>Conciliação de recebimentos em tempo real</h1>
            <p>
              Veja como o RepasseCheck identifica diferenças entre vendas, repasses e gateways antes que o problema
              vire prejuízo.
            </p>
          </div>
          <div className="demo-actions">
            <Link className="button button-plan" href="/login">
              Entrar no sistema
            </Link>
            <Link className="button button-secondary app-secondary" href="/upload">
              Testar com CSV
            </Link>
          </div>
        </div>

        <div className="demo-banner" id="importacao">
          <div>
            <span className="eyebrow">Fluxo guiado</span>
            <h2>Importe um CSV, veja a análise e exporte o relatório.</h2>
            <p>
              Abaixo está um exemplo visual da tela que seus clientes vão usar para subir extratos e acompanhar
              inconsistências.
            </p>
          </div>
          <Link className="button button-primary" href="/upload">
            Importar CSV agora
          </Link>
        </div>

        <div className="stats-grid" aria-label="Indicadores da demonstração">
          {kpis.map((item) => (
            <article className="stat-card" key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
              <small>{item.note}</small>
            </article>
          ))}
        </div>

        <div className="analytics-grid">
          <section className="analytics-panel">
            <div className="panel-heading">
              <strong>Volume conciliado</strong>
              <span>1.248 transações</span>
            </div>
            <div className="wide-chart" aria-label="Gráfico demonstrativo">
              {[42, 58, 51, 74, 66, 88, 79].map((height, index) => (
                <span key={index} style={{ height: `${height}%` }} />
              ))}
            </div>
          </section>

          <section className="analytics-panel accent-panel" id="divergencias">
            <div className="panel-heading">
              <strong>Alertas prioritários</strong>
              <span>3 abertos</span>
            </div>
            <div className="alert-list">
              {alerts.map((alert) => (
                <p key={alert.title}>
                  <strong>{alert.title}</strong>
                  {` ${alert.description}`}
                </p>
              ))}
            </div>
          </section>
        </div>

        <section className="table-shell dashboard-table" id="transacoes">
          <div className="table-toolbar">
            <strong>Transações recentes</strong>
            <a href="/reports">Ver relatórios</a>
          </div>
          <div className="responsive-table">
            <table>
              <thead>
                <tr>
                  <th>Pedido</th>
                  <th>Canal</th>
                  <th>Valor</th>
                  <th>Status</th>
                  <th>Motivo</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(([id, channel, value, status, reason]) => (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{channel}</td>
                    <td>{value}</td>
                    <td>
                      <span className={`status ${status === "Conciliado" ? "ok" : status === "Divergência" ? "risk" : "wait"}`}>
                        {status}
                      </span>
                    </td>
                    <td>{reason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="demo-footer-panel" id="relatorios">
          <div>
            <span className="eyebrow">Relatórios automáticos</span>
            <h2>O visitante entende o produto sem precisar fazer login.</h2>
            <p>
              Esta tela já mostra o tipo de análise, alertas e resumo operacional que o cliente verá depois da
              importação real do CSV.
            </p>
          </div>
          <div className="demo-footer-actions">
            <Link className="button button-plan" href="/register">
              Criar conta
            </Link>
            <a className="button button-secondary" href="mailto:dev.demonsa@gmail.com">
              Solicitar contato
            </a>
          </div>
        </section>
      </section>
    </main>
  );
}
