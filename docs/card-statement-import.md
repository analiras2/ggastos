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
sintéticas em [`.specs/features/card-statement-import/fixtures/`](../.specs/features/card-statement-import/fixtures).

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
- **Painel:** fatura em aberto sai da "Carteira" e entra em "Pendente"
  (exceto despesas já conciliadas com um planejamento, para não contar em dobro); o card
  "Faturas em aberto" mostra o total. Categorias e relatório anual continuam contando
  tudo, e a tela anual avisa isso.
- **Fechar o mês:** não é bloqueado com fatura em aberto; o aviso aparece depois de
  fechar. Pague a fatura e use "Recalcular mês" para atualizar o fechamento.

Detalhes e decisões: [plano](archive/statement-payment-status-plan.md).

## Parcelas futuras

Depois de gravar as linhas, a importação chama a função SQL `plan_future_installments`. Para cada
linha parcelada (por exemplo, 2/5) ela cria como **previstas** as parcelas seguintes (3, 4 e 5)
nos meses que vêm depois, com o mesmo valor, de modo que o mês já mostre o que vem aí sem esperar
a próxima fatura.

- **Só do mês atual em diante:** meses passados não ganham previsto.
- **Idempotente:** cada previsto tem uma `source_key` única; reimportar não duplica e um previsto
  cancelado continua cancelado. Se a fatura daquele mês já foi importada, a parcela real existe e
  o previsto não é criado.
- **Sem categoria própria:** usa a categoria geral de despesa.
- **Conciliação:** quando a fatura do mês chega, a parcela real concilia com o previsto
  (o sinal de parcela já faz parte da pontuação).
- **Apagar uma importação:** remove os previstos dela que ainda estão como previstos; o que já foi
  conciliado, confirmado ou cancelado fica.
- **Falha não derruba a importação:** o erro é registrado e o resumo devolve `installmentsPlanned: 0`.

## Forma de pagamento

Toda linha importada de fatura é gravada com `payment_method = CREDIT_CARD`. Lançamentos feitos
à mão e já pagos (dinheiro, Pix, débito/transferência, outro) usam a mesma coluna em
`planned_entries`. Cartão não é oferecido no formulário: compra no cartão entra pela fatura, e
lançar de novo contaria em dobro. Detalhes: [plano](archive/paid-entries-plan.md).

## Limites atuais

- Apenas Nubank e Bradesco são suportados.
- Não há importação por PDF/OCR ou e-mail.
- A conciliação é 1:1 entre linha importada e planejamento.
- Outros gastos, receitas e contas devem ser registrados pelo fluxo manual.

## Referências técnicas

- [Especificação detalhada](../.specs/features/card-statement-import/spec.md)
- [Design técnico](../.specs/features/card-statement-import/design.md)
- [Contrato de dados](data-contract-schema-spec.md)
- [Edge Function (HTTP, auth e erros)](../supabase/functions/import-card-statement/index.ts)
- [Fluxo da importação, por etapa](../supabase/functions/_shared/statement-import/run-import.ts)
- [Parcelas futuras (migration)](../supabase/migrations/20261105120000_plan_future_card_installments.sql)
