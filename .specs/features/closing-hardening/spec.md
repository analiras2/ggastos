# Fechamento e Endurecimento Specification

## Problem Statement

Após planejamento, dashboard, sync e conciliação, o GGastos precisa transformar o mês em histórico confiável, permitir consolidado anual e oferecer operação segura para uso contínuo. Sem fechamento lógico, observabilidade e reprocessamento, erros de sync ou matching ficam difíceis de auditar e corrigir.

## Goals

- [ ] Gerar snapshot mensal informativo/recalculável.
- [ ] Exibir consolidado anual por categoria e comparação entre meses, usando competência como única semântica no MVP.
- [ ] Registrar logs suficientes para sync, conciliação e comandos críticos.
- [ ] Permitir reprocessamento controlado de sync, matching e snapshots.
- [ ] Endurecer RLS, validação e segurança antes de considerar MVP utilizável.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Fechamento rígido bloqueante | MVP usa snapshot informativo |
| Auditoria enterprise completa | Escopo de MVP pessoal |
| Analytics avançado | Pós-MVP |
| Backoffice administrativo completo | Pós-MVP |
| Multiusuário/família | Fora do MVP |

---

## User Stories

### P1: Fechar mês com snapshot informativo ⭐ MVP

**User Story**: Como usuário, quero fechar um mês para registrar um resumo histórico sem impedir correções posteriores.

**Why P1**: Fecha o loop mensal e permite consolidado anual.

**Acceptance Criteria**:

1. WHEN o usuário fecha um mês THEN o sistema SHALL criar ou atualizar `month_snapshots` com totais e payload por categoria.
2. WHEN dados do mês mudam depois do fechamento THEN o sistema SHALL permitir recalcular snapshot com novo `computed_at`.
3. WHEN o mês não tem dados THEN o sistema SHALL criar snapshot zerado válido.

**Independent Test**: Fechar mês com fixtures e conferir snapshot persistido.

---

### P1: Ver consolidado anual ⭐ MVP

**User Story**: Como usuário, quero ver o consolidado anual por categoria para substituir a planilha paralela.

**Why P1**: É parte explícita da proposta do produto.

**Acceptance Criteria**:

1. WHEN o usuário abre o ano THEN o sistema SHALL exibir totais mensais e anuais por categoria.
2. WHEN o usuário abre o ano no MVP THEN o sistema SHALL calcular o consolidado apenas por competência.
3. WHEN um mês não tem snapshot THEN o sistema SHALL calcular via view/RPC ou indicar ausência sem quebrar a tela.
4. WHEN existem transferências internas THEN o sistema SHALL mantê-las neutras no consolidado por padrão.

**Independent Test**: Criar snapshots de dois meses e verificar soma anual.

---

### P1: Reprocessar snapshot e matching ⭐ MVP

**User Story**: Como sistema, quero reprocessar cálculos quando dados mudam para manter consistência.

**Why P1**: Correções pós-sync ou pós-conciliação precisam refletir no resumo.

**Acceptance Criteria**:

1. WHEN uma conciliação muda THEN o sistema SHALL invalidar ou recalcular leituras afetadas.
2. WHEN o usuário solicita reprocessamento THEN o sistema SHALL registrar evento técnico auditável.
3. WHEN reprocessamento falha THEN o sistema SHALL preservar estado anterior e registrar erro.

**Independent Test**: Alterar conciliação e verificar snapshot recalculado.

---

### P1: Endurecer RLS e segurança ⭐ MVP

**User Story**: Como usuário, quero que meus dados financeiros fiquem isolados mesmo em rotas agregadas e funções server-side.

**Why P1**: Dados financeiros exigem isolamento forte.

**Acceptance Criteria**:

1. WHEN dois usuários existem THEN nenhum SHALL ler, alterar ou conciliar dados do outro.
2. WHEN uma função usa service role THEN ela SHALL validar o usuário chamador antes de operar.
3. WHEN logs são gravados THEN eles SHALL não conter credenciais nem payload sensível desnecessário.

**Independent Test**: Rodar suíte de RLS e chamadas cruzadas entre dois usuários.

---

### P2: Painel técnico mínimo de sync

**User Story**: Como usuário, quero ver status e último erro de sincronização para saber quando agir.

**Why P2**: Ajuda suporte e confiança, mas o MVP pode operar com logs técnicos.

**Acceptance Criteria**:

1. WHEN uma conexão tem erro THEN o app SHALL mostrar mensagem acionável.
2. WHEN o último sync foi bem-sucedido THEN o app SHALL mostrar data de atualização.

**Independent Test**: Forçar erro de consentimento e verificar status.

---

## Edge Cases

- WHEN snapshot é recalculado após correção antiga THEN o sistema SHALL preservar `computed_at` atualizado.
- WHEN reprocessamento é disparado duas vezes THEN o sistema SHALL evitar execução concorrente destrutiva.
- WHEN RLS de view/RPC é testada THEN o sistema SHALL respeitar `auth.uid()`.
- WHEN log contém payload externo THEN o sistema SHALL armazenar apenas necessário para auditoria/reprocessamento.
- WHEN o produto evoluir para liquidação THEN o sistema SHALL tratar isso como extensão futura sem alterar o contrato do MVP já entregue.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| CLS-01 | P1: Fechar mês com snapshot informativo | Tasks | In Tasks |
| CLS-02 | P1: Ver consolidado anual | Tasks | In Tasks |
| CLS-03 | P1: Reprocessar snapshot e matching | Tasks | In Tasks |
| CLS-04 | P1: Endurecer RLS e segurança | Tasks | In Tasks |
| CLS-05 | P2: Painel técnico mínimo de sync | Tasks | In Tasks |

**Coverage:** 5 total, 5 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] Usuário fecha mês e gera snapshot recalculável.
- [ ] Consolidado anual soma meses e categorias corretamente.
- [ ] Reprocessamento registra eventos e não corrompe dados.
- [ ] RLS passa em cenários multiusuário.
- [ ] Logs não expõem segredos.
