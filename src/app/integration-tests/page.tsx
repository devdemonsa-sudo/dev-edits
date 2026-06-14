import Link from "next/link";
import { AppShell } from "@/components/app-shell";
import { getAuthenticatedUser } from "@/lib/supabase/auth";
import { getIntegrationProviderList, isManualProvider, isPartnerProvider } from "@/lib/integrations/providers";

export default async function IntegrationTestsPage() {
  const auth = await getAuthenticatedUser();
  const providers = getIntegrationProviderList();

  return (
    <AppShell active="integration-tests" email={auth.configured ? auth.user.email : undefined}>
      <div className="dashboard-topbar integrations-topbar">
        <div>
          <span className="eyebrow">Teste de login</span>
          <h1>Área para validar os logins das plataformas.</h1>
          <p className="report-detail-subtitle">
            Use esta página para abrir os fluxos oficiais de conexão, testar as credenciais e
            conferir o retorno do callback sem misturar com o painel principal.
          </p>
        </div>
        <div className="quick-actions">
          <Link className="button button-plan" href="/integrations">
            Ver integrações
          </Link>
          <Link className="button button-secondary app-secondary" href="/dashboard">
            Voltar ao painel
          </Link>
        </div>
      </div>

      <section className="table-shell dashboard-table integration-connections-panel">
        <div className="table-toolbar">
          <strong>Como testar</strong>
          <span>login oficial e fluxo manual</span>
        </div>
        <div className="integration-test-steps">
          <article>
            <strong>1. Escolha a plataforma</strong>
            <p>Abra a integração correta e confirme se o ambiente OAuth ou manual está configurado.</p>
          </article>
          <article>
            <strong>2. Faça a autorização</strong>
            <p>Use o login oficial da conta ou preencha as credenciais da loja quando for WooCommerce.</p>
          </article>
          <article>
            <strong>3. Valide o retorno</strong>
            <p>Depois do callback, a conexão aparece na lista e passa a ficar disponível para sincronização.</p>
          </article>
        </div>
      </section>

      <div className="integration-card-grid">
        {providers.map((provider) => {
          const manual = isManualProvider(provider.key);
          const partner = isPartnerProvider(provider.key);

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
                <span className="integration-meta-pill">
                  {manual ? "Teste manual" : partner ? "Fluxo assistido" : "Login OAuth"}
                </span>
              </div>

              <ul className="integration-note-list">
                {provider.notes.map((note) => (
                  <li key={note}>{note}</li>
                ))}
              </ul>

              {provider.key === "shopify" ? (
                <form className="integration-form" action="/api/integrations/start/shopify" method="get">
                  <label>
                    Domínio da loja Shopify
                    <input name="shop" placeholder="sualoja.myshopify.com" required type="text" />
                  </label>
                  <button className="button button-plan" type="submit" disabled={!auth.configured}>
                    Iniciar teste de login
                  </button>
                </form>
              ) : null}

              {provider.key === "woocommerce" ? (
                <form className="integration-form" action="/api/integrations/manual/woocommerce" method="post">
                  <label>
                    URL da loja
                    <input name="site_url" placeholder="https://sualoja.com.br" required type="url" />
                  </label>
                  <label>
                    Consumer Key
                    <input autoComplete="off" name="consumer_key" placeholder="ck_xxxxxxxxxx" required type="password" />
                  </label>
                  <label>
                    Consumer Secret
                    <input autoComplete="off" name="consumer_secret" placeholder="cs_xxxxxxxxxx" required type="password" />
                  </label>
                  <button className="button button-plan" type="submit" disabled={!auth.configured}>
                    Testar conexão manual
                  </button>
                </form>
              ) : null}

              {provider.key !== "shopify" && provider.key !== "woocommerce" ? (
                <div className="integration-actions">
                  {manual ? (
                    <span className="form-message">Conexão manual validada por credenciais da loja.</span>
                  ) : partner ? (
                    <span className="form-message">Fluxo de parceiro em onboarding assistido.</span>
                  ) : (
                    <Link className="button button-plan" href={`/api/integrations/start/${provider.key}`}>
                      Iniciar teste de login
                    </Link>
                  )}
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </AppShell>
  );
}
