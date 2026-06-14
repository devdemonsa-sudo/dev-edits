import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { getSupabaseConfig } from "@/lib/supabase/config";
import { listIntegrationConnections } from "@/lib/data/integrations";
import { formatDate } from "@/lib/format";
import {
  getIntegrationProviderList,
  isManualProvider,
  isPartnerProvider
} from "@/lib/integrations/providers";

type IntegrationsPageProps = {
  searchParams: Promise<{ connected?: string; error?: string }>;
};

export default async function IntegrationsPage({ searchParams }: IntegrationsPageProps) {
  const auth = await getAuthenticatedUser();
  const params = await searchParams;
  const providers = getIntegrationProviderList();
  const configured = getSupabaseConfig().isConfigured;

  if (!configured) {
    return (
      <main className="auth-page">
        <section className="auth-card integrations-auth-card">
          <span className="eyebrow">Integrações</span>
          <h1>Ative o Supabase para salvar conexões.</h1>
          <p>
            A base do app precisa estar conectada ao Supabase para guardar os dados
            de login das plataformas e sincronizar as contas.
          </p>
          <p className="form-message">
            Configure `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`.
          </p>
          <Link className="button button-plan" href="/">
            Voltar para a home
          </Link>
        </section>
      </main>
    );
  }

  const connections = auth.configured ? await listIntegrationConnections() : [];
  const latestByProvider = new Map(connections.map((connection) => [connection.provider, connection]));

  const connectedCount = connections.filter((connection) => connection.status === "connected").length;
  const oauthCount = providers.filter((provider) => provider.authMode === "oauth").length;
  const manualCount = providers.filter((provider) => isManualProvider(provider.key)).length;
  const partnerCount = providers.filter((provider) => isPartnerProvider(provider.key)).length;

  return (
    <AppShell active="integrations" email={auth.configured ? auth.user.email : undefined}>
      <div className="dashboard-topbar integrations-topbar">
        <div>
          <span className="eyebrow">Integrações</span>
          <h1>Conecte plataformas com login oficial ou chave da loja.</h1>
          <p className="report-detail-subtitle">
            Use OAuth quando a plataforma suportar login e use chave manual quando a
            integração for por Consumer Key, Secret ou credenciais do lojista.
          </p>
          <p className="report-detail-subtitle">
            Plataformas em fluxo de parceiro continuam marcadas como onboarding
            assistido até a documentação oficial ou o programa de parceiros estar
            confirmado.
          </p>
          <div className="integration-logo-row" aria-label="Plataformas disponíveis">
            {providers.map((provider) => (
              <span className="integration-logo-pill" key={provider.key}>
                <span className="integration-logo-mark" style={{ background: provider.color }}>
                  {provider.glyph}
                </span>
                <span>{provider.shortLabel}</span>
              </span>
            ))}
          </div>
        </div>
        <div className="quick-actions">
          <Link className="button button-primary" href="/integration-tests">
            Testar logins
          </Link>
          <Link className="button button-plan" href="/dashboard">
            Voltar ao painel
          </Link>
          <Link className="button button-secondary app-secondary" href="/upload">
            Importar CSV
          </Link>
        </div>
      </div>

      {params.connected ? (
        <p className="form-message">Integração conectada com sucesso: {params.connected}</p>
      ) : null}

      {params.error ? <p className="form-message error">{params.error}</p> : null}

      <div className="integration-summary-grid stats-grid">
        <article className="stat-card">
          <span>Conexões ativas</span>
          <strong>{connectedCount}</strong>
          <small>plataformas já ligadas</small>
        </article>
        <article className="stat-card">
          <span>Fluxos OAuth</span>
          <strong>{oauthCount}</strong>
          <small>login oficial por conta</small>
        </article>
        <article className="stat-card">
          <span>Integrações manuais</span>
          <strong>{manualCount}</strong>
          <small>Consumer Key ou credenciais</small>
        </article>
        <article className="stat-card">
          <span>Fluxo de parceiro</span>
          <strong>{partnerCount}</strong>
          <small>exigem onboarding assistido</small>
        </article>
      </div>

      <section className="table-shell dashboard-table integration-connections-panel">
        <div className="table-toolbar">
          <strong>Conexões salvas</strong>
          <span>histórico recente</span>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>Plataforma</th>
                <th>Status</th>
                <th>Conta</th>
                <th>Tipo</th>
                <th>Conectado em</th>
              </tr>
            </thead>
            <tbody>
              {connections.length === 0 ? (
                <tr>
                  <td colSpan={5}>Nenhuma conexão salva ainda.</td>
                </tr>
              ) : (
                connections.map((connection) => (
                  <tr key={connection.id}>
                    <td>{connection.provider}</td>
                    <td>
                      <span
                        className={`status ${connection.status === "connected" ? "ok" : connection.status === "error" ? "risk" : "wait"}`}
                      >
                        {connection.status}
                      </span>
                    </td>
                    <td>{connection.account_label ?? connection.store_url ?? "Conta conectada"}</td>
                    <td>{connection.connection_type}</td>
                    <td>{formatDate(connection.created_at)}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      <div className="integration-card-grid">
        {providers.map((provider) => {
          const saved = latestByProvider.get(provider.key);
          const isConnected = saved?.status === "connected";
          const providerHasEnv =
            provider.authMode !== "oauth" ||
            provider.key === "shopify" ||
            provider.key === "amazon" ||
            Boolean(
              !provider.clientIdEnv ||
                process.env[provider.clientIdEnv] ||
                provider.key === "magalu" ||
                provider.key === "paypal"
            );

          return (
            <article className="integration-card" key={provider.key}>
              <div className="integration-card-head">
                <div className="integration-card-mark" style={{ background: provider.color }}>
                  {provider.glyph}
                </div>
                <div>
                  <h2>{provider.label}</h2>
                  <p>{provider.description}</p>
                </div>
              </div>

              <div className="integration-card-meta">
                <span className="integration-meta-pill">{provider.statusLabel}</span>
                {isConnected ? <span className="integration-meta-pill integration-meta-pill-success">Conectado</span> : null}
                {!providerHasEnv && provider.authMode === "oauth" ? (
                  <span className="integration-meta-pill">Configurar env</span>
                ) : null}
              </div>

              <ul className="integration-note-list">
                {provider.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>

              <div className="integration-actions">
                <span className="form-message">
                  {provider.authMode === "oauth"
                    ? "Login oficial disponível"
                    : provider.authMode === "manual"
                      ? "Conexão por credenciais da loja"
                      : "Fluxo de parceiro em validação"}
                </span>
              </div>

              {provider.key === "shopify" ? (
                <form className="integration-form" action="/api/integrations/start/shopify" method="get">
                  <label>
                    Domínio da loja Shopify
                    <input
                      name="shop"
                      placeholder="sualoja.myshopify.com"
                      required
                      type="text"
                    />
                  </label>
                  <button className="button button-plan" type="submit" disabled={!auth.configured}>
                    Conectar com login
                  </button>
                </form>
              ) : null}

              {provider.key === "woocommerce" ? (
                <form className="integration-form" action="/api/integrations/manual/woocommerce" method="post">
                  <label>
                    Nome da conta
                    <input
                      name="account_label"
                      placeholder="WooCommerce da loja"
                      type="text"
                    />
                  </label>
                  <label>
                    URL da loja
                    <input
                      name="site_url"
                      placeholder="https://sualoja.com.br"
                      required
                      type="url"
                    />
                  </label>
                  <label>
                    Consumer Key
                    <input
                      autoComplete="off"
                      name="consumer_key"
                      placeholder="ck_xxxxxxxxxx"
                      required
                      type="password"
                    />
                  </label>
                  <label>
                    Consumer Secret
                    <input
                      autoComplete="off"
                      name="consumer_secret"
                      placeholder="cs_xxxxxxxxxx"
                      required
                      type="password"
                    />
                  </label>
                  <button className="button button-plan" type="submit" disabled={!auth.configured}>
                    Salvar credenciais
                  </button>
                </form>
              ) : null}

              {provider.key !== "woocommerce" && provider.key !== "shopify" ? (
                <div className="integration-actions">
                  {provider.authMode === "oauth" ? (
                    providerHasEnv ? (
                      <Link className="button button-plan" href={`/api/integrations/start/${provider.key}`}>
                        Conectar com login
                      </Link>
                    ) : (
                      <span className="form-message">
                        Configure as variáveis de ambiente deste provedor para liberar o login.
                      </span>
                    )
                  ) : (
                    <span className="form-message">
                      Este fluxo ainda depende de onboarding de parceiro.
                    </span>
                  )}
                </div>
              ) : null}

              {saved ? (
                <p className="integration-saved-copy">
                  Última conexão salva em {formatDate(saved.created_at)}.
                </p>
              ) : null}
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
