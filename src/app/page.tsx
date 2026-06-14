import Link from "next/link";

const featureCards = [
  {
    title: "Análise profunda",
    text: "Identifica diferenças entre o valor vendido e o valor recebido antes que o prejuízo cresça."
  },
  {
    title: "Dashboard em tempo real",
    text: "Mostra volume conciliado, divergências e alertas em uma visão executiva simples."
  },
  {
    title: "Integrações por login",
    text: "Teste Shopify, eBay, Stripe e PayPal com login oficial em área própria."
  },
  {
    title: "WooCommerce manual",
    text: "Use Consumer Key e Consumer Secret quando a loja não usa OAuth nativo."
  },
  {
    title: "Relatório automático",
    text: "Cada importação gera relatório pronto para exportar e compartilhar."
  },
  {
    title: "Segurança LGPD",
    text: "Credenciais e dados sensíveis ficam protegidos com boas práticas de backend."
  }
] as const;

const pricingPlans = [
  { name: "Starter", price: "R$ 99/mês", note: "Até 100 transações" },
  { name: "Professional", price: "R$ 299/mês", note: "Até 1.000 transações" },
  { name: "Enterprise", price: "Sob consulta", note: "Volume ilimitado" }
] as const;

const logoRow = ["Shopify", "WooCommerce", "Amazon", "Mercado Livre", "Stripe", "PayPal"] as const;

export default function HomePage() {
  return (
    <main className="landing-page">
      <header className="landing-topbar">
        <Link className="landing-brand" href="/">
          <span className="brand-mark">RC</span>
          <span>
            <strong>repasscheck</strong>
            <small>conciliação inteligente</small>
          </span>
        </Link>
        <div className="landing-actions">
          <Link className="button button-secondary" href="/integration-tests">
            Testar logins
          </Link>
          <Link className="button button-ghost" href="/login">
            Entrar
          </Link>
          <Link className="button button-primary" href="/register">
            Criar conta
          </Link>
        </div>
      </header>

      <section className="hero-section">
        <div className="hero-copy">
          <span className="eyebrow">Conciliação inteligente para e-commerce</span>
          <h1>RepasseCheck</h1>
          <p className="hero-text">
            Detecte discrepâncias, teste integrações por login e acompanhe seus recebimentos em um único painel.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" href="/register">
              Começar agora
            </Link>
            <Link className="button button-secondary" href="/integration-tests">
              Área de teste
            </Link>
            <Link className="button button-secondary" href="/demo">
              Ver demonstração
            </Link>
          </div>
          <div className="hero-badges">
            {logoRow.map((item) => (
              <span className="hero-badge" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-panel-header">
            <span>Receita conciliada</span>
            <strong>98,7%</strong>
          </div>
          <div className="signal-grid">
            <article>
              <span>Transações</span>
              <strong>1.248</strong>
            </article>
            <article>
              <span>Divergências</span>
              <strong>37</strong>
            </article>
            <article>
              <span>Conectores</span>
              <strong>6</strong>
            </article>
            <article>
              <span>Relatórios</span>
              <strong>Automáticos</strong>
            </article>
          </div>
          <div className="timeline-card">
            <div>
              <span>Agora</span>
              <strong>Importar CSV</strong>
            </div>
            <div>
              <span>Depois</span>
              <strong>Validar login</strong>
            </div>
            <div>
              <span>Final</span>
              <strong>Gerar relatório</strong>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-strip">
        <article>
          <strong>Login seguro</strong>
          <p>Auth com JWT, refresh token e cookies protegidos.</p>
        </article>
        <article>
          <strong>Controle total</strong>
          <p>Config manager, sites manager, history e scheduler.</p>
        </article>
        <article>
          <strong>Deploy Vercel</strong>
          <p>Pronto para CI/CD com GitHub Actions e cron.</p>
        </article>
      </section>

      <section className="content-grid">
        {featureCards.map((item) => (
          <article className="content-card" key={item.title}>
            <strong>{item.title}</strong>
            <p>{item.text}</p>
          </article>
        ))}
      </section>

      <section className="pricing-board" id="planos">
        <div className="section-heading">
          <span className="eyebrow">Planos</span>
          <h2>Pronto para vender e testar.</h2>
        </div>
        <div className="pricing-grid">
          {pricingPlans.map((plan) => (
            <article className="pricing-card" key={plan.name}>
              <strong>{plan.name}</strong>
              <span className="pricing-value">{plan.price}</span>
              <p>{plan.note}</p>
              <div className="pricing-actions">
                <Link className="button button-primary" href="/register">
                  Assinar
                </Link>
                <Link className="button button-secondary" href="/integration-tests">
                  Testar login
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="cta-panel">
        <div>
          <span className="eyebrow">Pronto para operar</span>
          <h2>Entre, teste as plataformas e deixe a conciliação trabalhar.</h2>
        </div>
        <div className="landing-actions">
          <Link className="button button-primary" href="/integration-tests">
            Ir para teste de login
          </Link>
          <Link className="button button-secondary" href="/login">
            Já tenho conta
          </Link>
        </div>
      </section>
    </main>
  );
}
