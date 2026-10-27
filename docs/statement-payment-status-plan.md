# Plano: situação de pagamento da fatura importada (paga ou em aberto)

## Status

Concluído (fases 1 a 5), pendente de mesclar na `pwa`. Branch: `feature/statement-payment-status`.

- Fase 5 concluída: o fechamento do mês avisa, após fechar, quando há fatura em aberto no
  mês; o anual ganhou a nota de que os gastos incluem faturas abertas; documentação em
  `card-statement-import.md`.

- Fase 4 concluída: seção "Faturas" no topo de Pendências (banco, mês, total, etiqueta e
  botão "Marcar como paga" / "Reabrir", via `set_statement_payment_status`, com data de
  pagamento igual a agora) e card "Faturas em aberto" no painel quando há despesa aberta no
  mês. As consultas do painel e do anual são refeitas na hora (`refetchType: 'all'`), porque
  o app desliga o refetch ao montar a tela.
- Fase 3 concluída: a folha de importação tem "Situação da fatura: Automático / Paga /
  Em aberto" (padrão Automático, que deixa o arquivo ou o vencimento decidir). Como o app
  não lê o CSV antes de enviar, a situação detectada aparece depois da importação
  ("Fatura em aberto. Sugerida pelo vencimento."), e dá para reimportar com escolha explícita.
- Fase 2 concluída: parsers detectam a situação (Bradesco: `Situação da Fatura`; Nubank:
  vencimento no nome do arquivo), a importação aceita `paymentStatus`, grava lote e linhas
  e a reimportação nunca reabre uma fatura paga sem escolha explícita. Testes em
  `payment-status.test.mjs` e `reimport-suite.mjs` (integração local).
- Fase 1 concluída: migration `20261027120000_statement_payment_status.sql` (colunas do
  lote, função `set_statement_payment_status`, painel lendo `status`), aplicada no banco
  remoto. O "Saldo atual" do app passou a ler `currentBalanceCents`. O fechamento do mês
  (`recalculate-month-snapshot`) já usa `get_month_dashboard`, então segue a mesma regra
  sem mudança de código. Testes em `supabase/tests/statement-payment-status-suite.mjs`.

## O que se quer

Ao importar um extrato, escolher se **todos os itens já foram pagos** ou se a
fatura fica **em aberto**. Depois, poder mudar essa situação (por exemplo,
marcar como paga quando o pagamento acontecer).

## Como funciona hoje (achados)

| Ponto | Situação atual |
| --- | --- |
| Coluna `imported_transactions.status` | Já existe (`PENDING` ou `POSTED`), mas a importação sempre grava `POSTED` e **nenhuma consulta lê esse valor**. |
| Painel do mês (`get_month_dashboard`) | O "realizado" soma **toda** compra importada com `competency_month` do mês, paga ou não. "Saldo atual" = receitas menos despesas realizadas. |
| "Comprometido restante" | Só soma **planejamentos** de despesa ainda `PLANNED`. Compras importadas nunca entram. |
| Planejamento | Já existe uma confirmação manual (`RECONCILED` com `manually_confirmed_at`), que serve de precedente para "marcar como pago". |
| Arquivo da Bradesco | Traz `Situação da Fatura: PAGO`. O parser ignora essa linha. |
| Arquivo da Nubank | Não traz situação. O nome tem o vencimento (`Nubank_2027-01-15.csv`). |
| Lote (`statement_import_batches`) | Guarda banco, mês da fatura e contagens, mas nada sobre pagamento. |
| Reimportação | Agora preserva categoria e nota (`preserveUserEdits`). A situação de pagamento precisa seguir a mesma ideia. |

Consequência: uma fatura que ainda não foi paga já reduz o "Saldo atual" como se
o dinheiro tivesse saído, e não aparece como dívida a pagar. Isso é mais evidente
nas faturas futuras da Nubank (parcelas de 2027).

## Proposta

### Modelo de dados

- **Fonte de verdade por linha:** usar o `status` que já existe. `POSTED` = paga,
  `PENDING` = em aberto. As consultas do painel passam a ler esse campo.
- **Por lote:** novas colunas `payment_status` (`PAID` ou `OPEN`) e `paid_at`,
  para listar faturas, exibir etiquetas e alternar a situação de uma vez.
- **Função `set_statement_payment_status(batch_id, status, paid_at)`:** atualiza
  o lote e todas as suas linhas numa única transação, com RLS (`security invoker`).
- **Migração de dados:** todos os lotes e linhas atuais viram `PAID`/`POSTED`, o
  que preserva exatamente o comportamento de hoje.

### Importação

- A requisição ganha o campo opcional `paymentStatus` (`PAID` ou `OPEN`).
- **Sugestão do valor padrão**, sempre editável na tela:
  - Bradesco: lida do arquivo (`PAGO` sugere paga; qualquer outro valor, em aberto).
  - Nubank: pelo vencimento no nome do arquivo (vencimento já passou sugere paga;
    caso contrário, em aberto).
  - Sem informação: paga, como hoje.
