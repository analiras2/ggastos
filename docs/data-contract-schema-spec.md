# Data Contract & Schema Spec - GGastos v2

## Metadados
- Projeto: GGastos v2
- Data: 2026-07-11
- Status: Baseline histórico com extensão ativa de importação CSV em 2026-08-05
- Idioma: PT-BR

## Estratégia ativa de origem de dados

O schema preserva colunas herdadas da Pluggy por compatibilidade temporária,
mas a origem ativa é CSV de fatura. A migration
`20260803190000_create_statement_import_batches.sql` adiciona
`statement_import_batches` e os metadados `statement_*` em
`imported_transactions`: banco, lote, fingerprint, seção, modo de importação e
parcelas. O índice único por usuário, banco e fingerprint garante reimportação
idempotente.

`financial_connections`, `financial_accounts` e `imported_transactions` usam
agora `source_provider` com `source_connection_id`, `source_account_id` e
`source_transaction_id` como identidade ativa. As colunas `pluggy_*` ficaram
opcionais e existem somente para compatibilidade histórica; novos imports CSV
não as preenchem.

## Objetivo
Definir o contrato de dados interno do GGastos v2 para suportar:
- ingestão de faturas CSV e fontes futuras;
- planejamento manual;
- conciliação entre planejado e realizado;
- agregações mensais e anuais;
- evolução futura sem acoplamento direto ao payload bruto do provedor.

## Princípios
- Separar `dados importados` de `dados de produto`.
- Preservar o `raw payload` do provedor para auditoria.
- Expor ao app mobile um schema interno estável.
- Modelar `planejado`, `realizado` e `conciliado` como conceitos distintos.

## Convenções Gerais
- IDs internos: UUID.
- Datas operacionais mensais: `YYYY-MM`.
- Valores monetários: inteiro em centavos (`amount_cents`).
- Moeda padrão do MVP: `BRL`.
- Timestamps: ISO 8601 UTC.
- Soft delete apenas quando necessário para auditoria.

## Enumerações

### `recurrence_frequency`
- `NONE`
- `MONTHLY`
- `YEARLY`

### `connection_status`
- `UPDATING`
- `UPDATED`
- `LOGIN_ERROR`
- `OUTDATED`
- `WAITING_USER_INPUT`
- `DELETED`

### `account_type`
- `BANK`
- `CREDIT`

### `account_subtype`
- `CHECKING_ACCOUNT`
- `SAVINGS_ACCOUNT`
- `CREDIT_CARD`
- `OTHER`

### `transaction_status`
- `PENDING`
- `POSTED`

### `transaction_direction`
- `DEBIT`
- `CREDIT`

### `entry_origin`
- `PLUGGY`
- `MANUAL`
- `RECURRING_TEMPLATE`
- `INSTALLMENT_TEMPLATE`
- `SYSTEM`

### `planning_status`
- `PLANNED`
- `PROJECTED`
- `RECONCILED`
- `CANCELLED`
- `CARRIED_OVER`

### `match_status`
- `UNMATCHED`
- `AUTO_MATCHED`
- `MANUAL_MATCHED`
- `REJECTED`
- `IGNORED`

### `budget_impact_type`
- `INCOME`
- `EXPENSE`
- `INVESTMENT`
- `TRANSFER`

## Entidades

### 1. `profiles`
Representa o perfil público do usuário final do GGastos.

Nota: a identidade de autenticação vive em `auth.users`. O domínio público usa
`public.profiles.id` como FK para `auth.users.id`, evitando confusão entre a
tabela interna do Supabase Auth e os dados de produto.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK e FK `auth.users.id` |
| email | text | sim | único |
| display_name | text | não | |
| locale | text | não | default `pt-BR` |
| base_currency | text | sim | default `BRL` |
| created_at | timestamptz | sim | |
| updated_at | timestamptz | sim | |

### 2. `financial_connections`
Uma conexão do usuário com uma instituição ou origem sincronizada via ecossistema pessoal da Pluggy.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK |
| user_id | uuid | sim | FK `profiles.id` |
| pluggy_item_id | text | não | identificador da origem quando exposto pela Pluggy |
| pluggy_connector_id | text | não | |
| institution_name | text | sim | |
| status | connection_status | sim | |
| last_synced_at | timestamptz | não | |
| last_sync_requested_at | timestamptz | não | |
| last_error_code | text | não | |
| last_error_message | text | não | |
| consent_expires_at | timestamptz | não | |
| created_at | timestamptz | sim | |
| updated_at | timestamptz | sim | |

