# State

**Last Updated:** 2026-07-12T04:15:00Z
**Current Work:** Milestone 1 concluída (T8 validado) / próximo passo é iniciar a Milestone 2 (Núcleo mensal)

---

## Recent Decisions (Last 60 days)

### AD-001: Arquivar o app antigo em `legacy/` (2026-07-10)

**Decision:** O app React Native anterior foi mantido apenas como referência e movido para `legacy/`.
**Reason:** Preservar histórico e conceitos úteis sem contaminar a nova base de implementação.
**Trade-off:** O repositório passa a ter material legado que exige disciplina para não ser reutilizado indevidamente.
**Impact:** O novo desenvolvimento parte de `docs/`, `.specs/` e da nova estrutura que será criada.

### AD-002: Pluggy será usada no modo pessoal/free (2026-07-10)

**Decision:** O MVP assume acesso aos próprios dados financeiros via Pluggy em plano pessoal/free.
**Reason:** Reduzir custo e validar o produto sem depender de um plano comercial.
**Trade-off:** Sem assumir onboarding embutido no app, webhooks comerciais ou enriquecimentos premium.
**Impact:** O sync será por `pull`, manual e/ou agendado.

### AD-003: Backend do MVP será Supabase (2026-07-10)

**Decision:** O backend principal será Supabase com Postgres, Auth, RLS, Edge Functions e Cron.
**Reason:** Melhor encaixe com o domínio relacional e maior velocidade de entrega para MVP.
**Trade-off:** Parte da lógica ficará em SQL e Edge Functions, aumentando acoplamento com a plataforma.
**Impact:** O projeto será estruturado em torno de `mobile/` e `supabase/`.

### AD-004: Integração Pluggy híbrida para descoberta, API direta para produto (2026-07-11)

**Decision:** O MVP pode usar MCP/CLI como apoio de descoberta, mas a implementação de produto deve mirar API direta server-side via Edge Functions.
**Reason:** Permite aprender com payloads reais sem desviar a arquitetura final.
**Trade-off:** Ainda será necessário confirmar detalhes operacionais da API antes do sync real.
**Impact:** A fundação cria `sync-pluggy` stub autenticado e compatível com API direta.

### AD-005: Schema central completo nasce na fundação (2026-07-11)

**Decision:** A primeira migration deve criar todas as tabelas centrais do MVP, mesmo que as telas/funções de negócio sejam implementadas depois.
**Reason:** O custo de alterar modelagem financeira depois é alto.
**Trade-off:** A fundação fica mais trabalhosa.
**Impact:** O schema inclui planejamento, transações importadas, conciliação, regras, snapshots e sync events desde o início.

### AD-006: Modelagem de usuário e categorias (2026-07-11)

**Decision:** Usar `public.profiles` referenciando `auth.users`; categorias são globais com seed inicial e personalização por `user_category_rules`.
**Reason:** Evita confusão com `auth.users` e mantém uma taxonomia consistente para dashboard.
**Trade-off:** CRUD de categorias por usuário fica fora do MVP.
**Impact:** `categories` não terá `user_id`; RLS de categorias será leitura global autenticada.

### AD-007: Regras de domínio fechadas para MVP (2026-07-11)

**Decision:** Transferências internas são neutras por padrão com override; cartão não terá `credit_card_bills`; recorrência usa enum + campos auxiliares; transações importadas aceitam edição só de metadados internos; fechamento mensal é snapshot informativo.
**Reason:** Preserva foco do MVP sem bloquear evolução futura.
**Trade-off:** Fatura de cartão completa, metas por categoria e RRULE ficam fora do MVP.
**Impact:** Schema e tasks devem refletir essas restrições desde a fundação.

### AD-008: Seed global inicial de categorias aprovado (2026-07-11)

