# Plano: lançar despesa ou receita que já foi paga (dinheiro, Pix, etc.)

## Status

Plano aprovado. Branch: `feature/paid-entries`.

- Cartão de crédito como forma de pagamento (pedido depois da aprovação): `CREDIT_CARD` é um
  valor válido no banco, mas o formulário não o oferece. Cada linha importada de fatura é
  gravada com `payment_method = CREDIT_CARD` (coluna nova em `imported_transactions`, migration
  `20261103130000_credit_card_payment_method.sql`, preenchida para as linhas já importadas;
  a função `import-card-statement` grava o valor, ainda sem deploy em produção).
- Fase 1 concluída: migration `20261103120000_planned_entry_payment_method.sql` (aplicada só no
  banco local; falta `supabase db push` para produção) e suíte `supabase/tests/paid-entries-suite.mjs`
  (14/14). O "desfazer" do app já limpa a forma de pagamento, porque a constraint exige isso.

## O que se quer

Hoje todo lançamento manual entra como **planejamento** e só vira "realizado" depois,
com um segundo passo (marcar como realizado na lista). Mas muitas vezes o gasto já
aconteceu: pagou em dinheiro, no Pix ou transferiu. O formulário deve permitir dizer
isso na hora de cadastrar, para o valor entrar direto no realizado e no saldo atual.

## Como funciona hoje (achados)

| Ponto | Situação atual |
| --- | --- |
| Formulário "Novo planejamento" | Título (opcional), data, tags, valor, categoria. Sempre cria `planned_entries` com status `PLANNED`. |
| "Já foi realizado" | Já existe, mas em dois passos: criar e depois marcar na lista da categoria. O banco grava `status = RECONCILED` e `manually_confirmed_at`. |
| Painel (`get_month_dashboard`) | **Já soma** entradas manualmente confirmadas em "realizado", no saldo atual e na categoria. Não precisa mudar. |
| Conciliação da importação | Só procura planejamentos `PLANNED`/`PROJECTED`. Uma entrada já confirmada nunca é casada com uma linha de fatura, então não há contagem em dobro. |
| Forma de pagamento | Não existe no banco. |
| Título | O formulário diz que o título "será preenchido pela importação". Para um lançamento já pago nada vai preencher, então precisa de um valor padrão. |

Conclusão: o backend já entende "lançamento pago". A mudança é principalmente de
formulário, com uma coluna opcional nova para a forma de pagamento.

## Proposta

### Formulário (renomear para "Novo lançamento")

- **Situação:** `Planejado` (padrão, como hoje) ou `Já paguei` (despesa e investimento) /
  `Já recebi` (receita). O texto muda conforme a categoria escolhida.
- **Forma de pagamento** (só quando já pago): Dinheiro, Pix, Débito/transferência, Outro.
  **Cartão de crédito fica de fora de propósito**: compra no cartão chega pela fatura
  importada, e lançar de novo contaria em dobro. Uma nota no formulário explica isso.
- **Data:** passa a significar "quando aconteceu" quando já pago. Define o mês em que o
  valor entra no realizado.
- **Título:** obrigatório quando já pago (não há importação para preencher). Se vazio,
  usa o nome da categoria.
- Aviso (sem bloquear) se a data for futura e a situação for "Já paguei".

### Dados

- **Gravação em um passo:** insere a entrada já com `status = RECONCILED` e
  `manually_confirmed_at` igual à data informada. Sem função nova: a política de RLS atual
  já cobre.
- **Migration pequena:** coluna `payment_method text` em `planned_entries`
  (`CASH`, `PIX`, `DEBIT_TRANSFER`, `OTHER`, nula quando não pago ou desconhecida) e
  um `check` dos valores. Sem mudar `get_month_dashboard`.
- Entradas antigas continuam válidas (coluna nula).

### Telas

- Lista da categoria (folha de detalhes): mostra a forma de pagamento nas entradas pagas
  ("Pix · pago em 03/11") e continua permitindo desfazer, que volta a `PLANNED`
  e apaga a forma de pagamento.
- Cadastro de **template recorrente** fica de fora desta entrega (ver abaixo).

## Fases (cada uma é um PR pequeno)

| Fase | Entrega | Verificação |
| --- | --- | --- |
| 1 | Migration `payment_method` + teste de integração: entrada criada já confirmada entra no realizado e no saldo, não aparece na conciliação e desfazer volta a planejado. | Suíte local nova; conferir o painel contra o SQL. |
| 2 | Hook e ViewModel: estado "situação" e "forma", validações (título, data), gravação em um passo. | Testes unitários das regras (título padrão, mês pela data). |
| 3 | Formulário: toggle de situação, seletor de forma, textos por tipo, nota sobre cartão, aviso de data futura. | Verificação no navegador contra a pilha local. |
| 4 | Lista da categoria: etiqueta da forma de pagamento e desfazer limpando-a; docs. | Verificação no navegador. |

## Riscos e pontos de atenção

1. **Contagem em dobro com o cartão.** Se marcar como pago algo que depois aparece na
   fatura, vai contar duas vezes. Mitigação: cartão de crédito não é opção de forma de
   pagamento e o formulário avisa.
2. **Despesa já paga em mês diferente do vencimento.** Usamos a data do formulário como
   mês de competência; o plano não separa "vencimento" de "pagamento".
3. **Título nulo.** Confirmar na fase 2 como o banco preenche o título hoje quando ele
   vem vazio, para não quebrar a lista.
4. **Desfazer.** Hoje volta para `PLANNED`; para um lançamento criado já pago isso o
   transformaria em planejamento pendente. Alternativa: oferecer "Excluir" em vez disso
   (decisão abaixo).
5. **Fechamento do mês.** O snapshot usa `get_month_dashboard`, então segue a mesma
   regra sem mudança. Meses já fechados precisam de "Recalcular mês" depois de
   lançar algo retroativo.

## Decisões em aberto (com a sugestão)

1. Guardar a forma de pagamento? **Sugestão:** sim, coluna opcional simples.
   A alternativa é só marcar "pago", sem forma.
2. Formas oferecidas? **Sugestão:** Dinheiro, Pix, Débito/transferência, Outro.
3. Padrão do toggle? **Sugestão:** `Planejado`, como hoje, para não mudar o hábito.
4. Desfazer um lançamento criado já pago? **Sugestão:** manter o desfazer atual (volta a
   planejado) e acrescentar "Cancelar", que já existe, para quem quiser remover.
5. Templates recorrentes com "já pago" (por exemplo, o aluguel do mês atual)?
   **Sugestão:** fora desta entrega; o caminho continua sendo marcar na lista.

## Conformidade com as regras do projeto

MVVM com hooks, React Query para o servidor, arquivos abaixo de 150 linhas (o
`add-plan-sheet.tsx` já tem 173, então o seletor de situação e o de forma entram como
componentes próprios), TypeScript estrito sem `any`, nomes em inglês. A migration é
SQL e não há mudança nativa.
