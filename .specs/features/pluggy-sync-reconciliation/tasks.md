# Sync Pluggy e Conciliação Tasks

**Design**: `.specs/features/pluggy-sync-reconciliation/design.md`
**Status**: Approved

---

## Execution Plan

### Phase 1: Sync Infrastructure

`T1 → T2 → T3 → T4`

### Phase 2: Ingestion and Matching

`T4 → T5, T6, T7`

### Phase 3: User Review

`T5, T6, T7 → T8 → T9 → T10`

### Phase 4: Scheduled Sync and Validation

`T10 → T11 → T12`

---

## Task Breakdown

### T1: Criar cliente Pluggy server-side

**What**: Encapsular autenticação e chamadas principais da API Pluggy.
**Where**: `supabase/functions/_shared/pluggy-client.ts`
**Depends on**: Fundação concluída
**Reuses**: Supabase Edge Functions secrets
**Requirement**: SYN-01

**Done when**:

- [ ] Lê secrets server-side.
- [ ] Não expõe credenciais ao cliente.
- [ ] Mapeia erros de autenticação/consentimento.

**Verify**: Teste com mock de fetch e secrets.

---

### T2: Criar normalizadores Pluggy

**What**: Converter payload de conta/transação para contrato interno.
**Where**: `supabase/functions/_shared/normalizers/`
**Depends on**: T1
**Reuses**: `docs/data-contract-schema-spec.md`
**Requirement**: SYN-02

**Done when**:

- [ ] Conta normalizada contém IDs de origem.
- [ ] Transação preserva payload bruto.
- [ ] Metadados internos não são sobrescritos por re-sync.

**Verify**: Unit tests com fixtures de payload.

---

### T3: Implementar upsert idempotente

**What**: Criar funções SQL/shared para upsert de conexões, contas e transações.
**Where**: `supabase/migrations/` e `supabase/functions/_shared/`
**Depends on**: T2
**Reuses**: constraints da fundação
**Requirement**: SYN-02

**Done when**:

- [ ] Reprocessamento não duplica registros.
- [ ] Updates de origem não removem overrides internos.
- [ ] Remoção de origem marca `deleted_at`.

**Verify**: Rodar mesmo lote duas vezes e comparar contagens.

---

### T4: Evoluir `sync-pluggy` para sync real

**What**: Implementar orquestração de sync manual com API Pluggy, eventos e upserts.
**Where**: `supabase/functions/sync-pluggy/`
**Depends on**: T1, T2, T3
**Reuses**: Stub da fundação
**Requirement**: SYN-01, SYN-02

**Done when**:

- [ ] Cria `sync_events` com `user_id`.
- [ ] Processa conexões/contas/transações.
- [ ] Atualiza status da conexão.
- [ ] Retorna resumo do lote.

**Verify**: Invocar função autenticada com fixtures/mock Pluggy.

---

### T5: Criar motor de score [P]

**What**: Implementar cálculo determinístico de score para match 1:1.
**Where**: `supabase/functions/_shared/reconciliation/score.ts`
**Depends on**: T4
**Reuses**: regras do TDD
**Requirement**: SYN-03

**Done when**:

- [ ] Score considera valor, data, categoria, conta e descrição.
- [ ] Rationale é persistível em JSON.
- [ ] Testes cobrem match forte, sugestão e sem match.

**Verify**: Unit tests do score.

---

### T6: Implementar auto-match [P]

**What**: Criar rotina que aplica matches automáticos acima do limiar.
**Where**: `supabase/functions/_shared/reconciliation/auto-match.ts`
**Depends on**: T5
**Reuses**: `reconciliation_matches`
**Requirement**: SYN-03

**Done when**:

- [ ] Cria `AUTO_MATCHED` para score alto.
- [ ] Respeita unicidade de match ativo.
- [ ] Ignora pares rejeitados.

**Verify**: Teste com planejamento + transação semelhante.

---

### T7: Criar view/RPC da inbox [P]