**Decision:** O MVP usará um catálogo global inicial com quatro raízes (`income`, `expense`, `investment`, `transfer`) e categorias filhas aprovadas com `impact_type`, cor e hierarquia simples.
**Reason:** Permite iniciar dashboard, planejamento e consolidado com taxonomia consistente desde a fundação.
**Trade-off:** A taxonomia nasce mais opinativa e pode exigir expansão posterior.
**Impact:** A fundação deve criar seed idempotente em `categories` e as milestones seguintes devem reutilizar esse catálogo.

### AD-009: Sync agendado padrão do MVP será a cada 12 horas (2026-07-11)

**Decision:** O sync agendado do MVP real rodará por padrão a cada 12 horas, mantendo também o sync manual.
**Reason:** Equilibra atualidade dos dados, custo operacional e risco de rate limit no contexto pessoal/free.
**Trade-off:** O usuário pode ver dados defasados entre execuções automáticas se não disparar sync manual.
**Impact:** Specs de cron, observabilidade e UX de status de conexão devem assumir essa frequência.

### AD-010: Consolidado anual do MVP será apenas por competência (2026-07-11)

**Decision:** O consolidado anual do MVP usará somente competência; liquidação fica explicitamente como evolução futura.
**Reason:** Remove ambiguidade semântica e mantém a Milestone 4 enxuta.
**Trade-off:** Usuários que desejarem leitura por liquidação terão de esperar uma fase posterior.
**Impact:** O contrato do read model anual e as tasks de fechamento não devem misturar competência e liquidação no MVP.

### AD-011: Specs/tasks das Milestones 2-4 aprovadas com ajustes leves (2026-07-11)

**Decision:** As specs/tasks das Milestones 2-4 foram aprovadas após registrar seed de categorias, cron de 12 horas e consolidado anual por competência.
**Reason:** Não restou bloqueio estrutural de produto ou arquitetura antes da implementação.
**Trade-off:** Ajustes futuros passam a ser refinamentos, não redefinições do escopo base.
**Impact:** O projeto fica pronto para iniciar implementação pela Milestone 1.

### AD-012: Validar fundação inicial primeiro no Supabase local (2026-07-11)

**Decision:** A execução da Milestone 1 passou a validar migrations primeiro no ambiente local do Supabase antes de seguir para seed, RLS e mobile.
**Reason:** Permite verificar schema, enums, FKs e constraints com feedback rápido e sem depender do projeto remoto.
**Trade-off:** Parte do progresso fica inicialmente confirmada só no ambiente local; aplicação remota continua como passo separado.
**Impact:** `T1` e `T2` foram confirmados localmente e o próximo passo segue para `T2.1`.

### AD-013: Seed de categorias executada como arquivo reaplicável (2026-07-11)

**Decision:** Implementar o catálogo global em `supabase/seed.sql`, com `ON CONFLICT (code)` e resolução de `parent_id` por `code`.
**Reason:** Garante reexecução segura em `db reset`, evita dependência de UUID fixo e mantém a hierarquia legível.
**Trade-off:** O seed depende da unicidade de `categories.code` permanecer contrato estável do catálogo.
**Impact:** `T2.1` foi validado localmente com 17 categorias sem duplicidade e `T3` pode seguir sobre esse catálogo.

### AD-014: RLS inicial inclui grants explícitos para `authenticated` (2026-07-11)

**Decision:** A migration de `T3` passou a combinar `ENABLE ROW LEVEL SECURITY`, policies por tabela e `GRANT` explícito por operação ao papel `authenticated`.
**Reason:** Policy sem privilégio SQL não libera acesso no Supabase; o cliente precisa dos dois níveis para operar corretamente.
**Trade-off:** A migration fica mais verbosa e obriga manutenção conjunta de grants e policies.
**Impact:** `categories` ficou como leitura autenticada, `sync_events` como leitura do próprio usuário, e as tabelas com `user_id` passaram a aceitar CRUD isolado por dono.

### AD-015: Shell mobile inicial segue Expo Router em `src/app` (2026-07-12)

