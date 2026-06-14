import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function LoginPage() {
  return (
    <main className="auth-page">
      <AuthForm mode="login" />
      <p className="auth-switch">
        Ainda não tem conta? <Link href="/register">Criar conta</Link>
      </p>
    </main>
  );
}