### 3. `financial_accounts`
Conta bancária ou cartão vinculado à conexão.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK |
| user_id | uuid | sim | FK `profiles.id` |
| connection_id | uuid | sim | FK `financial_connections.id` |
| pluggy_account_id | text | sim | único |
| type | account_type | sim | |
| subtype | account_subtype | sim | |
| name | text | sim | |
| marketing_name | text | não | |
| masked_number | text | não | |
| owner_name | text | não | |
| currency_code | text | sim | |
| balance_cents | bigint | não | último saldo conhecido |
| credit_limit_cents | bigint | não | apenas cartão |
| due_date | date | não | apenas cartão |
| close_date | date | não | apenas cartão |
| provider_payload | jsonb | sim | payload bruto normalizado do provider |
| created_at | timestamptz | sim | |
| updated_at | timestamptz | sim | |

### 4. `categories`
Taxonomia interna global do GGastos.

Categorias são globais e sem `user_id` no MVP. Personalizações do usuário devem
ser feitas por `user_category_rules` e metadados em transações/planejamentos.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK |
| code | text | sim | único, ex: `food` |
| name | text | sim | |
| impact_type | budget_impact_type | sim | |
| color | text | não | |
| parent_id | uuid | não | FK autorreferente |
| is_active | boolean | sim | |
| created_at | timestamptz | sim | |
| updated_at | timestamptz | sim | |

Seed inicial aprovado para o MVP:

| code | name | impact_type | color | parent_code |
|---|---|---|---|---|
| income | Receitas | INCOME | `#2E8B57` | - |
| expense | Despesas | EXPENSE | `#D1495B` | - |
| investment | Investimentos | INVESTMENT | `#1F6FEB` | - |
| transfer | Transferências | TRANSFER | `#6B7280` | - |
| salary | Salário | INCOME | `#2E8B57` | income |
| extra_income | Renda extra | INCOME | `#3FAF75` | income |
| housing | Moradia | EXPENSE | `#C44536` | expense |
| food | Alimentação | EXPENSE | `#E07A5F` | expense |
| transport | Transporte | EXPENSE | `#F2A65A` | expense |
| health | Saúde | EXPENSE | `#D7263D` | expense |
| education | Educação | EXPENSE | `#4D908E` | expense |
| bills | Contas e serviços | EXPENSE | `#577590` | expense |
| shopping | Compras | EXPENSE | `#9C6644` | expense |
| leisure | Lazer | EXPENSE | `#7B2CBF` | expense |
| taxes_fees | Impostos e tarifas | EXPENSE | `#6C757D` | expense |
| invested_amount | Aportes | INVESTMENT | `#277DA1` | investment |
| internal_transfer | Transferência interna | TRANSFER | `#6B7280` | transfer |

### 5. `imported_transactions`
Transações importadas da Pluggy.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK |
| user_id | uuid | sim | FK `profiles.id` |
| connection_id | uuid | sim | FK |
| account_id | uuid | sim | FK `financial_accounts.id` |
| pluggy_transaction_id | text | sim | único |
| provider_created_at | timestamptz | não | |
| provider_updated_at | timestamptz | não | |
| posted_at | timestamptz | sim | data da transação |
| competency_month | text | sim | `YYYY-MM` |
| description | text | sim | |
| description_raw | text | não | |
| amount_cents | bigint | sim | sinal preservado |
| currency_code | text | sim | |
| status | transaction_status | sim | |
| direction | transaction_direction | sim | |
| pluggy_category_id | text | não | opcional, não deve ser tratado como contrato obrigatório |
| pluggy_category_name | text | não | opcional, não deve ser tratado como contrato obrigatório |
| merchant_name | text | não | |
| merchant_legal_name | text | não | |
| merchant_cnpj | text | não | |
| internal_category_id | uuid | não | FK `categories.id` |
| impact_type | budget_impact_type | sim | regra interna |
| is_internal_transfer | boolean | sim | default false |
| is_hidden_from_budget | boolean | sim | default false |
| note | text | não | nota do usuário |
| provider_payload | jsonb | sim | payload bruto |
| created_at | timestamptz | sim | |
| updated_at | timestamptz | sim | |
| deleted_at | timestamptz | não | usado quando provider sinaliza remoção |

### 6. `planning_templates`
Modelo recorrente ou parcelado que gera entradas planejadas.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK |
| user_id | uuid | sim | FK `profiles.id` |
| title | text | sim | |
| description | text | não | |
| origin | entry_origin | sim | geralmente `MANUAL` |
| impact_type | budget_impact_type | sim | |
| category_id | uuid | sim | FK |
| expected_account_id | uuid | não | FK opcional |
| expected_merchant_hint | text | não | |
| recurrence_frequency | recurrence_frequency | sim | default `NONE` |
| recurrence_interval | integer | sim | default `1`; usado com `MONTHLY`/`YEARLY` |
| installment_total | integer | não | para parcelamento conhecido |
| installment_amount_cents | bigint | não | |
| start_month | text | sim | `YYYY-MM` |
| end_month | text | não | `YYYY-MM` |
| default_amount_cents | bigint | sim | |
| is_mandatory | boolean | sim | |
| is_active | boolean | sim | |
| created_at | timestamptz | sim | |
| updated_at | timestamptz | sim | |