**Decision:** O bootstrap do app móvel foi criado com `create-expo-app` oficial, preservando Expo Router em `mobile/src/app` e organizando a lógica de produto em `src/features/` e `src/lib/`.
**Reason:** Mantém o shell alinhado ao template suportado do Expo, reduz atrito de setup e permite evoluir a navegação sem abandonar a separação por feature.
**Trade-off:** O projeto herda alguns arquivos utilitários do template do Expo, mesmo usando apenas uma rota mínima nesta fase.
**Impact:** `T4` e `T5` ficaram com shell compilável, rota raiz única e sessão persistida via Supabase Auth + AsyncStorage.

### AD-016: Design system e dashboard visual foram antecipados no mobile (2026-07-12)

**Decision:** O repositório agora já contém um design system GGastos (`mobile/src/components/ggastos/`, `mobile/src/constants/ggastos-theme.ts`), `AppShell` autenticado e uma tela de dashboard com dados mockados.
**Reason:** Antecipar a linguagem visual reduz retrabalho de UI e acelera a Milestone 2.
**Trade-off:** Parte da implementação visual do núcleo mensal existe antes das integrações reais, então as próximas tasks devem evoluir scaffolds existentes em vez de recriá-los.
**Impact:** As specs de `monthly-core` foram ajustadas para reutilizar esse material em `T7`, `T8` e `T9`.

### AD-017: Integração móvel inicial usa React Query + Edge Function real de sync (2026-07-12)

**Decision:** `T7` conectou o shell autenticado a um `QueryClientProvider`, ao client Supabase configurado no padrão oficial para React Native e à chamada real da Edge Function `sync-pluggy`.
**Reason:** Permite validar o loop auth → app shell → comando sensível sem esperar o read model mensal real da Milestone 2.
**Trade-off:** O dashboard ainda combina UI mockada com uma integração real apenas para sync/status, criando uma fase híbrida temporária.
**Impact:** O app já consegue autenticar, entrar no shell e disparar sync manual; `T8` passa a focar validação ponta a ponta local em vez de wiring básico.

### AD-018: `service_role` precisa de GRANT SQL explícito além do bypass de RLS (2026-07-12)

**Decision:** A migration de `T3` concedia privilégios apenas a `authenticated`; `service_role` ficou sem `SELECT/INSERT/UPDATE/DELETE` em nenhuma tabela, quebrando a Edge Function `sync-pluggy` com `permission denied for table profiles`. Criada a migration `20260712020000_grant_service_role_table_privileges.sql` concedendo os privilégios a `service_role` em todas as tabelas do domínio.
**Reason:** `service_role` no Postgres do Supabase ignora *policies* de RLS, mas continua exigindo GRANT de tabela como qualquer outro role — o mesmo princípio já registrado em AD-014 para `authenticated` também se aplica a `service_role`.
**Trade-off:** Nenhum; é uma correção necessária para o contrato de acesso server-side funcionar.
**Impact:** `T8` validou ponta a ponta (dois usuários isolados, seed de categorias, sync real via UI retornando 202) somente após essa correção. Futuras migrations que criem tabelas RLS devem sempre conceder privilégios a `authenticated` e `service_role` juntos.

### AD-019: Componentes mortos do template Expo removidos por quebrarem o typecheck (2026-07-12)

**Decision:** `mobile/src/components/app-tabs.tsx` e `app-tabs.web.tsx` (scaffolding do `create-expo-app`, não importados por nenhuma rota real) foram removidos após confirmarem quebra de `tsc --noEmit` (referenciavam uma rota `/explore` inexistente). `external-link.tsx`, `animated-icon*`, `hint-row.tsx`, `web-badge.tsx` e `ui/collapsible.tsx` ficaram órfãos como consequência e foram sinalizados para limpeza futura (task em background, não bloqueia Milestone 1).
**Reason:** "App compila/inicia no shell mínimo" é critério de `T8`; um `tsc --noEmit` quebrado por código morto não satisfaz esse critério, mesmo o bundler do Metro não falhando em dev.
**Trade-off:** Nenhum — os arquivos removidos não eram usados em nenhuma tela real (`src/app/index.tsx` + `src/app/_layout.tsx` + `src/features/`).
**Impact:** Segunda rodada de validação de `T8` (re-execução completa: migrations do zero, seed idempotente, isolamento RLS em `planned_entries`/`financial_connections`/`sync_events`, bloqueio de acesso não autenticado, rejeição de escrita cross-user, Edge Function com `manual`/`scheduled`/erros de validação, e fluxo completo via UI no browser) passou 100% após as correções de AD-018 e AD-019.

