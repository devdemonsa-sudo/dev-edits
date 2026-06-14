import { AppShell } from "@/components/app-shell";
import { ConfigurationRequired } from "@/components/configuration-required";
import { getDiscrepanciesPageData } from "@/lib/data/transactions";
import { formatCurrency, formatDate } from "@/lib/format";
import { getDiscrepancyStatusLabel, getSeverityLabel } from "@/lib/reconciliation/labels";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export default async function DiscrepanciesPage() {
  const auth = await getAuthenticatedUser();

  if (!auth.configured) {
    return <ConfigurationRequired />;
  }

  const discrepancies = await getDiscrepanciesPageData();

  return (
    <AppShell active="discrepancies" email={auth.user.email}>
      <div className="dashboard-topbar">
        <div>
          <span className="eyebrow">Divergências</span>
          <h1>Fila de investigação</h1>
        </div>
      </div>
      <div className="discrepancy-grid">
        {discrepancies.map((discrepancy) => (
          <article className="discrepancy-card" key={discrepancy.id}>
            <div>
              <span
                className={`status ${discrepancy.severity === "high" ? "risk" : discrepancy.severity === "medium" ? "wait" : "ok"}`}
              >
                {getSeverityLabel(discrepancy.severity)}
              </span>
              <span className="status wait">{getDiscrepancyStatusLabel(discrepancy.status)}</span>
            </div>
            <h3>{discrepancy.type}</h3>
            <p>{discrepancy.description}</p>
            <small>
              Esperado {formatCurrency(Number(discrepancy.expected_value ?? 0))} / Atual{" "}
              {formatCurrency(Number(discrepancy.actual_value ?? 0))} / {formatDate(discrepancy.created_at)}
            </small>
          </article>
        ))}
        {discrepancies.length === 0 ? (
          <section className="empty-state">
            <h2>Nenhuma divergência aberta.</h2>
            <p>Importe um CSV para iniciar a conciliação.</p>
          </section>
        ) : null}
      </div>
    </AppShell>
  );
}
