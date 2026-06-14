# RepasseCheck

Sistema inteligente de conciliação de recebimentos para e-commerce.

## Stack

- Next.js 16 App Router
- React 19
- TypeScript
- Supabase Auth + Postgres + RLS
- CSS puro

## O que está incluído

- Landing page pública do RepasseCheck
- Login e registro com Supabase
- Dashboard com visão operacional
- Upload CSV com geração automática de relatório
- Integrações por login em área própria
- WooCommerce com conexão manual oficial
- Amazon como fluxo de parceiro/onboarding assistido

## Ambientes

Copie `.env.example` para `.env.local` e preencha:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `INTEGRATION_TOKEN_SECRET`
- `CRON_SECRET`

## Banco

Aplicar as migrations em `supabase/migrations`:

1. `202606130001_repassecheck_mvp.sql`
2. `202606130002_integration_connections.sql`

## Execução local

```bash
npm install
npm run dev
```