---

## Active Blockers

None.

---

## Lessons Learned

### L-001: O principal ativo do legado é o modelo mental, não o código (2026-07-10)

**Context:** Revisão da planilha de 2021 e do app React Native antigo.
**Problem:** O código antigo não suporta sync real, auth nem conciliação distribuída.
**Solution:** Preservar a lógica de `previsto vs. realizado` na documentação e arquivar o app em `legacy/`.
**Prevents:** Reaproveitamento indevido de storage local, modelagem de parcelas frágil e acoplamentos antigos.

---

## Quick Tasks Completed

| #   | Description                                         | Date       | Commit | Status  |
| --- | --------------------------------------------------- | ---------- | ------ | ------- |
| 001 | Criar docs de produto, TDD, schema e stack técnica  | 2026-07-10 | -      | ✅ Done |
| 002 | Arquivar o projeto legado em `legacy/`              | 2026-07-10 | -      | ✅ Done |
| 003 | Criar estrutura inicial `.specs/` a partir de docs  | 2026-07-10 | -      | ✅ Done |
| 004 | Fechar lacunas de produto e arquitetura             | 2026-07-11 | -      | ✅ Done |
| 005 | Criar specs/tasks das Milestones 2-4                | 2026-07-11 | -      | ✅ Done |
| 006 | Fechar seed, cron, anual e aprovação final das specs | 2026-07-11 | -      | ✅ Done |
| 007 | Criar estrutura base do Supabase (`T1`)             | 2026-07-11 | -      | ✅ Done |
| 008 | Criar migration inicial do domínio MVP (`T2`)       | 2026-07-11 | -      | ✅ Done |
| 009 | Validar `T2` no Supabase local                      | 2026-07-11 | -      | ✅ Done |
| 010 | Criar seed global de categorias (`T2.1`)            | 2026-07-11 | -      | ✅ Done |
| 011 | Habilitar RLS e policies mínimas (`T3`)             | 2026-07-11 | -      | ✅ Done |
| 012 | Criar shell mobile Expo (`T4`)                      | 2026-07-12 | -      | ✅ Done |
| 013 | Implementar autenticação base (`T5`)                | 2026-07-12 | -      | ✅ Done |
| 014 | Criar stub inicial de `sync-pluggy` (`T6`)          | 2026-07-12 | -      | ✅ Done |
| 015 | Integrar mobile com Supabase (`T7`)                 | 2026-07-12 | -      | ✅ Done |
| 016 | Validar fundação ponta a ponta (`T8`)               | 2026-07-12 | -      | ✅ Done |

---

## Deferred Ideas

- [ ] Usar sinais de saúde financeira da Pluggy como enriquecimento opcional — Captured during: definição do PRD
- [ ] Considerar entidade explícita de fatura de cartão em fase 2 — Captured during: TDD
- [ ] Considerar RRULE para recorrências avançadas em fase posterior — Captured during: revisão de lacunas
- [ ] Considerar orçamento-meta por categoria pós-MVP — Captured during: revisão de lacunas
- [ ] Adicionar anexos e comprovantes com Supabase Storage — Captured during: roadmap
- [ ] Avaliar migração para plano comercial da Pluggy se o onboarding no app virar requisito — Captured during: estratégia de integração

---

## Todos

## Preferences

**Model Guidance Shown:** never
