# Núcleo Mensal do Produto Tasks

**Design**: `.specs/features/monthly-core/design.md`
**Status**: Approved

---

## Execution Plan

### Phase 1: Data Read/Write Foundation

`T1 → T2 → T3`

### Phase 2: Planning Implementation

`T3 → T4, T5, T6`

### Phase 3: Dashboard Implementation

`T4, T5, T6 → T7 → T8 → T9`

### Phase 4: Validation

`T9 → T10`

---

## Task Breakdown

### T1: Criar schemas Zod e tipos do núcleo mensal

**What**: Definir schemas e tipos para planejamento, template, dashboard e detalhes de categoria.
**Where**: `mobile/src/features/planning/` e `mobile/src/features/dashboard/`
**Depends on**: Fundação concluída
**Reuses**: `docs/data-contract-schema-spec.md`
**Requirement**: MON-01, MON-02, MON-03, MON-04

**Done when**:

- [ ] Inputs de planejamento têm validação de valor, mês, categoria e impacto.
- [ ] Tipos de resposta do dashboard estão definidos.
- [ ] Testes de schema cobrem valores inválidos.

**Verify**: `npm test` no workspace mobile quando existir.

---

### T2: Criar RPC/view `get_month_dashboard`

**What**: Implementar leitura agregada mensal com totais e categorias.
**Where**: `supabase/migrations/`
**Depends on**: Fundação concluída
**Reuses**: `planned_entries`, `imported_transactions`, `categories`
**Requirement**: MON-04

**Done when**:

- [ ] RPC/view retorna payload zerado para mês vazio.
- [ ] Previsto ignora planejamentos cancelados.
- [ ] Realizado ignora transações ocultas do orçamento.
- [ ] Transferências internas são neutras por padrão.

**Verify**: Rodar consulta SQL com fixtures de um usuário.

---

### T3: Criar constraints de idempotência para ocorrências

**What**: Garantir que geração recorrente/parcelada não duplique ocorrências.
**Where**: `supabase/migrations/`
**Depends on**: Fundação concluída
**Reuses**: `planning_templates`, `planned_entries`
**Requirement**: MON-02, MON-03

**Done when**:

- [ ] Existe chave/índice para evitar duplicidade por template, mês e parcela.
- [ ] Inserts repetidos não geram duplicatas.

**Verify**: Executar insert duplicado e confirmar conflito controlado.

---

### T4: Implementar serviço de planejamentos [P]

**What**: Criar service/hook para CRUD básico de `planned_entries`.
**Where**: `mobile/src/features/planning/`
**Depends on**: T1
**Reuses**: Supabase client
**Requirement**: MON-01

**Done when**:

- [ ] Criação de avulso persiste dados válidos.
- [ ] Cancelamento muda status sem apagar registro.
- [ ] Query lista entradas por mês.

**Verify**: Teste de integração com Supabase local quando disponível.

---

### T5: Implementar templates recorrentes/parcelados [P]

**What**: Criar service/hook para `planning_templates`.
**Where**: `mobile/src/features/planning/`
**Depends on**: T1, T3
**Reuses**: Supabase client
**Requirement**: MON-02, MON-03

**Done when**:

- [ ] Template mensal/anual é criado.
- [ ] Template parcelado aceita total e valor da parcela.
- [ ] Validações impedem combinações inválidas.

**Verify**: Testes de schema e criação.

---

### T6: Implementar geração idempotente de ocorrências [P]

**What**: Criar RPC/Edge Function para gerar entradas planejadas de um mês.
**Where**: `supabase/functions/generate-planned-entries/` ou `supabase/migrations/`
**Depends on**: T3
**Reuses**: `planning_templates`, `planned_entries`
**Requirement**: MON-02, MON-03

**Done when**:

- [ ] Gera recorrência mensal.
- [ ] Gera recorrência anual apenas no mês correto.
- [ ] Gera parcelas com índice/total.
- [ ] Reexecução é idempotente.

**Verify**: Testes SQL/Edge Function com fixtures.

---

### T7: Implementar hook de dashboard

**What**: Criar hook TanStack Query para `get_month_dashboard`.
**Where**: `mobile/src/features/dashboard/`
**Depends on**: T2
**Reuses**: Supabase RPC
**Requirement**: MON-04

**Done when**:

- [ ] Hook busca por mês.
- [ ] Cache key inclui mês.
- [ ] Estado vazio e erro são diferenciados.

**Verify**: Teste de hook ou integração.

---

### T8: Criar tela de dashboard mensal

**What**: Renderizar resumo mensal e lista de categorias.
**Where**: `mobile/src/features/dashboard/`
**Depends on**: T7
**Reuses**: Mobile shell
**Requirement**: MON-04

**Done when**:

- [ ] Exibe saldo previsto, saldo atual e comprometido restante.
- [ ] Exibe totais por categoria.
- [ ] Exibe estado vazio.

**Verify**: Rodar app e conferir com fixtures locais.

---

### T9: Criar detalhe de categoria

**What**: Listar planejamentos e transações filtrados por categoria/mês.
**Where**: `mobile/src/features/dashboard/`
**Depends on**: T4, T7
**Reuses**: `planned_entries`, `imported_transactions`
**Requirement**: MON-05

**Done when**:

- [ ] Lista itens planejados.
- [ ] Lista itens realizados quando existirem.
- [ ] Estado vazio funciona.

**Verify**: Teste com categoria populada e vazia.

---

### T10: Validar núcleo mensal ponta a ponta

**What**: Validar planejamento, geração, dashboard e RLS.
**Where**: projeto inteiro
**Depends on**: T8, T9
**Reuses**: critérios da spec
**Requirement**: MON-01, MON-02, MON-03, MON-04, MON-05

**Done when**:

- [ ] Dois usuários não acessam dados um do outro.
- [ ] Recorrência mensal gera ocorrência correta.
- [ ] Parcela futura aparece no mês correto.
- [ ] Dashboard reflete os dados esperados.

**Verify**: Suite de integração local + teste manual no app.

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
  T4, T5, T6 → T7 → T8 → T9

Phase 4:
  T9 → T10
```

---

## Task Granularity Check

| Task | Scope | Status |
| --- | --- | --- |
| T1 | Schemas/tipos de feature | Granular |
| T2 | 1 read model | Granular |
| T3 | 1 constraint set | Granular |
| T4 | 1 service/hook group | OK |
| T5 | 1 service/hook group | OK |
| T6 | 1 generator | Granular |
| T7 | 1 hook | Granular |
| T8 | 1 screen | Granular |
| T9 | 1 detail view | Granular |
| T10 | 1 validation pass | Granular |
