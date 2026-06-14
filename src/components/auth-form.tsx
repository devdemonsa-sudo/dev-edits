"use client";

import type { FormEvent } from "react";
import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { getSupabaseConfig, getSupabaseMissingMessage } from "@/lib/supabase/config";

type AuthMode = "login" | "register";

export function AuthForm({ mode }: { mode: AuthMode }) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [workspaceName, setWorkspaceName] = useState("RepasseCheck");
  const [message, setMessage] = useState("");
  const [isPending, startTransition] = useTransition();
  const isRegister = mode === "register";
  const isConfigured = useMemo(() => getSupabaseConfig().isConfigured, []);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");

    if (!isConfigured) {
      setMessage(getSupabaseMissingMessage());
      return;
    }

    startTransition(async () => {
      try {
        const supabase = createClient();
        const response = isRegister
          ? await supabase.auth.signUp({
              email,
              options: {
                data: { workspace_name: workspaceName }
              },
              password
            })
          : await supabase.auth.signInWithPassword({ email, password });

        if (response.error) {
          setMessage(response.error.message);
          return;
        }

        if (isRegister && !response.data.session) {
          setMessage("Conta criada. Confirme seu email antes de entrar.");
          return;
        }

        router.push("/dashboard");
        router.refresh();
      } catch (error) {
        setMessage(error instanceof Error ? error.message : "Não foi possível autenticar.");
      }
    });
  }

  if (!isConfigured) {
    return (
      <div className="auth-card">
        <span className="eyebrow">Setup necessário</span>
        <h1>Conecte o Supabase para ativar login, banco e integrações.</h1>
        <p>{getSupabaseMissingMessage()}</p>
      </div>
    );
  }

  return (
    <form className="auth-card" method="post" noValidate onSubmit={onSubmit}>
      <span className="eyebrow">{isRegister ? "Criar conta" : "Entrar"}</span>
      <h1>{isRegister ? "Comece com o RepasseCheck" : "Acessar o RepasseCheck"}</h1>
      <p>
        {isRegister
          ? "Crie sua conta para importar CSV, testar integrações e acompanhar as conciliações."
          : "Entre para testar as plataformas, ver relatórios e importar arquivos de recebimento."}
      </p>

      {isRegister ? (
        <label>
          Nome do workspace
          <input
            autoComplete="organization"
            onChange={(event) => setWorkspaceName(event.target.value)}
            placeholder="RepasseCheck"
            required
            value={workspaceName}
          />
        </label>
      ) : null}

      <label>
        Email
        <input
          autoComplete="email"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="voce@empresa.com"
          required
          type="email"
          value={email}
        />
      </label>

      <label>
        Senha
        <input
          autoComplete={isRegister ? "new-password" : "current-password"}
          minLength={6}
          onChange={(event) => setPassword(event.target.value)}
          placeholder="Mínimo de 6 caracteres"
          required
          type="password"
          value={password}
        />
      </label>

      {message ? <p className="form-message">{message}</p> : null}

      <button className="button button-primary" disabled={isPending} type="submit">
        {isPending ? "Processando..." : isRegister ? "Criar conta" : "Entrar"}
      </button>
    </form>
  );
}
