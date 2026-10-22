# Fundação Supabase + Mobile Tasks

**Design**: `.specs/features/foundation-supabase-mobile/design.md`
**Status**: Approved

---

## Execution Plan

### Phase 1: Foundation (Sequential)

Tasks that must be done first, in order.

`T1 → T2 → T2.1 → T3`

### Phase 2: Core Implementation (Parallel OK)
After foundation, these can run in parallel.

`T3 → T4, T5, T6`

### Phase 3: Integration (Sequential)
Bringing it all together.

`T4, T5, T6 → T7 → T8`

---

## Task Breakdown

### T1: Criar estrutura base do Supabase

**What**: Inicializar `supabase/` com diretórios e convenções de migrations e functions.
**Where**: `supabase/`
**Depends on**: None
**Reuses**: `docs/stack-tecnica-supabase-mvp.md`
**Requirement**: FND-03

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [x] Estrutura `supabase/migrations/` criada
- [x] Estrutura `supabase/functions/` criada
- [x] Convenções do projeto registradas

---

### T2: Criar primeira migration do domínio MVP

**What**: Criar migration SQL inicial com o schema central completo do MVP: `profiles`, `financial_connections`, `financial_accounts`, `categories`, `imported_transactions`, `planning_templates`, `planned_entries`, `reconciliation_matches`, `user_category_rules`, `month_snapshots` e `sync_events`.
**Where**: `supabase/migrations/`
**Depends on**: T1
**Reuses**: `docs/data-contract-schema-spec.md`
**Requirement**: FND-03, FND-04

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [x] Tabelas centrais do contrato criadas
- [x] Chaves e FKs definidas
- [x] Colunas de auditoria e `user_id` presentes
- [x] `profiles.id` referencia `auth.users.id`
- [x] `sync_events.user_id` é opcional
- [x] Recorrência usa `recurrence_frequency` e `recurrence_interval`, sem RRULE
- [x] Campos de cartão preparados sem entidade `credit_card_bills`

---

### T2.1: Criar seed global de categorias

**What**: Criar seed inicial para o catálogo global de categorias do GGastos.
**Where**: `supabase/seed.sql` ou migration seedável equivalente
**Depends on**: T2
**Reuses**: `docs/data-contract-schema-spec.md`
**Requirement**: FND-03, FND-04

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [x] Categorias globais iniciais inseridas
- [x] Seed reflete o catálogo aprovado com `code`, `name`, `impact_type`, `color` e `parent_id`
- [x] `categories` não possui `user_id`
- [x] Personalização fica representada por `user_category_rules`
- [x] Seed pode ser reaplicada sem duplicar categorias

---

### T3: Habilitar RLS e políticas mínimas

**What**: Definir políticas RLS para garantir isolamento por usuário nas tabelas expostas.
**Where**: `supabase/migrations/`
**Depends on**: T2, T2.1
**Reuses**: padrão de Supabase Auth + RLS
**Requirement**: FND-01, FND-02

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [x] RLS habilitado nas tabelas expostas
- [x] Policies de leitura/escrita por usuário criadas
- [x] `categories` é leitura global autenticada
- [x] `sync_events` permite leitura apenas de eventos com `user_id = auth.uid()`
- [x] Eventos sem `user_id` ficam restritos a backend/service role
- [x] Sem dependência de `service_role` no cliente

---

### T4: Criar shell do app mobile [P]

**What**: Criar estrutura `mobile/` com bootstrap React Native/Expo + TypeScript.
**Where**: `mobile/`
**Depends on**: T3
**Reuses**: `docs/stack-tecnica-supabase-mvp.md`
**Requirement**: FND-07

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [x] Estrutura de pastas por feature criada
- [x] App inicia com shell mínimo
- [x] Dependências-base definidas

---

### T5: Implementar autenticação base [P]

**What**: Criar fluxo de signup, signin, signout e sessão persistida.
**Where**: `mobile/src/features/auth/`
**Depends on**: T3
**Reuses**: Supabase Auth
**Requirement**: FND-01, FND-02

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [x] Cadastro funciona
- [x] Login funciona
- [x] Sessão é restaurada no app

---

### T6: Criar Edge Function `sync-pluggy` stub [P]

**What**: Criar função autenticada que aceite comando de sync manual, registre evento técnico inicial e mantenha contrato compatível com API direta server-side da Pluggy.
**Where**: `supabase/functions/sync-pluggy/`
**Depends on**: T3
**Reuses**: `docs/stack-tecnica-supabase-mvp.md`
**Requirement**: FND-05, FND-06, FND-08

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [x] Endpoint autenticado criado
- [x] Função lê secrets server-side
- [x] Inserção inicial em `sync_events` funciona com `user_id` quando acionada por usuário
- [x] Eventos técnicos sem `user_id` não são expostos ao cliente

---

### T7: Integrar mobile com Supabase

**What**: Conectar app a Auth, API e Edge Function de sync.
**Where**: `mobile/src/lib/supabase/` e `mobile/src/features/`
**Depends on**: T4, T5, T6
**Reuses**: `supabase-js`, TanStack Query
**Requirement**: FND-01, FND-05, FND-07

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [x] Cliente Supabase configurado
- [x] Auth navegando corretamente
- [x] Chamada de sync disponível no app

---

### T8: Validar fundação do MVP

**What**: Verificar schema, auth, RLS e chamada de sync stub de ponta a ponta.
**Where**: projeto inteiro
**Depends on**: T7
**Reuses**: critérios do spec e design
**Requirement**: FND-01, FND-03, FND-05, FND-08

**Tools**:

- MCP: `filesystem`
- Skill: NONE

**Done when**:

- [x] Usuário autentica e mantém sessão
- [x] Dados ficam isolados por usuário em teste com pelo menos dois usuários
- [x] Sync stub registra evento técnico
- [x] Chamada autenticada da Edge Function retorna resposta válida
- [x] Seed de categorias é aplicada e consultável
- [x] App compila/inicia no shell mínimo
- [x] Base está pronta para próximas features

---

## Parallel Execution Map

```text
Phase 1 (Sequential):
  T1 ──→ T2 ──→ T2.1 ──→ T3

Phase 2 (Parallel):
  T3 complete, then:
    ├── T4 [P]
    ├── T5 [P]
    └── T6 [P]

Phase 3 (Sequential):
  T4, T5, T6 complete, then:
    T7 ──→ T8
```

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1: Estrutura base do Supabase | 1 área do projeto | ✅ Granular |
| T2: Primeira migration do domínio MVP | 1 deliverable coeso | ✅ Granular |
| T2.1: Seed global de categorias | 1 deliverable coeso | ✅ Granular |
| T3: RLS e policies mínimas | 1 deliverable coeso | ✅ Granular |
| T4: Shell do app mobile | 1 deliverable coeso | ✅ Granular |
| T5: Auth base | 1 feature coesa | ✅ Granular |
| T6: Edge Function stub | 1 endpoint/função | ✅ Granular |
| T7: Integração mobile com Supabase | 1 camada de integração | ✅ Granular |
| T8: Validação da fundação | 1 etapa de verificação | ✅ Granular |

---

## MCPs e Skills para execução

Antes da implementação:

- **Available MCPs**: `filesystem` e os comandos locais do ambiente
- **Available Skills**: `tlc-spec-driven`; skills especializados podem ser usados sob demanda se o escopo evoluir

Se você quiser, na execução eu sigo com esse conjunto padrão sem depender de ferramentas extras.
