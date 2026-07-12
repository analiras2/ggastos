# Fundação Supabase + Mobile Specification

## Problem Statement

O projeto já tem visão de produto, stack e modelo de dados definidos, mas ainda não possui uma fundação executável para começar o MVP. Sem uma base mínima de mobile, auth, banco, RLS e estrutura de sync, qualquer feature de produto ficará bloqueada ou será implementada em cima de uma base instável.

## Goals

- [ ] Colocar de pé a base técnica do MVP com Supabase e React Native/Expo.
- [ ] Garantir que autenticação, schema inicial e segurança por usuário existam antes das features de negócio.
- [ ] Deixar a integração com Pluggy pronta para começar com sync server-side sem expor segredos.
- [ ] Criar o schema central completo do MVP desde a fundação, mesmo que as telas/funções de negócio sejam implementadas em fases posteriores.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| --- | --- |
| Dashboard completo | Depende da fundação pronta |
| Conciliação automática completa | Depende de schema, sync e snapshots |
| Forecast e metas | Fora do MVP inicial |
| Integração visual completa com Pluggy | A fundação entrega borda server-side; UX completa entra na feature de sync |

---

## User Stories

### P1: Autenticação e sessão base ⭐ MVP

**User Story**: Como usuário, quero criar conta e entrar no app para que meus dados financeiros e planejamentos sejam isolados e seguros.

**Why P1**: Sem auth e isolamento por usuário não existe base confiável para dados financeiros.

**Acceptance Criteria**:

1. WHEN o usuário cria conta com e-mail e senha THEN o sistema SHALL criar a identidade no Supabase Auth e um perfil associado.
2. WHEN o usuário faz login THEN o sistema SHALL restaurar sua sessão no app sem exigir novo login a cada abertura.
3. WHEN uma requisição acessar dados protegidos THEN o sistema SHALL retornar apenas os dados do usuário autenticado.

**Independent Test**: Criar dois usuários distintos e verificar que cada um só acessa seus próprios registros.

---

### P1: Schema inicial do domínio ⭐ MVP

**User Story**: Como sistema, quero ter o schema inicial do domínio financeiro criado para que as próximas features usem uma base consistente.

**Why P1**: Sem schema, o produto não consegue evoluir com segurança nem rastreabilidade.

**Acceptance Criteria**:

1. WHEN o banco é migrado THEN o sistema SHALL criar as tabelas centrais do domínio financeiro com chaves e relacionamentos: `profiles`, `financial_connections`, `financial_accounts`, `categories`, `imported_transactions`, `planning_templates`, `planned_entries`, `reconciliation_matches`, `user_category_rules`, `month_snapshots` e `sync_events`.
2. WHEN novas tabelas expostas são criadas THEN o sistema SHALL permitir aplicação de RLS por usuário.
3. WHEN uma entidade financeira é persistida THEN o sistema SHALL suportar rastreabilidade por `user_id` e timestamps.
4. WHEN categorias são criadas THEN o sistema SHALL tratá-las como catálogo global inicial, com personalização via regras por usuário.
5. WHEN a seed inicial é aplicada THEN o sistema SHALL inserir o catálogo global aprovado com `code`, `name`, `impact_type`, `color` e hierarquia simples por `parent_id`.

**Independent Test**: Rodar as migrations em um projeto vazio e validar a existência das tabelas, constraints e colunas esperadas.

---

### P1: Sync server-side preparado para Pluggy ⭐ MVP

**User Story**: Como sistema, quero ter uma borda server-side pronta para sincronização com a Pluggy para que o app não exponha segredos nem carregue lógica sensível.

**Why P1**: O produto depende de sync externo e isso não pode nascer no cliente.

**Acceptance Criteria**:

