import { AppShell } from "@/components/app-shell";
import { ConfigurationRequired } from "@/components/configuration-required";
import { getTransactionsPageData } from "@/lib/data/transactions";
import { formatCurrency, formatDate } from "@/lib/format";
import { getReconciliationStatusLabel, getTransactionTypeLabel } from "@/lib/reconciliation/labels";
import { getAuthenticatedUser } from "@/lib/supabase/auth";

export default async function TransactionsPage() {
  const auth = await getAuthenticatedUser();

  if (!auth.configured) {
    return <ConfigurationRequired />;
  }

  const transactions = await getTransactionsPageData();

  return (
    <AppShell active="transactions" email={auth.user.email}>
      <div className="dashboard-topbar">
        <div>
          <span className="eyebrow">Transações</span>
          <h1>Transações importadas</h1>
        </div>
      </div>
      <section className="table-shell dashboard-table">
        <div className="table-toolbar">
          <strong>{transactions.length} registros</strong>
          <span>Últimas 100 transações</span>
        </div>
        <div className="responsive-table">
          <table>
            <thead>
              <tr>
                <th>ID externo</th>
                <th>Marketplace</th>
                <th>Tipo</th>
                <th>Valor</th>
                <th>Esperado</th>
                <th>Conciliação</th>
                <th>Score</th>
                <th>Data</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((transaction) => (
                <tr key={transaction.id}>
                  <td>{transaction.external_id}</td>
                  <td>{transaction.marketplace}</td>
                  <td>{getTransactionTypeLabel(transaction.type)}</td>
                  <td>{formatCurrency(Number(transaction.amount))}</td>
                  <td>{formatCurrency(Number(transaction.expected_amount))}</td>
                  <td>
                    <span
                      className={`status ${
                        transaction.reconciliation_status === "matched"
                          ? "ok"
                          : transaction.reconciliation_status === "discrepancy"
                            ? "risk"
                            : "wait"
                      }`}
                    >
                      {getReconciliationStatusLabel(transaction.reconciliation_status)}
                    </span>
                  </td>
                  <td>{transaction.confidence_score}</td>
                  <td>{formatDate(transaction.transaction_date)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </AppShell>
  );
}