### 7. `planned_entries`
Ocorrência mensal concreta usada no dashboard.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK |
| user_id | uuid | sim | FK `profiles.id` |
| template_id | uuid | não | FK `planning_templates.id` |
| month | text | sim | `YYYY-MM` |
| title | text | sim | |
| impact_type | budget_impact_type | sim | |
| category_id | uuid | sim | FK |
| expected_account_id | uuid | não | FK |
| amount_cents | bigint | sim | valor previsto |
| due_date | date | não | |
| status | planning_status | sim | |
| installment_index | integer | não | |
| installment_total | integer | não | |
| note | text | não | |
| created_at | timestamptz | sim | |
| updated_at | timestamptz | sim | |
| cancelled_at | timestamptz | não | |

### 8. `reconciliation_matches`
Vínculo entre transação importada e planejamento.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK |
| user_id | uuid | sim | FK `profiles.id` |
| planned_entry_id | uuid | sim | FK |
| imported_transaction_id | uuid | sim | FK |
| status | match_status | sim | |
| matched_by | text | sim | `SYSTEM` ou `USER` |
| match_score | numeric(5,4) | não | 0.0000 a 1.0000 |
| amount_delta_cents | bigint | não | |
| date_delta_days | integer | não | |
| rationale | jsonb | não | fatores de matching |
| created_at | timestamptz | sim | |
| updated_at | timestamptz | sim | |

Restrição:
- índice único parcial para impedir múltiplos matches ativos por `planned_entry_id` e `imported_transaction_id`.

### 9. `user_category_rules`
Regras pessoais para remapeamento automático.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK |
| user_id | uuid | sim | FK `profiles.id` |
| rule_type | text | sim | ex: `DESCRIPTION_CONTAINS`, `MERCHANT_CNPJ`, `ACCOUNT` |
| rule_value | text | sim | |
| target_category_id | uuid | sim | FK |
| priority | integer | sim | menor número = maior prioridade |
| is_active | boolean | sim | |
| created_at | timestamptz | sim | |
| updated_at | timestamptz | sim | |

### 10. `month_snapshots`
Agregação mensal persistida para leitura rápida e fechamento lógico.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK |
| user_id | uuid | sim | FK `profiles.id` |
| month | text | sim | único por usuário |
| planned_income_cents | bigint | sim | |
| actual_income_cents | bigint | sim | |
| planned_expense_cents | bigint | sim | |
| actual_expense_cents | bigint | sim | |
| planned_investment_cents | bigint | sim | |
| actual_investment_cents | bigint | sim | |
| expected_balance_cents | bigint | sim | |
| current_balance_cents | bigint | sim | |
| committed_remaining_cents | bigint | sim | |
| status | text | sim | `OPEN` / `CLOSED` |
| snapshot_payload | jsonb | sim | detalhamento por categoria |
| computed_at | timestamptz | sim | |
| updated_at | timestamptz | sim | |

### 11. `sync_events`
Registro de execuções e eventos técnicos para idempotência e auditoria.

| Campo | Tipo | Obrigatório | Observação |
|---|---|---:|---|
| id | uuid | sim | PK |
| event_id | text | não | id externo quando existir |
| user_id | uuid | não | FK `profiles.id`; nulo para eventos técnicos globais/service-only |
| event_type | text | sim | |
| connection_id | uuid | não | FK |
| account_id | uuid | não | FK |
| processing_status | text | sim | `RECEIVED`, `PROCESSED`, `FAILED`, `IGNORED` |
| payload | jsonb | sim | |
| error_message | text | não | |
| received_at | timestamptz | sim | |
| processed_at | timestamptz | não | |

## Contratos de API Interna

### `POST /pluggy/sync`
Dispara uma sincronização dos próprios dados disponíveis via Pluggy.

Request:
```json
{
  "connectionId": "uuid-or-null",
  "mode": "manual"
}
```

Response:
```json
{
  "syncEventId": "uuid",
  "status": "RECEIVED"
}
```

