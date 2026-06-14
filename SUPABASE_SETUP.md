# Ativar Supabase real na RepasseCheck

O app ja funciona online em modo local/PWA. Para ativar banco, Auth e Storage reais, conecte um projeto Supabase.

## Estado atual

- Organizacao Supabase encontrada: `devdemonsa-sudo's Org`
- ID da organizacao: `xxnrypeyntubotwxplqj`
- Custo retornado pela integracao para novo projeto: `0` mensal
- Tentativa de criar projeto `RepasseCheck` em `sa-east-1`: bloqueada por limite de 2 projetos gratuitos ativos

Mensagem retornada pelo Supabase:

```txt
The following organization members have reached their maximum limits for the number of active free projects within organizations where they are an administrator or owner: devdemonsa-sudo (2 project limit).
```

## Opcoes seguras

1. Pausar um projeto Supabase que nao estiver em uso.
2. Excluir um projeto que nao sera mais usado.
3. Fazer upgrade do plano Supabase.
4. Criar a RepasseCheck em outra organizacao Supabase com limite disponivel.

Nao pause automaticamente projetos existentes sem confirmar, porque eles podem estar em producao.

## Depois que houver projeto disponivel

1. Criar o projeto `RepasseCheck` na regiao `sa-east-1`.
2. Aplicar a migration:

```sql
supabase/migrations/202606130001_repassecheck_mvp.sql
```

3. Configurar as variaveis na Vercel:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://PROJECT_REF.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=sb_publishable_...
```

4. Fazer redeploy de producao.
5. Testar:

- cadastro em `/register`
- login em `/login`
- upload CSV em `/upload`
- dashboard com dados reais em `/dashboard`
- exportacao em `/reports`

## Enquanto isso

O modo local continua ativo automaticamente quando as variaveis Supabase nao existem. Ele permite testar no navegador e no app instalado:

- upload CSV
- dashboard
- transacoes
- divergencias
- relatorios e exportacao CSV
