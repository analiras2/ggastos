# Fechamento e Endurecimento Tasks

**Design**: `.specs/features/closing-hardening/design.md`
**Status**: Approved

---

## Execution Plan

### Phase 1: Snapshot and Annual Read Models

`T1 → T2 → T3`

### Phase 2: Reprocessing and Observability

`T3 → T4, T5, T6`

### Phase 3: UI and Security

`T4, T5, T6 → T7, T8 → T9`

### Phase 4: MVP Hardening Validation

`T9 → T10`

---

## Task Breakdown

### T1: Criar função de snapshot mensal

**What**: Implementar cálculo e upsert de `month_snapshots` para um mês.
**Where**: `supabase/functions/recalculate-month-snapshot/`
**Depends on**: Núcleo mensal concluído
**Reuses**: `get_month_dashboard`
**Requirement**: CLS-01

**Done when**:

- [x] Cria snapshot de mês vazio.
- [x] Atualiza snapshot existente com novo `computed_at`.
- [x] Preserva status `OPEN`/`CLOSED`.
- [x] Não bloqueia correções posteriores.

**Verify**: Invocar função com mês de fixture e validar tabela.

---

### T2: Criar RPC de consolidado anual por competência

**What**: Implementar `get_annual_summary(year)` com semântica de competência no MVP.
**Where**: `supabase/migrations/`
**Depends on**: T1
**Reuses**: `month_snapshots`, `categories`
**Requirement**: CLS-02

**Done when**:

- [x] Retorna meses do ano.
- [x] Retorna totais por categoria.
- [x] Mantém transferências neutras.
- [x] Lida com meses sem snapshot.
- [x] Não mistura competência com liquidação no contrato do MVP.

**Verify**: Consulta com snapshots de dois meses.

---

### T3: Criar comandos de fechamento mensal

**What**: Criar service/hook mobile para fechar/recalcular mês.
**Where**: `mobile/src/features/closing/`
**Depends on**: T1
**Reuses**: Edge Function de snapshot
**Requirement**: CLS-01

**Done when**:

- [x] Usuário dispara fechamento.
- [x] Estado de loading/erro/sucesso existe.
- [x] Dashboard/anual invalidam cache após fechamento.

**Verify**: Teste de mutation/hook.

---

### T4: Criar função de reprocessamento [P]

**What**: Implementar Edge Function para reprocessar snapshot, matching ou evento de sync.
**Where**: `supabase/functions/reprocess-financial-data/`
**Depends on**: T1
**Reuses**: matching engine, snapshot function, `sync_events`
**Requirement**: CLS-03

**Done when**:

- [x] Aceita escopo controlado.
- [x] Registra evento técnico.
- [x] Falha sem corromper estado anterior.

**Verify**: Teste de reprocessamento com fixture.

---

### T5: Melhorar observabilidade de sync/conciliação [P]

**What**: Padronizar eventos, erros e métricas mínimas.
**Where**: `supabase/functions/` e `supabase/migrations/`
**Depends on**: Sync/conciliação concluídos
**Reuses**: `sync_events`
**Requirement**: CLS-03, CLS-05

**Done when**:

- [x] Eventos registram tipo, status, user/connection e erro sanitizado.
- [x] Logs não contêm credenciais.
- [x] Status de conexão reflete último sync.

**Verify**: Forçar sucesso e falha de sync.

---

### T6: Criar suíte de segurança RLS [P]

**What**: Testar isolamento de tabelas, views/RPCs e Edge Functions com dois usuários.
**Where**: `supabase/tests/` ou scripts do projeto
**Depends on**: Fundação, núcleo mensal e sync concluídos
**Reuses**: fixtures multiusuário
**Requirement**: CLS-04

**Done when**:

- [x] Usuário A não lê dados do usuário B.
- [x] RPCs respeitam usuário autenticado.
- [x] Edge Functions validam dono dos recursos.
- [x] `categories` é leitura global autenticada.

**Verify**: Rodar suíte RLS.

---

### T7: Criar tela de consolidado anual [P]

**What**: Renderizar anual por mês e categoria.
**Where**: `mobile/src/features/reports/`
**Depends on**: T2
**Reuses**: TanStack Query, RPC anual
**Requirement**: CLS-02

**Done when**:

- [x] Exibe totais mensais.
- [x] Exibe totais por categoria.
- [x] Estado vazio funciona.

**Verify**: Rodar app com snapshots de fixture.

---

### T8: Criar status mínimo de sync [P]

**What**: Mostrar último sync e erro acionável por conexão.
**Where**: `mobile/src/features/settings/` ou `mobile/src/features/connections/`
**Depends on**: T5
**Reuses**: `financial_connections`, `sync_events`
**Requirement**: CLS-05

**Done when**:

- [x] Mostra último sucesso.
- [x] Mostra erro de consentimento/autorização.
- [x] Não expõe logs técnicos sensíveis.

**Verify**: Fixture de conexão com sucesso e erro.

---

### T9: Criar checklist de hardening do MVP

**What**: Documentar e automatizar validações finais mínimas.
**Where**: `.specs/features/closing-hardening/` e scripts do projeto
**Depends on**: T4, T5, T6, T7, T8
**Reuses**: critérios das specs
**Requirement**: CLS-04

**Done when**:

- [x] Checklist cobre migrations, RLS, sync, dashboard, conciliação e fechamento.
- [x] Comandos de validação estão documentados.
- [x] Falhas bloqueiam início de UAT.

**Verify**: Executar checklist em ambiente local.

---

### T10: Validar MVP ponta a ponta

**What**: Rodar fluxo completo: auth, planejamento, dashboard, sync, conciliação, fechamento e anual.
**Where**: projeto inteiro
**Depends on**: T9
**Reuses**: PRD/TDD e specs das Milestones 1-4
**Requirement**: CLS-01, CLS-02, CLS-03, CLS-04, CLS-05

**Done when**:

- [x] Usuário cria planejamento.
- [x] Sync importa dados.
- [x] Conciliação ocorre ou vai para inbox.
- [x] Dashboard reflete estado correto.
- [x] Fechamento gera snapshot.
- [x] Consolidado anual mostra resultado.
- [x] RLS passa com dois usuários.

**Verify**: E2E manual/automatizado documentado.

---

## Parallel Execution Map

```text
Phase 1:
  T1 → T2 → T3

Phase 2:
  T3 complete, then:
    ├── T4 [P]
    ├── T5 [P]
    └── T6 [P]

Phase 3:
  T4, T5, T6 complete, then:
    ├── T7 [P]
    └── T8 [P]
  T7, T8 → T9

Phase 4:
  T9 → T10
```

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | 1 Edge Function | Granular |
| T2 | 1 annual read model | Granular |
| T3 | 1 hook/service | Granular |
| T4 | 1 Edge Function | Granular |
| T5 | Observability pass | OK |
| T6 | Security test suite | OK |
| T7 | 1 screen | Granular |
| T8 | 1 status view | Granular |
| T9 | 1 checklist | Granular |
| T10 | 1 validation pass | Granular |
