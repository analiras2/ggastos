# Roadmap

**Current Milestone:** Milestone 5 - Importação de fatura de cartão
**Status:** Fluxo Nubank/Bradesco concluído e validado em 2026-08-05. O MVP Pluggy foi preservado na branch `pluggy-integration-snapshot`; a linha ativa importa CSV de faturas mantendo planejamento, dashboard, conciliação e fechamento.

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

## Milestone 3 - Sync e conciliação Pluggy

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

**Status estratégico:** Preservado como snapshot, não é mais a rota ativa do produto enquanto o acesso pessoal/comercial da Pluggy estiver incerto.

---

## Milestone 4 - Fechamento e endurecimento

**Goal:** Transformar o MVP em uma base confiável para uso contínuo.

### Features

**Fechamento mensal e consolidado anual** - DONE

- Snapshot mensal.
- Consolidado anual por categoria.
- Comparação entre meses.
- Spec: `.specs/features/closing-hardening/spec.md`
  Progress: `T1`, `T2`, `T3`, `T7` concluídos e validados ponta a ponta (fechamento real via Edge Function, tela "Anual" mostrando dados reais). Comparação entre meses é implícita na listagem mensal da tela anual.

**Observabilidade e robustez** - DONE

- Logs de sync e conciliação.
- Reprocessamento.
- Endurecimento de RLS e segurança.
  Progress: `T4`, `T5`, `T6`, `T8`, `T9` concluídos. Suíte de RLS (`supabase/tests/rls-suite.mjs`) com 17/17 passando; checklist de hardening (`hardening-checklist.md` + `run-hardening-checklist.sh`) automatiza o gate de migrations/RLS antes de UAT.
- Spec: `.specs/features/closing-hardening/spec.md`

---

## Future Considerations

- Regras avançadas de categorização do usuário.
- Metas/orçamento por categoria.
- Forecast de caixa de múltiplos meses.
- Anexos e comprovantes.
- Migração para plano comercial da Pluggy se o produto exigir onboarding embutido.

---

## Milestone 5 - Importação de fatura de cartão

**Goal:** Substituir a dependência da Pluggy por um fluxo controlável de importação de faturas CSV, começando por Nubank e Bradesco, sem perder a lógica de match entre planejado e realizado.

### Features

**Importação CSV Nubank/Bradesco** - DONE

- Importar faturas CSV de cartão de crédito.
- Normalizar linhas para transações internas idempotentes.
- Identificar banco/emissor, fatura, data, descrição, valor e parcela quando disponível no arquivo.
- Spec: `.specs/features/card-statement-import/spec.md`
  Progress: `T1` a `T16` concluídos; importação e reimportação das fixtures
  Nubank/Bradesco, conciliação, RLS, bundle iOS, lint e typecheck validados.

**Conciliação de fatura com planejamento** - DONE

- Reutilizar matching 1:1 e inbox de revisão.
- Evitar duplicar parcelas já planejadas quando a próxima parcela vier no CSV.
- Permitir registrar manualmente o que não vier dos cartões suportados.
- Spec: `.specs/features/card-statement-import/spec.md`
