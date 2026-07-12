# GGastos

**Vision:** Construir um app mobile de finanças pessoais centrado em `planejado vs. realizado`, capaz de mostrar o comprometimento real do mês antes que todas as transações aconteçam.
**For:** Pessoa física que já controla gastos manualmente, valoriza previsibilidade e quer centralizar extrato, saldo, investimentos e planejamento mensal.
**Solves:** A maioria dos apps mostra bem o passado, mas não mostra com clareza o impacto futuro do mês. O GGastos resolve isso combinando sync financeiro com planejamento, conciliação e fechamento mensal.

## Goals

- Reduzir em pelo menos **60%** a quantidade de lançamentos manuais mensais após ativação do sync com Pluggy.
- Permitir que o usuário entenda o estado do mês em **menos de 2 minutos**, vendo saldo previsto, saldo atual e comprometido restante.
- Atingir **>=70%** de conciliação automática para transações recorrentes e previsíveis no MVP validado.
- Fechar um mês com snapshot e consolidado anual sem depender de planilha paralela.

## Tech Stack

**Core:**

- Framework: React Native + Expo
- Language: TypeScript
- Database: Supabase Postgres

**Key dependencies:**

- Supabase Auth + RLS
- Supabase Edge Functions
- Supabase Cron (`pg_cron`)
- TanStack Query
- Zod
- Pluggy API

## Scope

**v1 includes:**

- Autenticação básica por e-mail/senha.
- Dashboard mensal com previsto, realizado e comprometido restante.
- Planejamento manual com lançamentos avulsos, recorrências e parcelas conhecidas.
- Sincronização dos próprios dados financeiros via Pluggy em modo pessoal/free.
- Conciliação manual e automática entre planejado e importado.
- Fechamento mensal com snapshot e consolidado anual básico.

**Explicitly out of scope:**

- Pagamentos, Pix, cobrança ou internet banking.
- Multiusuário compartilhado e orçamento familiar no MVP.
- Forecast avançado de 3-6 meses com IA.
- Attachments/comprovantes no MVP.
- Onboarding bancário embutido no app por plano comercial da Pluggy.

## Constraints

- Timeline: MVP orientado a velocidade de desenvolvimento e validação rápida.
- Technical: Pluggy em plano pessoal/free, sem assumir onboarding comercial, webhooks ou enriquecimento premium.
- Resources: desenvolvimento enxuto, priorizando baixo custo operacional e simplicidade de manutenção.
