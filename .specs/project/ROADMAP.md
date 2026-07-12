# Roadmap

**Current Milestone:** Milestone 1 - Fundação do MVP
**Status:** In Progress

---

## Milestone 1 - Fundação do MVP

**Goal:** Deixar a base técnica pronta para desenvolver o produto com segurança, dados relacionais corretos e fluxo de autenticação.
**Target:** Projeto Supabase configurado, estrutura mobile criada e domínio inicial persistido com RLS.

### Features

**Fundação Supabase + Mobile** - IN PROGRESS

- Configurar Supabase Auth, Postgres, RLS e estrutura inicial de Edge Functions.
- Criar estrutura `mobile/` com React Native + Expo + TypeScript.
- Criar schema inicial do domínio financeiro.
- Preparar ambiente para sync com Pluggy sem expor segredos no cliente.
  Progress: `T1` concluído, `T2` concluído e validado localmente, `T2.1` pendente.

**Autenticação e bootstrap do usuário** - PLANNED

- Login por e-mail/senha.
- Criação de perfil local.
- Sessão persistida no app.

---

## Milestone 2 - Núcleo mensal do produto

**Goal:** Entregar o primeiro loop completo de valor sem depender ainda da integração externa completa.

### Features

**Planejamento mensal** - PLANNED

- Lançamentos planejados avulsos.
- Recorrências mensais/anuais simples.
- Parcelas futuras conhecidas.
- Spec: `.specs/features/monthly-core/spec.md`

**Dashboard mensal** - PLANNED

- Saldo previsto.
- Saldo atual.
- Comprometido restante.
- Totais por categoria.
- Spec: `.specs/features/monthly-core/spec.md`

---

## Milestone 3 - Sync e conciliação

**Goal:** Integrar dados externos da Pluggy ao loop mensal do GGastos.

### Features

**Sincronização Pluggy** - PLANNED

- Sync manual.
- Sync agendado.
- Upsert idempotente de contas, saldos, investimentos e transações.
- Spec: `.specs/features/pluggy-sync-reconciliation/spec.md`

**Conciliação planejado vs. realizado** - PLANNED

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
