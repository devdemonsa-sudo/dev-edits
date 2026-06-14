import Link from "next/link";

type AppShellProps = {
  active:
    | "dashboard"
    | "integrations"
    | "integration-tests"
    | "upload"
    | "transactions"
    | "discrepancies"
    | "reports";
  children: React.ReactNode;
  email?: string;
};

const navItems = [
  ["dashboard", "Dashboard", "/dashboard"],
  ["integration-tests", "Teste de login", "/integration-tests"],
  ["integrations", "Integrações", "/integrations"],
  ["upload", "Upload CSV", "/upload"],
  ["transactions", "Transações", "/transactions"],
  ["discrepancies", "Divergências", "/discrepancies"],
  ["reports", "Relatórios", "/reports"]
] as const;

const mobileItems = [
  ["dashboard", "Home", "/dashboard"],
  ["integration-tests", "Teste", "/integration-tests"],
  ["upload", "Upload", "/upload"],
  ["transactions", "Transações", "/transactions"],
  ["reports", "Relatórios", "/reports"]
] as const;

export function AppShell({ active, children, email }: AppShellProps) {
  return (
    <main className="workspace-shell">
      <aside className="workspace-sidebar">
        <Link className="workspace-brand" href="/">
          <span className="brand-mark">RC</span>
          <span>
            <strong>RepasseCheck</strong>
            <small>Conciliação inteligente</small>
          </span>
        </Link>

        <nav className="workspace-nav" aria-label="Navegação principal">
          {navItems.map(([key, label, href]) => (
            <Link className={active === key ? "active" : ""} href={href} key={key}>
              {label}
            </Link>
          ))}
        </nav>

        <section className="workspace-card workspace-status-card">
          <span className="eyebrow">Status</span>
          <strong>Conciliação pronta para operar</strong>
          <p>
            Importe CSV, acompanhe divergências e teste os logins das plataformas
            aprovadas em uma área separada.
          </p>
        </section>

        <div className="workspace-account">
          <span>{email ?? "Sessão autenticada"}</span>
          <form action="/api/auth/signout" method="post">
            <button type="submit">Sair</button>
          </form>
        </div>
      </aside>

      <section className="workspace-main">{children}</section>

      <nav className="workspace-bottom-nav" aria-label="Navegação móvel">
        {mobileItems.map(([key, label, href]) => (
          <Link className={active === key ? "active" : ""} href={href} key={key}>
            {label}
          </Link>
        ))}
      </nav>
    </main>
  );
}
