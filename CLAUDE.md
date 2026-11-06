# GGastos — guia para agentes

App web/PWA de finanças pessoais (planejado vs. realizado). React + react-native-web,
React Query, Supabase (Postgres, RLS, Edge Functions). Deploy do front na Vercel.

## Comandos
```bash
npm run web                 # dev server (Node 22+)
npx tsc --noEmit            # tipos
npm run lint                # eslint
npm run build:web           # build para dist/
supabase start              # backend local (Docker)
supabase db reset           # migrations + seed no banco LOCAL
node supabase/tests/<arquivo>.test.mjs   # testes unitários do backend
```
Para testar a UI, use o Supabase local e um usuário de teste criado nele; nunca use a conta real.

## Estrutura
```
src/app/                    # rota única + layout (providers, fontes)
src/features/<feature>/     # uma fatia por funcionalidade (tela, view-model, queries, schema)
src/components/ggastos/     # UI compartilhada (cards, rows, forms, navigation)
src/constants/              # tema (tokens), cores e ícones de categoria
src/lib/                    # supabase client, query client, invalidate-month-data
public/                     # manifest, service worker, ícones (PWA)
supabase/migrations/        # schema versionado
supabase/functions/         # Edge Functions; código compartilhado em _shared/
supabase/tests/             # testes do backend (.mjs)
docs/  .specs/              # produto, arquitetura, decisões
```
Features: auth, app-shell, dashboard, planning, categories, statements, reconciliation,
closing, reports, opening-balance, search, settings.

## Convenções
- Arquivo com no máximo 150 linhas; quebre por responsabilidade.
- MVVM funcional: tela só renderiza; estado e regras ficam em `use-<feature>-view-model.ts`
  e em funções puras (`format-*`, `*-rules`).
- Contratos com zod (`*-schema.ts`); sem `any`; identificadores em inglês, textos de UI em pt-BR.
- Sem números mágicos: constantes nomeadas. Estilos com `StyleSheet` e tokens de
  `src/constants/ggastos-theme.ts`.
- Depois de qualquer mutação que mexa em lançamentos, chame `invalidateMonthData`
  (`src/lib/query/invalidate-month-data.ts`) para o mês, as categorias e os relatórios não ficarem velhos.
- Toda mudança de dados vai por migration em `supabase/migrations/`; RPCs `security invoker`.

## Regras de operação
- Não aplique migration nem faça deploy de Edge Function em produção sem pedido explícito.
  Valide SQL no banco local ou em transação com rollback.
- Não escreva senhas nem chaves em variáveis `EXPO_PUBLIC_*` (vão para o bundle).
- Importação de fatura (Nubank/Bradesco): reimportar é idempotente por fingerprint;
  detalhes em `docs/card-statement-import.md`.
