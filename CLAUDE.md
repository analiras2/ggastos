# GGastos — guia para agentes

App web/PWA de finanças pessoais (planejado vs. realizado). React + react-native-web (bundler Vite),
React Query, Supabase (Postgres, RLS, Edge Functions). Deploy do front na Vercel.

## Comandos
```bash
npm run web                 # dev server Vite (Node 22+)
npm run typecheck           # tsc --noEmit
npm run lint                # eslint (inclui as fronteiras entre features)
npm test                    # vitest: regras puras e contratos
npm run build:web           # build para dist/
supabase start              # backend local (Docker)
supabase db reset           # migrations + seed no banco LOCAL
npm run test:backend        # testes unitários das Edge Functions (Node 22+), ao lado do código
node supabase/tests/<suite>.mjs   # suítes de integração (precisam do Supabase local)
```
Para testar a UI, use o Supabase local e um usuário de teste criado nele; nunca use a conta real.

## Estrutura
```
src/main.tsx  src/app/app.tsx   # bootstrap: providers, fontes, auth gate
src/features/<feature>/         # uma fatia por funcionalidade
  index.ts                      #   API pública: o único ponto de entrada para outras features
  contract.ts                   #   schemas zod e tipos de entrada/saída (quando a feature tem)
  use-*-view-model.ts, *-sheet.tsx, *-screen.tsx, use-*.ts (queries), *.test.ts
src/shared/ui/                  # componentes compartilhados (cards, core, forms, navigation, rows)
src/shared/theme/               # tokens, cores e ícones de categoria
src/shared/lib/                 # supabase, query client, invalidate-month-data, formatadores, hooks
src/shared/contracts/finance.ts # vocabulário comum: ImpactType, PlanningStatus, month, centavos
public/                         # manifest, service worker, ícones (PWA)
supabase/migrations/            # schema versionado
supabase/functions/<fn>/index.ts      # só HTTP, auth e erros (poucas dezenas de linhas)
supabase/functions/_shared/<domínio>/ # regra de negócio por domínio (statement-import, statements,
                                      #   reconciliation, closing) com *.test.mjs ao lado
supabase/tests/                 # suítes de integração (RLS, reimport...) que usam o banco local
docs/  .specs/                  # produto, arquitetura, decisões
```
Features: app-shell, auth, categories, closing, dashboard, opening-balance, planned-entries,
planning (aba Planejamento), reconciliation, reports, search, settings, statements, templates.

Dependências (sem ciclos): `shared` não conhece features; `categories` é base de
`planned-entries`/`templates`/`statements`; `dashboard` compõe a aba do mês (abre as sheets de
planned-entries, templates, search, statements); `app-shell` compõe as abas.

## Convenções
- Arquivo com no máximo 150 linhas; quebre por responsabilidade.
- Uma feature só importa de outra por `@/features/<nome>` (o `index.ts`). O ESLint barra imports
  profundos e barra `shared/` importando features. Precisa de algo novo? Exporte no `index.ts`.
- MVVM funcional: tela só renderiza; estado e regras ficam em `use-<feature>-view-model.ts`
  e em funções puras (`format-*`, `*-rules`), que ganham teste ao lado (`*.test.ts`).
- Contratos com zod em `contract.ts`; sem `any`; identificadores em inglês, textos de UI em pt-BR.
- Sem números mágicos: constantes nomeadas. Estilos com `StyleSheet` e tokens de
  `src/shared/theme/ggastos-theme.ts`.
- Depois de qualquer mutação que mexa em lançamentos, chame `invalidateMonthData`
  (`src/shared/lib/query/invalidate-month-data.ts`) para o mês, as categorias e os relatórios não ficarem velhos.
- Toda mudança de dados vai por migration em `supabase/migrations/`; RPCs `security invoker`.

## Documentação
- [`docs/README.md`](docs/README.md): índice (vigente x histórico). Arquitetura em
  [`docs/stack-tecnica-supabase-mvp.md`](docs/stack-tecnica-supabase-mvp.md).
- [`docs/card-statement-import.md`](docs/card-statement-import.md): importação de fatura, situação de
  pagamento e parcelas futuras.
- [`.specs/README.md`](.specs/README.md): specs por funcionalidade (histórico; leia as correções de lá).
- Mudou comportamento da importação ou da arquitetura? Atualize o doc correspondente no mesmo PR.

## Regras de operação
- Não aplique migration nem faça deploy de Edge Function em produção sem pedido explícito.
  Valide SQL no banco local ou em transação com rollback.
- Não escreva senhas nem chaves em variáveis `VITE_*` (vão para o bundle).
- Importação de fatura (Nubank/Bradesco): reimportar é idempotente por fingerprint;
  detalhes em `docs/card-statement-import.md`.
