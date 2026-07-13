# Núcleo Mensal do Produto Specification

## Problem Statement

Depois da fundação, o GGastos precisa entregar o primeiro loop de valor sem depender da Pluggy: o usuário deve planejar o mês, ver previsto vs. realizado e entender o comprometido restante. Sem esse núcleo, sync e conciliação não têm uma experiência útil para alimentar.

## Goals

- [ ] Permitir criação e manutenção de planejamentos mensais manuais.
- [ ] Gerar ocorrências mensais a partir de recorrências e parcelas conhecidas.
- [ ] Exibir dashboard mensal com previsto, realizado, saldo e totais por categoria via view/RPC.
- [ ] Manter transferências internas neutras por padrão.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Sync Pluggy real | Milestone 3 |
| Conciliação automática/manual | Milestone 3 |
| Fechamento mensal persistido | Milestone 4 |
| Metas/orçamento por categoria | Fora do MVP |
| Fatura de cartão como entidade | Pós-MVP |

---

## User Stories

### P1: Criar lançamento planejado avulso ⭐ MVP

**User Story**: Como usuário, quero cadastrar uma receita, despesa, investimento ou transferência planejada para um mês para entender meu saldo previsto.

**Why P1**: É o menor fluxo que valida o modelo mental de planejado vs. realizado.

**Acceptance Criteria**:

1. WHEN o usuário cria um planejamento avulso THEN o sistema SHALL persistir um `planned_entry` com mês, valor, categoria, impacto e status.
2. WHEN o valor informado for inválido THEN o sistema SHALL bloquear a gravação com erro claro.
3. WHEN o planejamento for transferência THEN o sistema SHALL tratá-lo como neutro no orçamento por padrão.

**Independent Test**: Criar um lançamento planejado e verificar sua presença no mês e no dashboard.

---

### P1: Criar recorrência mensal/anual simples ⭐ MVP

**User Story**: Como usuário, quero criar compromissos recorrentes para não cadastrar manualmente todo mês.

**Why P1**: Recorrências são essenciais para reduzir trabalho manual e projetar o mês.

**Acceptance Criteria**:

1. WHEN o usuário cria template mensal THEN o sistema SHALL gerar ou disponibilizar ocorrências para os meses aplicáveis.
2. WHEN o usuário cria template anual THEN o sistema SHALL gerar ocorrência apenas no mês correspondente.
3. WHEN a recorrência é encerrada THEN o sistema SHALL parar de gerar novas ocorrências após `end_month`.

**Independent Test**: Criar recorrência mensal e verificar ocorrências em dois meses distintos.

---

### P1: Criar parcelas futuras conhecidas ⭐ MVP

**User Story**: Como usuário, quero registrar uma compra parcelada conhecida para enxergar compromissos futuros.

**Why P1**: Parcelas são parte crítica do comprometimento real do mês.

**Acceptance Criteria**:

1. WHEN o usuário cria template parcelado THEN o sistema SHALL gerar `planned_entries` com `installment_index` e `installment_total`.
2. WHEN uma parcela é cancelada THEN o sistema SHALL preservar histórico mudando status para `CANCELLED`.
3. WHEN as parcelas aparecem no dashboard THEN o sistema SHALL considerar apenas parcelas não canceladas.

**Independent Test**: Criar uma compra em 3 parcelas e verificar uma ocorrência por mês.

---

### P1: Ver dashboard mensal ⭐ MVP

**User Story**: Como usuário, quero abrir um mês e ver receitas, despesas, investimentos, saldo previsto, saldo atual e comprometido restante.

**Why P1**: É a tela central do produto.

**Acceptance Criteria**:

1. WHEN o usuário abre o dashboard THEN o sistema SHALL retornar resumo mensal por view/RPC.
2. WHEN o mês não tem dados THEN o sistema SHALL retornar totais zerados e categorias vazias.
3. WHEN há planejamentos no mês THEN o sistema SHALL calcular previsto e comprometido restante.
4. WHEN há transações importadas futuras ou manuais de teste no schema THEN o sistema SHALL calcular realizado sem misturar com planejado conciliado de forma ambígua.

**Independent Test**: Popular planejamentos e verificar os totais retornados pela RPC/view.

---

### P2: Detalhar categoria mensal

**User Story**: Como usuário, quero tocar numa categoria para ver itens planejados e realizados daquele mês.

**Why P2**: Ajuda explicabilidade, mas dashboard já entrega o loop principal.

**Acceptance Criteria**:

1. WHEN o usuário abre uma categoria THEN o sistema SHALL listar planejamentos e transações do mês filtrados por categoria.
2. WHEN a categoria não tem itens THEN o sistema SHALL exibir estado vazio.

**Independent Test**: Abrir categoria com lançamentos e conferir lista filtrada.

---

## Edge Cases

- WHEN o usuário tenta acessar mês de outro usuário THEN o sistema SHALL bloquear por RLS.
- WHEN recorrência e parcelas gerariam duplicatas THEN o sistema SHALL evitar duplicidade por chave de template, mês e índice.
- WHEN valor for zero THEN o sistema SHALL rejeitar entrada.
- WHEN categoria global estiver inativa THEN o sistema SHALL impedir novos lançamentos com ela.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| MON-01 | P1: Criar lançamento planejado avulso | Validation | ✅ Verified |
| MON-02 | P1: Criar recorrência mensal/anual simples | Validation | ✅ Verified |
| MON-03 | P1: Criar parcelas futuras conhecidas | Validation | ✅ Verified |
| MON-04 | P1: Ver dashboard mensal | Validation | ✅ Verified |
| MON-05 | P2: Detalhar categoria mensal | Validation | ✅ Verified |

**Coverage:** 5 total, 5 mapped to tasks, 0 unmapped

---

## Success Criteria

- [x] Usuário consegue planejar um mês sem Pluggy.
- [x] Dashboard mensal responde com previsto, realizado e comprometido restante.
- [x] Recorrências e parcelas geram ocorrências verificáveis.
- [x] RLS impede vazamento entre usuários.
