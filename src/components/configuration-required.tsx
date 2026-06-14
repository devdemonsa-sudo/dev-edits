import Link from "next/link";
import { getSupabaseMissingMessage } from "@/lib/supabase/config";

export function ConfigurationRequired() {
  return (
    <main className="auth-page">
      <div className="auth-card">
        <span className="eyebrow">Configuração pendente</span>
        <h1>Conecte um projeto Supabase para ativar o MVP.</h1>
        <p>{getSupabaseMissingMessage()}</p>
        <p>
          A migration do banco está em <strong>supabase/migrations</strong> e o modelo de env está em{" "}
          <strong>.env.example</strong>.
        </p>
        <Link className="button button-plan" href="/">
          Voltar para a landing
        </Link>
      </div>
    </main>
  );
}
