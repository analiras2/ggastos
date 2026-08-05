# GGastos

App mobile pessoal de finanças centrado em `planejado vs. realizado`. A rota ativa
do produto importa faturas de cartão em CSV, concilia as linhas com o
planejamento e mantém dashboard, inbox de revisão e fechamento mensal.

## Estrutura
- [`mobile/`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/mobile): app Expo/React Native.
- [`supabase/`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/supabase): schema, Edge Functions e testes de RLS.
- [`docs/`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs): documentação ativa de produto, arquitetura e operação.
- [`.specs/`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/.specs): especificações e histórico de decisões.
- [`legacy/`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/legacy): app React Native antigo arquivado para referência.

## Documentos principais
- [PRD](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/prd-ggastos-v2.md)
- [TDD](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/tdd-ggastos-v2.md)
- [Data Contract / Schema Spec](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/data-contract-schema-spec.md)
- [Stack Técnica Supabase MVP](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/stack-tecnica-supabase-mvp.md)
- [Importação de fatura CSV](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/card-statement-import.md)
- [Roadmap](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/.specs/project/ROADMAP.md)

## Estratégia ativa

- Importação assistida de faturas CSV de **Nubank** e **Bradesco**.
- Idempotência por fingerprint de origem: reimportar um arquivo não duplica
  transações já persistidas.
- Conciliação 1:1 reaproveitada para que parcelas planejadas não sejam somadas
  duas vezes quando chegam na fatura.
- Lançamentos fora dos cartões suportados continuam no fluxo manual.

A integração Pluggy foi preservada apenas como histórico na branch
`pluggy-integration-snapshot`; não é um destino de deploy nem um fluxo ativo.

## Diretriz
O desenvolvimento novo deve partir de `docs/` e da spec
[`card-statement-import`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/.specs/features/card-statement-import/spec.md).
O conteúdo de `legacy/` e as seções de Pluggy nos documentos históricos existem
apenas para consulta.
