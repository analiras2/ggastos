# Sync Pluggy e Conciliação Specification

## Problem Statement

O GGastos precisa reduzir lançamento manual importando dados financeiros via Pluggy e vinculando transações reais a planejamentos. Sem ingestão idempotente e conciliação auditável, o dashboard pode duplicar valores ou misturar previsto e realizado de forma incorreta.

## Goals

- [ ] Implementar sync manual e agendado via API direta server-side da Pluggy.
- [ ] Normalizar conexões, contas, saldos, investimentos e transações no schema interno.
- [ ] Garantir upsert idempotente e reprocessável.
- [ ] Criar motor de matching automático 1:1 com score e inbox de revisão.
- [ ] Permitir confirmação, rejeição e desfazer conciliação manual com trilha de auditoria.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Pluggy Connect/onboarding embutido | Plano pessoal/free, sem onboarding comercial |
| Webhooks comerciais | Fora das premissas do MVP |
| Matching N:N | MVP assume conciliação 1:1 |
| Regras avançadas de categorização | Pós-MVP |
| Edição de campos de origem | Dados importados preservados |

---

## User Stories

### P1: Executar sync manual Pluggy ⭐ MVP

**User Story**: Como usuário, quero tocar em sincronizar para importar dados financeiros recentes.

**Why P1**: É a porta de entrada da automação do MVP.

**Acceptance Criteria**:

1. WHEN o usuário dispara sync THEN o sistema SHALL criar `sync_events` com `user_id` e status `RECEIVED`.
2. WHEN a Edge Function executa THEN o sistema SHALL ler segredos server-side e nunca expor credenciais ao app.
3. WHEN a Pluggy retorna erro de consentimento/autorização THEN o sistema SHALL registrar erro acionável na conexão.

**Independent Test**: Chamar sync autenticado e verificar evento + atualização de conexão.

---

### P1: Ingerir contas e transações idempotentes ⭐ MVP

**User Story**: Como sistema, quero importar contas e transações sem duplicar registros em retries.

**Why P1**: Duplicidade destrói confiança nos cálculos financeiros.

**Acceptance Criteria**:

1. WHEN o mesmo payload é processado duas vezes THEN o sistema SHALL manter uma única conta/transação por identificador de origem.
2. WHEN uma transação muda na origem THEN o sistema SHALL atualizar metadados de origem preservando overrides internos do usuário.
3. WHEN uma transação é removida na origem THEN o sistema SHALL marcar `deleted_at` sem apagar histórico imediatamente.

**Independent Test**: Reprocessar lote idêntico e comparar contagem antes/depois.

---

### P1: Rodar matching automático 1:1 ⭐ MVP

**User Story**: Como usuário, quero que o sistema sugira ou aplique conciliações prováveis entre planejado e realizado.

**Why P1**: Conciliação reduz trabalho manual e evita dupla contagem.

**Acceptance Criteria**:

1. WHEN uma nova transação importada chega THEN o sistema SHALL calcular score contra planejamentos elegíveis do mês.
2. WHEN score passar o limiar automático THEN o sistema SHALL criar match `AUTO_MATCHED`.
3. WHEN score ficar abaixo do limiar automático e acima do limiar de sugestão THEN o sistema SHALL enviar item para inbox.
4. WHEN transação ou planejamento já tem match ativo THEN o sistema SHALL impedir outro match ativo no MVP.

**Independent Test**: Criar planejamento + transação semelhante e verificar match automático.

---

### P1: Revisar inbox de conciliação ⭐ MVP

**User Story**: Como usuário, quero revisar sugestões de conciliação para confirmar ou rejeitar matches.

**Why P1**: Matching automático precisa de controle humano.

**Acceptance Criteria**:

1. WHEN o usuário abre inbox THEN o sistema SHALL listar transações sem match automático com sugestões ordenadas por score.
2. WHEN o usuário confirma sugestão THEN o sistema SHALL criar match `MANUAL_MATCHED`.
3. WHEN o usuário rejeita sugestão THEN o sistema SHALL registrar rejeição e não sugerir o mesmo par novamente.

**Independent Test**: Confirmar e rejeitar sugestões e verificar estados.

---

### P2: Sync agendado

**User Story**: Como usuário, quero que o sistema atualize meus dados periodicamente sem ação manual.

**Why P2**: Importante para uso contínuo, mas sync manual valida o fluxo principal.

**Acceptance Criteria**:

1. WHEN cron executa THEN o sistema SHALL sincronizar conexões ativas elegíveis.
2. WHEN o cron padrão do MVP real estiver configurado THEN o sistema SHALL executar o sync a cada `12 horas`.
3. WHEN uma conexão está com erro de consentimento THEN o sistema SHALL pular sync e manter erro acionável.
4. WHEN sync agendado falha THEN o sistema SHALL registrar evento técnico sem expor ao usuário como ação manual.

**Independent Test**: Disparar job agendado em ambiente local/remoto e verificar eventos.

---

## Edge Cases

- WHEN Pluggy retorna payload parcial THEN o sistema SHALL processar o possível e registrar erro parcial.
- WHEN o mesmo par foi rejeitado THEN matching SHALL não recriar sugestão automaticamente.
- WHEN transferência interna é detectada THEN a transação SHALL ficar neutra por padrão.
- WHEN serviço externo está indisponível THEN sync SHALL ser marcado como `FAILED` com erro transitório.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| SYN-01 | P1: Executar sync manual Pluggy | Tasks | In Tasks |
| SYN-02 | P1: Ingerir contas e transações idempotentes | Tasks | In Tasks |
| SYN-03 | P1: Rodar matching automático 1:1 | Tasks | In Tasks |
| SYN-04 | P1: Revisar inbox de conciliação | Tasks | In Tasks |
| SYN-05 | P2: Sync agendado | Tasks | In Tasks |

**Coverage:** 5 total, 5 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] Sync manual importa dados sem expor segredos.
- [ ] Reprocessar o mesmo lote não duplica contas/transações.
- [ ] Matching automático cria vínculos 1:1 auditáveis.
- [ ] Usuário consegue confirmar/rejeitar sugestões pela inbox.
- [ ] Sync agendado registra eventos técnicos.
