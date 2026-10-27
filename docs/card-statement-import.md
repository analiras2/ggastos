# Importação de Faturas CSV

## Status

Fluxo ativo do GGastos em 2026-08-05. Substitui a integração Pluggy na rota
principal do produto; o trabalho anterior permanece apenas como histórico na
branch `pluggy-integration-snapshot`.

## Objetivo

Transformar linhas de fatura de cartão em transações realizadas sem duplicar
parcelas já planejadas. O usuário envia um CSV, revisa o resumo de processamento
e usa a inbox de conciliação para casos ambíguos.

## Bancos e formatos suportados

| Banco | Formato aceito | Tratamento |
| --- | --- | --- |
| Nubank | CSV UTF-8 separado por vírgulas, com `date,title,amount` | Datas ISO e valores com vírgula decimal. |
| Bradesco | CSV ISO-8859-1 separado por ponto e vírgula | Ignora metadados/resumos; reconhece fatura atual e lançamentos programados. |

Arquivos reais nunca devem ser versionados. Os testes usam somente fixtures
sintéticas em [`.specs/features/card-statement-import/fixtures/`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/.specs/features/card-statement-import/fixtures).

## Fluxo de processamento

1. O usuário seleciona Nubank ou Bradesco e escolhe o CSV.
2. O app chama a Edge Function `import-card-statement` com o conteúdo e o mês
   da fatura quando necessário.
3. O parser específico do banco normaliza as linhas e registra um lote em
   `statement_import_batches`.
4. Cada linha válida é persistida em `imported_transactions` com fingerprint
   de origem; uma reimportação não cria duplicatas.
5. O motor de conciliação procura o planejamento compatível. Matches claros são
   automáticos; casos ambíguos aparecem na inbox para revisão.

## Regras importantes

- Duas linhas visivelmente iguais no mesmo arquivo continuam distintas quando
  representam linhas de origem diferentes.
- Estornos/créditos de cartão ajustam despesas; não são classificados como
  receita comum.
- Pagamentos, saldo anterior, totais e resumos da fatura Bradesco são ignorados
  como compras.
- `Lançamentos programados` do Bradesco são processados separadamente das linhas
  da fatura atual.
- Regras ativas `DESCRIPTION_CONTAINS` preenchem `internal_category_id` na
  importação, respeitando a menor prioridade numérica.
- Quando uma linha não tiver categoria própria, mas tiver match ativo, o
  dashboard usa a categoria do planejamento conciliado. Linhas sem regra e sem
  match continuam importadas sem uma categoria inventada.

## Situação de pagamento da fatura

Cada fatura (lote) é **paga** (`PAID`, linhas `POSTED`) ou **em aberto** (`OPEN`, linhas
`PENDING`).

- **Ao importar:** a folha tem "Situação da fatura": Automático, Paga ou Em aberto.
  Automático decide pela ordem: o arquivo (Bradesco, `Situação da Fatura`), o vencimento
  no nome do arquivo (Nubank, `Nubank_AAAA-MM-DD.csv`: vencimento passado é paga, hoje ou
  futuro é em aberto) e, sem informação, paga.
- **Reimportação:** só uma escolha explícita reabre uma fatura paga. Um arquivo que diz
  "pago" paga linhas em aberto. Sugestões não mudam linhas já existentes.
- **Depois:** em Pendências, a seção "Faturas" tem **Marcar como paga** e **Reabrir**
  (função `set_statement_payment_status`, que atualiza lote e linhas juntos).
- **Painel:** fatura em aberto sai do "Saldo atual" e entra em "Comprometido restante"
  (exceto despesas já conciliadas com um planejamento, para não contar em dobro); o card
  "Faturas em aberto" mostra o total. Categorias e relatório anual continuam contando
  tudo, e a tela anual avisa isso.
- **Fechar o mês:** não é bloqueado com fatura em aberto; o aviso aparece depois de
  fechar. Pague a fatura e use "Recalcular mês" para atualizar o fechamento.

Detalhes e decisões: [plano](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/statement-payment-status-plan.md).

## Limites atuais

- Apenas Nubank e Bradesco são suportados.
- Não há importação por PDF/OCR ou e-mail.
- A conciliação é 1:1 entre linha importada e planejamento.
- Outros gastos, receitas e contas devem ser registrados pelo fluxo manual.

## Referências técnicas

- [Especificação detalhada](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/.specs/features/card-statement-import/spec.md)
- [Design técnico](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/.specs/features/card-statement-import/design.md)
- [Contrato de dados](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/data-contract-schema-spec.md)
- [Implementação da Edge Function](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/supabase/functions/import-card-statement/index.ts)
