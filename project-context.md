# RepasseCheck - Project Context

## Decisoes chave tomadas
- O produto e um SaaS web de conciliacao financeira para e-commerce.
- A landing publica continua aberta e a area operacional fica protegida por autenticacao Supabase.
- O MVP real usa upload de CSV como fluxo principal.
- O sistema gera relatorio automaticamente apos cada importacao.
- O relatorio principal agora tem:
  - CSV exportavel
  - pagina detalhada por importacao
  - modo imprimivel pelo navegador
- Quando nao ha Supabase configurado, o app cai no modo local/demo para visitas e testes.
- A interface e a documentacao do produto estao em pt-BR.
- A ordem de oficializacao definida e: Shopify, eBay, Stripe e PayPal primeiro; depois Magalu; WooCommerce permanece manual oficial; Amazon fica como parceria/onboarding assistido.
- As integracoes oficialmente preparadas no app seguem essa ordem e os textos agora deixam isso explicito.
- O MVP de integracoes ja tem tela dedicada, tabela de conexoes e rotas para login OAuth, onboarding manual e fluxo de parceiro.
- WooCommerce entra como conexao manual segura com Consumer Key e Consumer Secret.
- Amazon segue como fluxo de parceiro/onboarding assistido, sem promessa de login direto.
- Os demais marketplaces da lista do usuario permaneceram sem documentacao publica confirmada nesta rodada e devem seguir em validacao antes de aparecer como integracoes prontas.

## Estado atual do que estamos construindo
- Landing page publica pronta e responsiva.
- Demo publica em `/demo`.
- Login, registro e dashboard autenticado prontos.
- Integrações autenticadas e rota de conexao por provedor prontos.
- Upload CSV funcional com validacao e geracao de divergencias.
- Relatorios com:
  - listagem de imports
  - destaque da importacao mais recente
  - pagina detalhada em `/reports/[importId]`
  - botao de imprimir
- Modo local pronto para testar sem Supabase.
- Pagina inicial agora mostra blocos visuais de integracoes confirmadas e em validacao.
- Build do projeto esta passando.
- Tela de integracoes lista conexoes salvas e oferece atalhos por plataforma.

## Questoes abertas / proximos passos
- Planejar as proximas integracoes prioritarias com foco nas plataformas mais usadas pelo publico.
- Ordem sugerida de prioridade: Mercado Livre, Shopee, AliExpress, Americanas, Casas Bahia/Ponto, Carrefour, Magalu, Shein, Dafiti, Zattini, Enjoei, Amaro, MadeiraMadeira, Leroy Merlin, KaBuM!, Netshoes, Estante Virtual, Elo7, Petlove, Cobasi e Petz.
- Tratar essas plataformas como "em validacao" ou "proximas integracoes" ate existir confirmacao oficial de documentacao, parceiro ou OAuth.
- Validar oficialmente os demais marketplaces da lista do usuario antes de chama-los de integracao pronta.
- Trocar os badges atuais por logos mais fieis, se houver assets licenciados ou permitidos.
- Avaliar exportacao em PDF real e envio por e-mail.
- Integrar marketplaces e gateways em ordem de prioridade de negocio.
- Decidir se o relatorio detalhado deve abrir automaticamente apos a importacao em todos os modos.

## Padroes de codigo importantes ou restricoes
- Usar `apply_patch` para alteracoes manuais.
- Manter o app em pt-BR.
- Nunca expor `service_role` ou secret keys no client.
- Usar Supabase SSR com validacao server-side por claims.
- Preservar RLS em tabelas expostas.
- Priorizar responsividade mobile e desktop.
- Verificar build apos mudancas que afetem rotas, layout ou upload.
- Manter o modo local funcional quando Supabase nao estiver disponivel.