**What**: Expor sugestões pendentes ordenadas por score.
**Where**: `supabase/migrations/`
**Depends on**: T5
**Reuses**: `planned_entries`, `imported_transactions`, `reconciliation_matches`
**Requirement**: SYN-04

**Done when**:

- [ ] Retorna itens por mês.
- [ ] Exclui pares já rejeitados.
- [ ] Respeita RLS por usuário.

**Verify**: Consulta com fixtures de inbox.

---

### T8: Criar Edge Function de decisões de conciliação

**What**: Confirmar, rejeitar e desfazer matches com auditoria.
**Where**: `supabase/functions/reconcile-transactions/`
**Depends on**: T6, T7
**Reuses**: `reconciliation_matches`
**Requirement**: SYN-04

**Done when**:

- [ ] Confirma cria `MANUAL_MATCHED`.
- [ ] Rejeita cria/atualiza `REJECTED`.
- [ ] Desfazer preserva trilha.
- [ ] Impede match ativo duplicado.

**Verify**: Testes de função com usuário autenticado.

---

### T9: Implementar hooks de inbox

**What**: Criar hooks mobile para listar inbox e executar decisões.
**Where**: `mobile/src/features/reconciliation/`
**Depends on**: T7, T8
**Reuses**: Supabase RPC e Edge Function
**Requirement**: SYN-04

**Done when**:

- [ ] Hook lista inbox por mês.
- [ ] Mutations confirmam/rejeitam.
- [ ] Cache do dashboard é invalidado após decisão.

**Verify**: Testes de hooks/mocks.

---

### T10: Criar tela de inbox

**What**: Renderizar sugestões com ações de confirmar/rejeitar.
**Where**: `mobile/src/features/reconciliation/`
**Depends on**: T9
**Reuses**: Mobile shell
**Requirement**: SYN-04

**Done when**:

- [ ] Lista sugestões por score.
- [ ] Mostra estado vazio.
- [ ] Ações atualizam lista.

**Verify**: Rodar app com fixtures de inbox.

---

### T11: Configurar sync agendado

**What**: Criar configuração Supabase Cron para executar sync em conexões ativas.
**Where**: `supabase/migrations/` ou configuração Supabase documentada
**Depends on**: T4
**Reuses**: `sync-pluggy`
**Requirement**: SYN-05

**Done when**:

- [ ] Cron padrão do MVP roda a cada 12 horas
- [ ] Cron chama função com contexto interno.
- [ ] Eventos agendados sem usuário não são visíveis ao cliente.
- [ ] Conexões com erro acionável são ignoradas.

**Verify**: Disparo manual do job/cron em ambiente local ou remoto.

---

### T12: Validar sync e conciliação ponta a ponta

**What**: Validar sync, upsert, matching, inbox e RLS.
**Where**: projeto inteiro
**Depends on**: T10, T11
**Reuses**: critérios da spec
**Requirement**: SYN-01, SYN-02, SYN-03, SYN-04, SYN-05

**Done when**:

- [ ] Sync manual importa lote sem duplicar.
- [ ] Auto-match cria match esperado.
- [ ] Inbox permite confirmar/rejeitar.
- [ ] Eventos e dados respeitam RLS.
- [ ] Dashboard mensal reflete conciliações.

**Verify**: E2E local com fixtures/mock Pluggy.

---

## Parallel Execution Map

```text
Phase 1:
  T1 → T2 → T3 → T4

Phase 2:
  T4 complete, then:
    ├── T5 [P]
    ├── T6 [P]
    └── T7 [P]

Phase 3:
  T5, T6, T7 → T8 → T9 → T10

Phase 4:
  T10 → T11 → T12
```

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | 1 API client | Granular |
| T2 | 1 normalizer group | OK |
| T3 | 1 upsert layer | OK |
| T4 | 1 Edge Function | Granular |
| T5 | 1 scoring function | Granular |
| T6 | 1 matching routine | Granular |
| T7 | 1 read model | Granular |
| T8 | 1 Edge Function | Granular |
| T9 | 1 hook group | OK |
| T10 | 1 screen | Granular |
| T11 | 1 cron setup | Granular |
| T12 | 1 validation pass | Granular |