- A função grava `payment_status` no lote e `POSTED` ou `PENDING` nas linhas.
- **Reimportação:** nunca rebaixa uma fatura paga para aberta sem escolha explícita
  do usuário na tela.

### Painel do mês

| Indicador | Regra proposta |
| --- | --- |
| Saldo atual | Passa a contar só linhas `POSTED` (dinheiro que de fato saiu). |
| Comprometido restante | Soma os planejamentos `PLANNED` **mais** as despesas importadas `PENDING` que não casaram com um planejamento (evita contar em dobro). |
| Gasto por categoria e relatório anual | Continuam contando tudo (o gasto aconteceu), com a diferença visível. |
| Novo: "Faturas em aberto" | Total a pagar e quantas faturas, com acesso à lista. |

### Telas

- **Folha de importação:** controle "Situação da fatura: Paga / Em aberto", com
  a nota "Detectado no arquivo: paga" quando houver sugestão.
- **Lista de faturas** (na aba Pendências): cada lote com banco, mês, total e
  etiqueta. Ação **Marcar como paga** (com data) e **Reabrir**.
- **Fechar mês:** avisa quando houver faturas em aberto no mês (sem bloquear).

## Fases (cada uma é um PR pequeno)

| Fase | Entrega | Verificação |
| --- | --- | --- |
| 1 | Migration: colunas do lote, função de alternar, backfill. Painel passa a ler `status`. | Suíte local nova: alternar atualiza lote e linhas de forma atômica; usuário não altera lote alheio; painel muda só para linhas abertas; comparação antes e depois nos seus dados (nada muda, pois tudo é pago). |
| 2 | Parser e importação: detecção na Bradesco, sugestão na Nubank, campo `paymentStatus`, reimportação sem rebaixar. | Testes unitários dos parsers e teste de integração de reimportação, como o `reimport-suite`. |
| 3 | Folha de importação com o controle e a sugestão. | Verificação no navegador contra a pilha local. |
| 4 | Lista de faturas, ação de marcar como paga e card "Faturas em aberto" no painel. | Verificação no navegador; conferir o total do painel contra o SQL. |
| 5 | Aviso ao fechar o mês, nota no relatório anual e documentação. | Verificação manual. |

A fase 1 não muda nada visível para você, porque hoje tudo é pago. O primeiro
efeito aparece quando você importar uma fatura marcada como em aberto (fase 3).

## Riscos e pontos de atenção

1. **Mudar o "Saldo atual" é mudança de significado.** Quem olha o saldo vai ver um
   número maior quando houver fatura aberta. Mitigação: o card "Faturas em aberto"
   mostra o quanto falta pagar, e o "Saldo previsto" continua considerando tudo.
2. **`get_month_dashboard` é uma função grande**, já alterada várias vezes. A
   migration deve copiar a versão mais recente e mudar só as condições de `status`,
   com teste de regressão contra o resultado atual.
3. **Contar em dobro.** Um planejamento conciliado com uma compra em aberto não
   pode entrar duas vezes em "Comprometido restante". A regra acima exclui
   despesas que já casaram com um planejamento.
4. **Lotes duplicados por reimportação.** Cada reimportação cria um lote novo e as
   linhas passam a apontar para o último. A situação deve ser sempre lida do lote
   mais recente da linha.
5. **Nubank sem situação no arquivo.** A sugestão por vencimento é uma heurística;
   por isso é sempre editável.
6. **`recalculate-month-snapshot`** também calcula saldos e precisa seguir a mesma
   regra de `status`, senão o fechamento diverge do painel.

## Decisões em aberto (com a sugestão)

1. O que "em aberto" muda no painel? **Sugestão:** sai do "Saldo atual" e entra em
   "Comprometido restante"; categorias e anual continuam contando tudo.
2. Valor padrão ao importar? **Sugestão:** detectado no arquivo (Bradesco) ou pelo
   vencimento (Nubank), sempre editável.
3. Granularidade? **Sugestão:** a fatura inteira, como você pediu. Exceção por item
   fica para depois, se precisar.
4. Marcar como paga depois: onde? **Sugestão:** lista de faturas na aba Pendências.
5. Fechar mês com fatura aberta? **Sugestão:** permitir, com aviso.

## Conformidade com as regras do projeto

MVVM com hooks, React Query para dados do servidor, lista com `FlatList` e
referências estáveis, erros tratados sem rejeições soltas, TypeScript estrito sem
`any`, arquivos abaixo de 150 linhas e nomes em inglês
(`.claude/rules/rn-expo.md` e `.claude/rules/code-standards.md`). Não há mudança
nativa.
