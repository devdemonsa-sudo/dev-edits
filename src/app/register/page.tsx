import Link from "next/link";
import { AuthForm } from "@/components/auth-form";

export default function RegisterPage() {
  return (
    <main className="auth-page">
      <AuthForm mode="register" />
      <p className="auth-switch">
        Já tem conta? <Link href="/login">Entrar</Link>
      </p>
    </main>
  );
}

