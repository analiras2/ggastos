# Roadmap

**Current Milestone:** Milestone 4 - Fechamento e endurecimento
**Status:** In Progress

---

## Milestone 1 - Fundação do MVP

**Goal:** Deixar a base técnica pronta para desenvolver o produto com segurança, dados relacionais corretos e fluxo de autenticação.
**Target:** Projeto Supabase configurado, estrutura mobile criada e domínio inicial persistido com RLS.

### Features

**Fundação Supabase + Mobile** - DONE

- Configurar Supabase Auth, Postgres, RLS e estrutura inicial de Edge Functions.
- Criar estrutura `mobile/` com React Native + Expo + TypeScript.
- Criar schema inicial do domínio financeiro.
- Preparar ambiente para sync com Pluggy sem expor segredos no cliente.
  Progress: `T1` a `T8` concluídos e validados localmente. Fundação pronta para a Milestone 2.

**Autenticação e bootstrap do usuário** - DONE

- Login por e-mail/senha.
- Criação de perfil local.
- Sessão persistida no app.

---

## Milestone 2 - Núcleo mensal do produto

**Goal:** Entregar o primeiro loop completo de valor sem depender ainda da integração externa completa.

### Features

**Planejamento mensal** - DONE

- Lançamentos planejados avulsos.
- Recorrências mensais/anuais simples.
- Parcelas futuras conhecidas.
- Spec: `.specs/features/monthly-core/spec.md`
  Progress: `T1` a `T10` concluídos e validados localmente (dois usuários isolados, recorrência mensal/anual, parcelas, geração idempotente, categoria inativa bloqueada).

**Dashboard mensal** - DONE

- Saldo previsto.
- Saldo atual.
- Comprometido restante.
- Totais por categoria.
- Detalhe de categoria (planejado + realizado).
- Spec: `.specs/features/monthly-core/spec.md`

---

## Milestone 3 - Sync e conciliação

**Goal:** Integrar dados externos da Pluggy ao loop mensal do GGastos.

### Features

**Sincronização Pluggy** - DONE

- Sync manual.
- Sync agendado.
- Upsert idempotente de contas, saldos, investimentos e transações.
- Spec: `.specs/features/pluggy-sync-reconciliation/spec.md`
  Progress: `T1` a `T12` concluídos e validados ponta a ponta (sandbox real da Pluggy + mock local), incluindo RLS entre usuários.

**Conciliação planejado vs. realizado** - DONE

- Matching automático por score.
- Inbox de revisão.
- Confirmação e rejeição manual.
- Spec: `.specs/features/pluggy-sync-reconciliation/spec.md`

---

## Milestone 4 - Fechamento e endurecimento

**Goal:** Transformar o MVP em uma base confiável para uso contínuo.

### Features

**Fechamento mensal e consolidado anual** - PLANNED

- Snapshot mensal.
- Consolidado anual por categoria.
- Comparação entre meses.
- Spec: `.specs/features/closing-hardening/spec.md`

**Observabilidade e robustez** - PLANNED

- Logs de sync e conciliação.
- Reprocessamento.
- Endurecimento de RLS e segurança.
- Spec: `.specs/features/closing-hardening/spec.md`

---

## Future Considerations

- Regras avançadas de categorização do usuário.
- Metas/orçamento por categoria.
- Forecast de caixa de múltiplos meses.
- Anexos e comprovantes.
- Migração para plano comercial da Pluggy se o produto exigir onboarding embutido.