1. WHEN o app solicita uma sincronização THEN o sistema SHALL encaminhar o comando para uma Edge Function autenticada.
2. WHEN a função executar THEN o sistema SHALL conseguir ler segredos server-side sem expô-los ao cliente.
3. WHEN a implementação real do sync Pluggy chegar THEN o sistema SHALL já ter estrutura para registrar logs e resultados em `sync_events`.
4. WHEN um sync for iniciado pelo usuário THEN o evento técnico SHALL registrar `user_id`; eventos globais sem usuário SHALL ser acessíveis apenas por backend/service role.

**Independent Test**: Invocar a função stub autenticada e verificar resposta válida, autorização e escrita de evento técnico inicial.

---

### P2: Estrutura mobile do MVP

**User Story**: Como time de desenvolvimento, quero uma estrutura mobile organizada por features para que a evolução do MVP seja rápida e mantenível.

**Why P2**: Não bloqueia o backend imediatamente, mas reduz retrabalho e acelera o restante.

**Acceptance Criteria**:

1. WHEN o projeto mobile é iniciado THEN o sistema SHALL ter estrutura de pastas consistente com a stack definida.
2. WHEN uma nova feature é adicionada THEN o sistema SHALL ter locais claros para tela, hook, serviço, schema e query.

**Independent Test**: Inspecionar a árvore do projeto e verificar bootstrap do app e módulos base.

---

### P2: Base de observabilidade técnica

**User Story**: Como sistema, quero registrar syncs e erros iniciais para que problemas de integração sejam investigáveis desde o começo.

**Why P2**: Importante para um domínio com integrações externas e snapshots.

**Acceptance Criteria**:

1. WHEN uma sincronização é disparada THEN o sistema SHALL registrar um evento técnico rastreável.
2. WHEN uma função falha THEN o sistema SHALL deixar erro e contexto suficientes para análise.

**Independent Test**: Forçar uma execução de teste e verificar registro técnico correspondente.

---

## Edge Cases

- WHEN o usuário não estiver autenticado THEN o sistema SHALL bloquear acesso a dados protegidos.
- WHEN uma migration falhar parcialmente THEN o sistema SHALL impedir estado silenciosamente inconsistente.
- WHEN a interface técnica da Pluggy ainda estiver em descoberta THEN o sistema SHALL manter uma função stub compatível com o destino de API direta server-side.
- WHEN o app iniciar sem sessão válida THEN o sistema SHALL redirecionar para o fluxo de autenticação.
- WHEN transações importadas existirem no schema THEN o sistema SHALL preservar campos de origem e permitir apenas metadados internos editáveis.
- WHEN transferências internas existirem THEN o sistema SHALL suportar impacto neutro por padrão e override do usuário em fases futuras.

---

## Requirement Traceability

Each requirement gets a unique ID for tracking across design, tasks, and validation.

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| FND-01 | P1: Autenticação e sessão base | Tasks | In Tasks |
| FND-02 | P1: Autenticação e sessão base | Tasks | In Tasks |
| FND-03 | P1: Schema inicial do domínio | Tasks | In Tasks |
| FND-04 | P1: Schema inicial do domínio | Tasks | In Tasks |
| FND-05 | P1: Sync server-side preparado para Pluggy | Tasks | In Tasks |
| FND-06 | P1: Sync server-side preparado para Pluggy | Tasks | In Tasks |
| FND-07 | P2: Estrutura mobile do MVP | Tasks | In Tasks |
| FND-08 | P2: Base de observabilidade técnica | Tasks | In Tasks |

**ID format:** `[CATEGORY]-[NUMBER]`

**Status values:** Pending → In Design → In Tasks → Implementing → Verified

**Coverage:** 8 total, 8 mapped to tasks, 0 unmapped

---

## Success Criteria

How we know the feature is successful:

- [ ] Um usuário consegue autenticar no app e manter sessão.
- [ ] O schema inicial é aplicado com segurança e isolamento por usuário.
- [ ] Existe uma função server-side pronta para disparar o sync sem segredo no cliente.
- [ ] A seed global de categorias é aplicada e consultável.
- [ ] RLS é validada com pelo menos dois usuários distintos.
- [ ] A base técnica fica pronta para iniciar dashboard, planejamento e conciliação.
