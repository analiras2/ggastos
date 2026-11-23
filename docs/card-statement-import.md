# Importação de Faturas (CSV e PDF)

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
| Mercado Pago | PDF da fatura | O app lê o texto do PDF no navegador (pdf.js) e envia só o texto. Ano das datas vem do vencimento; só importa se a soma das compras bater com o total da fatura. |

O banco **não é escolhido** pelo usuário: a Edge Function reconhece pelo conteúdo (`statements/detect-bank.ts`).
Arquivo de outro banco responde `unknown_bank`. Para um banco novo: parser em `statements/parse-<banco>.ts`,
regra em `detect-bank.ts`, nome em `statement-import/account.ts` e o valor na constraint de banco (migration).

Arquivos reais nunca devem ser versionados. Os testes usam somente fixtures
sintéticas em [`.specs/features/card-statement-import/fixtures/`](../.specs/features/card-statement-import/fixtures).

## Fluxo de processamento

1. O usuário escolhe o arquivo (CSV ou PDF); o app lê o texto (CSV em UTF-8, ou Latin-1 se não for UTF-8 válido).
2. O app chama a Edge Function `import-card-statement` com o texto e o mês
   da fatura quando necessário; ela detecta o banco.
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
  como compras. No Nubank, a linha `Pagamento recebido` (o pagamento da fatura anterior) também é
  ignorada na importação; estornos continuam entrando como crédito.
- `Lançamentos programados` do Bradesco são processados separadamente das linhas
  da fatura atual.
- Regras ativas `DESCRIPTION_CONTAINS` preenchem `internal_category_id` na
  importação, respeitando a menor prioridade numérica.
- Quando uma linha não tiver categoria própria, mas tiver match ativo, o
  dashboard usa a categoria do planejamento conciliado. Linhas sem regra e sem
  match continuam importadas sem uma categoria inventada.

## Remover um item da fatura

Qualquer item importado pode ser removido (por exemplo, um item que não é seu ou uma linha que não
deveria ter entrado): em **Mês, categoria, item, Remover**, ou em **Revisar categorias, Remover item da
fatura**. Os dois pedem confirmação.

- **Fica removido:** a função `remove_imported_transaction` só marca `deleted_at`. Importar o mesmo
  arquivo de novo não traz o item de volta, porque a importação nunca escreve essa coluna.
- **Some de tudo:** mês, categorias, estatísticas, pendências, total da fatura, busca, conciliação e
  parcelas futuras ignoram itens removidos.
- **Conciliação:** se o item estava conciliado com um planejamento, o par é desfeito, como em
  "desfazer".
- **Restaurar:** `restore_imported_transaction` desfaz a remoção (ainda sem tela no app). A conciliação
  desfeita não volta sozinha.
- **Parcelas futuras:** remover não cancela os previstos que já foram gerados a partir do item.

## Mudar a categoria de todos os itens iguais

Ao editar um item de fatura, a opção **Aplicar a todos os itens iguais** (desligada por padrão)
mostra quantos outros itens têm o mesmo estabelecimento e, ao salvar:

- troca a categoria de **todos** os itens do mesmo estabelecimento, em qualquer fatura, inclusive os
  que já tinham outra categoria (`recategorize_similar_imported_transactions`);
- salva a regra `DESCRIPTION_CONTAINS` com a chave do estabelecimento, que vale para as **próximas
  faturas** e substitui uma regra antiga do mesmo estabelecimento.

"Mesmo estabelecimento" é a chave de `merchantKey` (sem parcela e sem prefixo de intermediário), a
mesma de "Usar nas próximas faturas". Descrições genéricas (como `pix`) não têm chave, então a opção
não aparece. Só mudam itens do mesmo tipo (despesa) e que contam no orçamento.

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
- [Remover e recategorizar itens (migration)](../supabase/migrations/20261118120000_remove_and_recategorize_statement_items.sql)
