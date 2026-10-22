# GGastos

**Vision:** Construir um app mobile de finanças pessoais centrado em `planejado vs. realizado`, capaz de mostrar o comprometimento real do mês antes que todas as transações aconteçam.
**For:** Pessoa física que já controla gastos manualmente, valoriza previsibilidade e quer centralizar planejamento mensal, faturas de cartão e registros manuais em um fluxo simples de revisão.
**Solves:** A maioria dos apps mostra bem o passado, mas não mostra com clareza o impacto futuro do mês. O GGastos resolve isso combinando planejamento, importação de faturas de cartão, conciliação e fechamento mensal.

## Goals

- Reduzir em pelo menos **60%** a quantidade de lançamentos manuais mensais dos cartões suportados após importação de faturas CSV.
- Permitir que o usuário entenda o estado do mês em **menos de 2 minutos**, vendo saldo previsto, saldo atual e comprometido restante.
- Atingir **>=70%** de conciliação automática ou sugerida para parcelas e gastos previsíveis vindos dos CSVs suportados.
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
- CSV import/parsing for supported credit card statements

## Scope

**v1 includes:**

- Autenticação básica por e-mail/senha.
- Dashboard mensal com previsto, realizado e comprometido restante.
- Planejamento manual com lançamentos avulsos, recorrências e parcelas conhecidas.
- Importação de faturas CSV de cartão de crédito inicialmente para Nubank e Bradesco.
- Registro manual para bancos, contas e gastos fora dos CSVs suportados.
- Conciliação manual e automática entre planejado e importado, com atenção especial a parcelas já planejadas para evitar duplicidade.
- Fechamento mensal com snapshot e consolidado anual básico.

**Explicitly out of scope:**

- Pagamentos, Pix, cobrança ou internet banking.
- Multiusuário compartilhado e orçamento familiar no MVP.
- Forecast avançado de 3-6 meses com IA.
- Attachments/comprovantes no MVP.
- Onboarding bancário embutido via Open Finance/Pluggy no fluxo principal.
- Suporte inicial a todos os bancos e formatos de extrato.
- Parsing de PDF/OCR na primeira versão da nova estratégia.

## Constraints

- Timeline: MVP orientado a velocidade de desenvolvimento e validação rápida.
- Technical: importação local/assistida por CSV, começando por Nubank e Bradesco; Pluggy fica preservada em branch separada como opção futura, sem bloquear o fluxo principal.
- Resources: desenvolvimento enxuto, priorizando baixo custo operacional e simplicidade de manutenção.
