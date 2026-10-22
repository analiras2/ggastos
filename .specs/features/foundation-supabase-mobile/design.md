# Fundação Supabase + Mobile Design

**Spec**: `.specs/features/foundation-supabase-mobile/spec.md`
**Status**: Approved

---

## Architecture Overview

A fundação do MVP será organizada em dois blocos principais:
- `mobile/`: cliente React Native/Expo responsável por autenticação, navegação e chamadas ao Supabase;
- `supabase/`: migrations, políticas RLS e Edge Functions responsáveis pelo domínio sensível e pela integração com Pluggy.

O cliente acessa:
- tabelas e views seguras por RLS via `supabase-js`;
- funções server-side para sync e comandos sensíveis.

---

## Code Reuse Analysis

### Existing Components to Leverage

| Component | Location | How to Use |
| --- | --- | --- |
| Documentação de produto | `docs/prd-ggastos-v2.md` | Fonte de visão, escopo e fluxos |
| Design técnico | `docs/tdd-ggastos-v2.md` | Base para arquitetura e responsabilidades |
| Contrato de dados | `docs/data-contract-schema-spec.md` | Base do schema inicial |
| Stack técnica | `docs/stack-tecnica-supabase-mvp.md` | Base de estrutura e decisões fechadas |
| Código legado | `legacy/` | Apenas consulta pontual de nomenclatura e conceitos |

### Integration Points

| System | Integration Method |
| --- | --- |
| Supabase Auth | Sessão no app via `supabase-js` |
| Postgres | Migrations SQL e acesso com RLS |
| Edge Functions | HTTP invocado pelo app e por cron |
| Pluggy | Descoberta híbrida quando útil; produto mira API direta server-side via função de sync |

---

## Components

### Mobile Bootstrap

- **Purpose**: Iniciar o app, prover sessão e definir fluxo autenticado/não autenticado.
- **Location**: `mobile/`
- **Interfaces**:
  - `createSupabaseClient(): SupabaseClient` - cria cliente configurado
  - `getSession(): Session | null` - recupera sessão
- **Dependencies**: Expo, React Native, Supabase JS
- **Reuses**: decisões e estrutura definidas em `docs/stack-tecnica-supabase-mvp.md`

### Auth Feature

- **Purpose**: Cadastro, login, logout e restauração de sessão.
- **Location**: `mobile/src/features/auth/`
- **Interfaces**:
  - `signUp(email, password): Promise<Result>`
  - `signIn(email, password): Promise<Result>`
  - `signOut(): Promise<void>`
- **Dependencies**: Supabase Auth
- **Reuses**: RLS e `profiles` no banco

### Database Schema Layer

- **Purpose**: Definir schema central completo do MVP, constraints e políticas RLS.
- **Location**: `supabase/migrations/`
- **Interfaces**:
  - migration SQL versionada
  - policies SQL por tabela
- **Dependencies**: Supabase Postgres, RLS
- **Reuses**: `docs/data-contract-schema-spec.md`
- **Scope**: criar desde a fundação todas as tabelas centrais, mesmo que telas e comandos de negócio sejam implementados em milestones posteriores.

### Sync Edge Function

- **Purpose**: Receber comando de sync e encapsular integração Pluggy server-side.
- **Location**: `supabase/functions/sync-pluggy/`
- **Interfaces**:
  - `POST /functions/v1/sync-pluggy`
- **Dependencies**: service role, Pluggy secrets, schema `sync_events`
- **Reuses**: pipeline definido em `docs/stack-tecnica-supabase-mvp.md`

### Observability/Event Logging

- **Purpose**: Registrar execuções técnicas iniciais do sistema.
- **Location**: Postgres + Edge Functions
- **Interfaces**:
  - insert em `sync_events`
  - consulta administrativa por execução
- **Dependencies**: Postgres
- **Reuses**: schema proposto no data contract

---

## Data Models (if applicable)

### `profiles`

```typescript
interface Profile {
  id: string
  email: string
  display_name?: string
  locale?: string
  base_currency: 'BRL'
  created_at: string
  updated_at: string
}
```

**Relationships**: 1:1 com usuário autenticado.

### `financial_connections`

```typescript
interface FinancialConnection {
  id: string
  user_id: string
  pluggy_item_id?: string
  institution_name: string
  status: 'UPDATING' | 'UPDATED' | 'LOGIN_ERROR' | 'OUTDATED' | 'WAITING_USER_INPUT' | 'DELETED'
  last_synced_at?: string
  last_sync_requested_at?: string
  created_at: string
  updated_at: string
}
```

**Relationships**: 1:N com `financial_accounts`.

### `sync_events`

```typescript
interface SyncEvent {
  id: string
  event_id?: string
  user_id?: string
  event_type: string
  connection_id?: string
  processing_status: 'RECEIVED' | 'PROCESSED' | 'FAILED' | 'IGNORED'
  payload: Record<string, unknown>
  error_message?: string
  received_at: string
  processed_at?: string
}
```

**Relationships**: referência técnica para sync e auditoria.

Eventos com `user_id` pertencem ao usuário e podem ser expostos via RLS. Eventos
sem `user_id` são técnicos/globais e devem ficar restritos ao backend/service role.

### Domain Decisions Reflected In Schema

- `profiles` é a tabela pública de perfil e referencia `auth.users`.
- `categories` é catálogo global com seed inicial; personalização fica em `user_category_rules`.
- O seed inicial de `categories` usa quatro raízes (`income`, `expense`, `investment`, `transfer`) e categorias filhas aprovadas para o MVP.
- `planning_templates` usa `recurrence_frequency` e `recurrence_interval`, sem RRULE no MVP.
- Cartão de crédito usa transações individuais e campos `due_date`/`close_date` em `financial_accounts`; `credit_card_bills` fica fora do MVP.
- Transferências internas são neutras por padrão por `impact_type = TRANSFER`, `is_internal_transfer = true` e `is_hidden_from_budget = true`.
- Transações importadas preservam campos de origem; usuário edita apenas metadados internos.
- Dashboard mensal usa view/RPC em tempo real no MVP; `month_snapshots` é persistido no fechamento e após sync/reprocessamento relevante.

---

## Error Handling Strategy

| Error Scenario | Handling | User Impact |
| --- | --- | --- |
| Login inválido | Mensagem de auth tratada no app | Usuário corrige credenciais |
| RLS negando acesso | Retorno seguro sem vazar dados | Usuário vê falta de autorização, não dados errados |
| Migration incompleta | Falha explícita no deploy/local setup | Time corrige antes de continuar |
| Sync Pluggy ainda stubado | Retorno controlado com evento técnico | Usuário não quebra o app, apenas vê indisponibilidade |

---

## Tech Decisions (only non-obvious ones)

| Decision | Choice | Rationale |
| --- | --- | --- |
| Mobile shell | Expo | Acelera o MVP e reduz atrito operacional |
| Auth do MVP | E-mail/senha | Menor complexidade inicial |
| Escritas sensíveis | Edge Functions | Evita lógica crítica no cliente |
| Leituras agregadas | Views/RPC + RLS | Mantém regra de leitura no banco e reduz lógica no cliente |
| Escritas triviais | `supabase-js` + RLS | Permitido apenas quando a regra de domínio for simples |
| Sync Pluggy | Edge Function compatível com API direta | Permite descoberta híbrida sem desviar o produto final |