### `GET /me/dashboard?month=2026-07`
Response:
```json
{
  "month": "2026-07",
  "summary": {
    "plannedIncomeCents": 1500000,
    "actualIncomeCents": 1200000,
    "plannedExpenseCents": 980000,
    "actualExpenseCents": 615000,
    "expectedBalanceCents": 520000,
    "currentBalanceCents": 585000,
    "committedRemainingCents": 365000
  },
  "categories": [
    {
      "categoryCode": "food",
      "name": "Alimentação",
      "plannedCents": 120000,
      "actualCents": 95000,
      "deltaCents": -25000
    }
  ]
}
```

### `GET /me/months/:month/reconciliation-inbox`
Response:
```json
{
  "month": "2026-07",
  "items": [
    {
      "transactionId": "uuid",
      "description": "NETFLIX",
      "amountCents": -3990,
      "postedAt": "2026-07-08T03:00:00Z",
      "suggestions": [
        {
          "plannedEntryId": "uuid",
          "score": 0.94
        }
      ]
    }
  ]
}
```

### `POST /reconciliation/matches`
Request:
```json
{
  "plannedEntryId": "uuid",
  "transactionId": "uuid",
  "decision": "CONFIRM"
}
```

Response:
```json
{
  "matchId": "uuid",
  "status": "MANUAL_MATCHED"
}
```

## Contrato de Sincronização Externa
Cada sincronização com a Pluggy deve registrar um payload bruto e um resumo do lote processado.

Payload mínimo esperado internamente:
```json
{
  "eventType": "MANUAL_SYNC",
  "connectionId": "uuid-or-null",
  "userId": "uuid-or-null",
  "startedAt": "2026-07-10T18:00:00Z"
}
```

## Decisões Fechadas Para o MVP

- Integração Pluggy: abordagem híbrida para descoberta, mas produto e arquitetura assumem API direta server-side via Edge Functions.
- Schema inicial: criar todas as tabelas centrais do contrato desde a fundação; implementar telas/funções de negócio em fases.
- Usuário público: usar `profiles`, referenciando `auth.users`.
- `sync_events`: `user_id` opcional; eventos de usuário são visíveis por RLS ao dono, eventos sem usuário ficam restritos ao backend/service role.
- Categorias: catálogo global fixo com seed inicial; personalização por `user_category_rules`.
- Seed inicial aprovado: quatro raízes (`income`, `expense`, `investment`, `transfer`) e categorias filhas documentadas nesta spec.
- Transferências internas: neutras por padrão, com override do usuário.
- Cartão de crédito: sem entidade `credit_card_bills` no MVP; manter campos `due_date`/`close_date` em `financial_accounts` e usar transações individuais + planejamentos/parcelas.
- Recorrência: enum simples + campos auxiliares, sem RRULE no MVP.
- Sync: manual + agendado; fundação entrega endpoint/stub, cron entra na feature de sync real.
- Sync agendado padrão do MVP: a cada 12 horas.
- Transações importadas: payload e campos de origem preservados; usuário edita apenas metadados internos.
- Fechamento mensal: snapshot informativo, sem bloquear correções posteriores.
- Dashboard/snapshot: dashboard por view/RPC em tempo real no MVP; `month_snapshots` persistido no fechamento e após sync/reprocessamento relevante.
- Consolidado anual do MVP: cálculo apenas por competência; liquidação fica para evolução futura.
- Orçamento/meta por categoria: fora do MVP.
- APIs: leituras por views/RPC e comandos sensíveis por Edge Functions.

## Regras de Derivação

### Competência mensal
- Derivada de `posted_at` para importadas.
- Definida explicitamente para planejadas.

### Saldo esperado
`planned_income - planned_expense - planned_investment`

### Saldo atual
`actual_income - actual_expense - actual_investment`

### Comprometido restante
Soma dos `planned_entries` ainda não conciliados e não cancelados do mês, considerando apenas tipos com impacto orçamentário.

## Regras de Integridade
- Toda transação importada pertence a exatamente uma conta.
- Toda conta pertence a exatamente uma conexão.
- Toda entrada planejada pertence a exatamente um mês.
- Todo match referencia exatamente um planejamento e uma transação.
- Sincronizações repetidas não podem gerar duplicidade material nas transações persistidas.
- Campos de origem em `imported_transactions` não devem ser editados pelo usuário; ajustes ficam em metadados internos.
- Transferências internas devem ficar fora dos cálculos orçamentários por padrão.

## Índices Recomendados
- `imported_transactions (user_id, competency_month)`
- `imported_transactions (pluggy_transaction_id)`
- `planned_entries (user_id, month, status)`
- `reconciliation_matches (planned_entry_id)`
- `reconciliation_matches (imported_transaction_id)`
- `sync_events (user_id, received_at)`
- `sync_events (event_id)`
- `financial_connections (pluggy_item_id)`
