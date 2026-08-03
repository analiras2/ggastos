# Importacao de Fatura de Cartao Specification

## Problem Statement

O GGastos precisa continuar reduzindo lancamentos manuais sem depender da liberacao da Pluggy. A nova estrategia usa faturas CSV de cartao de credito, inicialmente Nubank e Bradesco, para importar gastos reais e conciliar com o planejamento ja existente, especialmente compras parceladas que aparecem mes a mes na fatura.

## Goals

- [ ] Importar CSVs de fatura Nubank e Bradesco com normalizacao consistente para o schema interno.
- [ ] Evitar duplicidade quando uma linha importada representa uma parcela que ja existe em `planned_entries`.
- [ ] Reaproveitar o motor de conciliacao e a inbox de revisao para confirmar ou rejeitar matches.
- [ ] Manter registro manual como caminho principal para bancos, contas e gastos fora dos CSVs suportados.
- [ ] Preservar dashboard mensal, fechamento e consolidado anual baseados em planejado vs. realizado.

## Product Reuse Plan

| Existing Capability | Reuse Decision |
| --- | --- |
| `planning_templates` / `planned_entries` | Reusar para recorrencias, parcelas futuras conhecidas e lancamentos manuais. |
| `imported_transactions` | Reusar como destino normalizado das linhas de CSV, trocando IDs Pluggy por um identificador estavel de importacao. |
| `reconciliation_matches` | Reusar para impedir duplicidade ativa e manter trilha de auditoria de match, rejeicao e undo. |
| Matching engine | Reusar score por valor, data, descricao, categoria e conta, ajustando sinais para parcelas/faturas CSV. |
| Reconciliation inbox | Reusar UI e comandos de confirmar/rejeitar sugestoes. |
| Dashboard mensal e detalhe por categoria | Reusar leitura de realizado a partir de `imported_transactions` conciliadas ou nao, mantendo a regra atual de evitar dupla contagem. |
| Fechamento mensal e anual | Reusar sem mudanca conceitual. |
| Supabase Auth/RLS | Manter, mesmo sendo app pessoal, para preservar isolamento e funcoes SQL existentes. |
| Auth form / manual login UI | Remover da experiencia principal; manter somente sessao pessoal invisivel enquanto o backend ainda depende de `auth.uid()`. |
| Pluggy functions/UI | Nao usar na rota principal; ficam como snapshot/opcao futura. |

## New Capabilities

| New Capability | Purpose |
| --- | --- |
| Statement import batch | Registrar cada upload com banco, periodo/fatura, status, totais e erros de parsing. |
| Bank-specific parsers | Converter CSV Nubank e Bradesco para um contrato intermediario comum. |
| Import fingerprint | Gerar chave idempotente por linha para reimportar o mesmo arquivo sem duplicar transacoes. |
| Installment extraction | Detectar parcela atual/total quando o CSV trouxer esse dado na descricao ou coluna propria. |
| Import review screen | Mostrar linhas reconhecidas, ignoradas, duplicadas e sugestoes de match antes/depois de salvar. |
| Manual fallback | Garantir que itens fora de Nubank/Bradesco continuem sendo cadastrados pelo fluxo manual existente. |

## Observed CSV Formats

Raw samples were provided on 2026-08-03 and inspected locally only. They contain real personal financial data and must not be committed to the repository. Use sanitized fixtures derived from these shapes for automated tests.

### Nubank

| Property | Observed Value |
| --- | --- |
| Encoding | UTF-8 CSV text |
| Delimiter | Comma |
| Header | `date,title,amount` |
| Date format | `YYYY-MM-DD` |
| Amount format | Decimal comma, quoted when needed, e.g. `"159,00"` |
| Shape | One transaction row per CSV row, no metadata preamble |
| Edge observed | Exact duplicate transaction tuples can appear and must not be collapsed unless the import fingerprint proves they are the same source row |
| Installments | Some titles contain installment-like text; parser should preserve raw title and extract installment only when confident |

### Bradesco

| Property | Observed Value |
| --- | --- |
| Encoding | ISO-8859-1 text |
| Line endings | Carriage return (`CR`) |
| Delimiter | Semicolon |
| Header | `Data;Historico;Valor(US$);Valor(R$);` after metadata lines |
| Sections | Current invoice section plus `Lancamentos programados` section with the same transaction header |
| Date formats | Current invoice rows use `DD/MM`; scheduled rows can use `DD/MM/YYYY` |
| Amount format | Decimal comma in `Valor(R$)`; `Valor(US$)` usually present but should not drive BRL budget amounts |
| Non-transaction rows | Totals, invoice status, previous balance, payment/debit rows, summaries and fee tables must be classified explicitly instead of blindly imported |
| Installments | Descriptions often include installment markers such as `1/3`, `3/5`, `8/10` |

## Out of Scope

| Feature | Reason |
| --- | --- |
| Integracao Pluggy/Open Finance ativa | Preservada em branch separada; nao deve bloquear a nova estrategia. |
| Suporte a todos os bancos | MVP novo valida primeiro Nubank e Bradesco. |
| PDF/OCR | A primeira versao assume CSV estruturado. |
| Matching N:N | O modelo atual 1:1 e suficiente para validar fatura vs. parcela planejada. |
| Entidade completa de fatura com pagamento/fechamento de cartao | Pode vir depois; agora o objetivo e ingestao e conciliacao das linhas. |
| Importacao automatica por email | Depende de acesso a email/permissoes e aumenta escopo operacional. |

---

## User Stories

### P1: Importar CSV Nubank MVP

**User Story**: Como usuario, quero importar uma fatura CSV do Nubank para transformar gastos do cartao em transacoes realizadas sem digitar tudo manualmente.

**Why P1**: Nubank e uma das duas fontes iniciais e valida o fluxo vertical de upload, parsing, idempotencia e dashboard.

**Acceptance Criteria**:

1. WHEN o usuario seleciona um CSV Nubank valido THEN o sistema SHALL parsear as linhas para um contrato intermediario comum.
2. WHEN uma linha tem data, descricao e valor validos THEN o sistema SHALL criar ou atualizar uma `imported_transaction` com origem Nubank.
3. WHEN o mesmo arquivo ou a mesma linha e importado novamente THEN o sistema SHALL manter uma unica transacao por fingerprint.
4. WHEN o CSV tem linhas invalidas THEN o sistema SHALL importar as linhas validas e reportar as invalidas com motivo.
5. WHEN duas linhas Nubank tem mesmo `date`, `title` e `amount` mas ocupam linhas diferentes do arquivo THEN o sistema SHALL nao colapsar as duas apenas por valor/data/titulo.

**Independent Test**: Importar uma amostra Nubank sanitizada duas vezes e verificar contagem estavel em `imported_transactions`.

---

### P1: Importar CSV Bradesco MVP

**User Story**: Como usuario, quero importar uma fatura CSV do Bradesco para cobrir o segundo cartao suportado no app.

**Why P1**: O produto so sera util no novo fluxo se cobrir os dois bancos definidos para uso real.

**Acceptance Criteria**:

1. WHEN o usuario seleciona um CSV Bradesco valido THEN o sistema SHALL detectar ou receber explicitamente o banco emissor e aplicar o parser correto.
2. WHEN campos do Bradesco divergirem do Nubank THEN o sistema SHALL normalizar para o mesmo contrato intermediario.
3. WHEN o arquivo nao corresponder ao formato esperado THEN o sistema SHALL bloquear a importacao com erro claro e sem gravar lote parcial invisivel.
4. WHEN valores de despesa vierem com sinal diferente do Nubank THEN o sistema SHALL converter para `impact_type = EXPENSE` e `direction` corretos.
5. WHEN o arquivo Bradesco contem secoes de resumo, taxas, total da fatura, saldo anterior ou pagamento THEN o sistema SHALL ignorar ou classificar essas linhas explicitamente, nunca importando-as por acidente como compras comuns do cartao.
6. WHEN o arquivo Bradesco contem `Lancamentos programados` THEN o sistema SHALL parsear essas linhas separadamente das linhas da fatura atual para que o design decida se viram planejamentos, transacoes importadas ou apenas preview.

**Independent Test**: Importar uma amostra Bradesco sanitizada e comparar totais parseados com totais esperados da fatura.

---

### P1: Conciliar parcelas importadas com planejamento existente

**User Story**: Como usuario, quero que uma parcela que ja cadastrei no planejamento seja reconhecida quando aparecer no CSV para nao duplicar o gasto.

**Why P1**: Esta e a regra central do pivot: a fatura confirma parcelas futuras, nao deve somar duas vezes o mesmo compromisso.

**Acceptance Criteria**:

1. WHEN uma transacao importada tem valor, mes, descricao e parcela compativeis com um `planned_entry` ativo THEN o sistema SHALL calcular score de match.
2. WHEN o score passa o limiar automatico THEN o sistema SHALL criar `reconciliation_matches.status = AUTO_MATCHED`.
3. WHEN o score fica em faixa de revisao THEN o sistema SHALL exibir sugestao na inbox.
4. WHEN uma transacao ja tem match ativo THEN o sistema SHALL impedir outro match ativo para a mesma transacao.
5. WHEN um planejamento ja tem match ativo THEN o sistema SHALL impedir outro match ativo para o mesmo planejamento.

**Independent Test**: Criar uma compra parcelada planejada, importar o CSV com a proxima parcela e verificar que o dashboard nao duplica o valor.

---

### P1: Revisar importacao antes de confiar nos dados

**User Story**: Como usuario, quero ver o resultado da importacao para saber o que entrou, o que foi ignorado e o que precisa de revisao.

**Why P1**: CSVs variam por banco e a confianca depende de uma revisao transparente.

**Acceptance Criteria**:

1. WHEN um lote e processado THEN o sistema SHALL mostrar total de linhas lidas, importadas, duplicadas, invalidas e sugeridas para match.
2. WHEN ha sugestoes de match THEN o sistema SHALL permitir abrir a inbox de conciliacao.
3. WHEN uma linha foi ignorada como duplicada THEN o sistema SHALL explicar que ela ja havia sido importada.
4. WHEN uma linha nao tem categoria interna THEN o sistema SHALL manter a transacao importada e permitir categorizacao futura.

**Independent Test**: Importar um CSV com uma linha nova, uma duplicada e uma invalida e verificar os tres estados na UI/log do lote.

---

### P1: Registrar manualmente o que nao vem dos CSVs

**User Story**: Como usuario, quero continuar registrando manualmente gastos, receitas e compromissos fora dos cartoes Nubank/Bradesco.

**Why P1**: A nova estrategia nao cobre todos os bancos nem todos os fluxos de dinheiro.

**Acceptance Criteria**:

1. WHEN um gasto nao vem de Nubank ou Bradesco THEN o usuario SHALL conseguir registra-lo pelo fluxo manual existente.
2. WHEN um registro manual representa parcela futura THEN o sistema SHALL continuar usando `planning_templates` e `planned_entries`.
3. WHEN uma transacao importada depois corresponde ao registro manual THEN o sistema SHALL sugerir ou aplicar match, nao criar uma segunda verdade no dashboard.

**Independent Test**: Registrar manualmente uma parcela, importar linha equivalente depois e verificar match/sugestao.

---

### P2: Categorizacao assistida por regras

**User Story**: Como usuario, quero que descricoes recorrentes de fatura recebam categoria automaticamente para reduzir revisao manual.

**Why P2**: Importacao funciona sem isso, mas o dashboard por categoria fica melhor quando as regras amadurecem.

**Acceptance Criteria**:

1. WHEN uma descricao bate em regra ativa do usuario THEN o sistema SHALL preencher `internal_category_id`.
2. WHEN nenhuma regra bate THEN o sistema SHALL deixar a categoria vazia sem bloquear importacao.
3. WHEN o usuario ajusta uma categoria manualmente THEN o sistema SHALL preservar o override interno em reimportacoes.

**Independent Test**: Criar regra para uma descricao recorrente e importar duas linhas que recebam a categoria automaticamente.

---

### P2: Historico de lotes importados

**User Story**: Como usuario, quero consultar importacoes anteriores para entender de onde vieram os dados do mes.

**Why P2**: Ajuda auditoria e depuracao, mas nao bloqueia o fluxo principal.

**Acceptance Criteria**:

1. WHEN o usuario abre historico de importacoes THEN o sistema SHALL listar lotes por banco, arquivo, periodo e status.
2. WHEN o usuario abre um lote THEN o sistema SHALL mostrar resumo e erros associados.
3. WHEN um lote foi reimportado THEN o sistema SHALL deixar claro quantas linhas foram duplicadas/ignoradas.

**Independent Test**: Importar dois CSVs e verificar historico com status correto.

---

### P1: Remover Pluggy da rota ativa do app

**User Story**: Como usuario, quero que o app deixe de oferecer conexao Pluggy e sincronizacao bancaria para focar na importacao de faturas CSV.

**Why P1**: Pluggy foi preservado em branch separada; manter UI, dependencias e funcoes ativas nessa branch aumenta confusao e custo de manutencao.

**Acceptance Criteria**:

1. WHEN o usuario abre o dashboard THEN o sistema SHALL oferecer importacao/revisao de fatura em vez de sincronizacao Pluggy.
2. WHEN o usuario abre Ajustes THEN o sistema SHALL nao mostrar conectar conta Pluggy, status de conexao Pluggy ou reconectar banco.
3. WHEN o app mobile instala dependencias THEN o sistema SHALL nao instalar `pluggy-js` nem `react-native-pluggy-connect`.
4. WHEN funcoes Supabase sao listadas para deploy da nova versao THEN funcoes exclusivas da Pluggy SHALL nao fazer parte do fluxo ativo.
5. WHEN migrations antigas ainda contem campos Pluggy THEN o design SHALL decidir entre compatibilidade temporaria ou migration de schema antes de remover colunas usadas por dashboard/conciliacao.

**Independent Test**: Rodar busca por `pluggy` no codigo ativo e confirmar que referencias restantes estao apenas em docs historicos, migrations legadas ou notas de compatibilidade.

---

### P1: Remover login manual da experiencia pessoal

**User Story**: Como usuario unico do app, quero abrir o app direto no shell principal sem tela de login, cadastro ou botao de sair.

**Why P1**: O app e de uso pessoal e a tela de login nao agrega valor na nova versao.

**Acceptance Criteria**:

1. WHEN o app abre com Supabase configurado THEN o sistema SHALL entrar no shell principal usando a sessao pessoal invisivel.
2. WHEN a sessao ainda esta carregando THEN o sistema SHALL mostrar estado de carregamento simples, nao formulario de login.
3. WHEN o usuario abre Ajustes THEN o sistema SHALL nao mostrar formulario, cadastro ou acao de sair.
4. WHEN Edge Functions e RPCs exigem usuario autenticado THEN o sistema SHALL preservar Auth/RLS ate existir decisao explicita para remover `auth.uid()` do backend.
5. WHEN env vars do dono estao ausentes THEN o sistema SHALL falhar de forma acionavel para setup local, nao expor uma tela de login como fluxo principal.

**Independent Test**: Abrir app com env vars de dono configuradas e verificar que `AuthScreen` nao renderiza; remover env vars e verificar erro de configuracao claro.

---

## Edge Cases

- WHEN o CSV usa separador ou encoding diferente THEN o parser SHALL detectar ou retornar erro claro.
- WHEN o banco muda o layout do CSV THEN o lote SHALL falhar como formato desconhecido em vez de importar dados errados silenciosamente.
- WHEN a descricao contem parcela em formatos diferentes (`1/3`, `01/03`, `PARC 1 DE 3`) THEN o parser SHALL preservar texto bruto e extrair parcela quando houver regra confiavel.
- WHEN uma compra parcelada muda levemente de descricao entre meses THEN o score SHALL continuar considerando valor, parcela, data e similaridade textual.
- WHEN o valor da fatura e estorno/credito THEN o sistema SHALL classificar corretamente como impacto positivo ou ajuste, sem inverter despesas comuns.
- WHEN duas linhas distintas tem mesma data, descricao e valor THEN o fingerprint SHALL incluir contexto suficiente do arquivo/banco/linha para nao colapsar transacoes reais diferentes indevidamente.
- WHEN o usuario importa CSV do mes errado THEN as transacoes SHALL ir para `competency_month` derivado da data da linha ou periodo selecionado, conforme decisao de design.
- WHEN Bradesco fornece datas sem ano em linhas da fatura atual THEN o parser SHALL inferir o ano a partir do contexto confiavel da fatura ou exigir mes/ano informado pelo usuario antes de salvar.
- WHEN o texto esta em ISO-8859-1 THEN o parser SHALL decodificar antes de comparar descricoes ou mostrar preview.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| CSV-01 | P1: Importar CSV Nubank MVP | Tasks | In Tasks |
| CSV-02 | P1: Importar CSV Bradesco MVP | Tasks | In Tasks |
| CSV-03 | P1: Conciliar parcelas importadas com planejamento existente | Tasks | In Tasks |
| CSV-04 | P1: Revisar importacao antes de confiar nos dados | Tasks | In Tasks |
| CSV-05 | P1: Registrar manualmente o que nao vem dos CSVs | Tasks | In Tasks |
| CSV-06 | P2: Categorizacao assistida por regras | Tasks | In Tasks |
| CSV-07 | P2: Historico de lotes importados | Tasks | In Tasks |
| CSV-08 | P1: Remover Pluggy da rota ativa do app | Tasks | In Tasks |
| CSV-09 | P1: Remover login manual da experiencia pessoal | Tasks | In Tasks |

**Coverage:** 9 total, 9 mapped to tasks, 0 unmapped.

---

## Success Criteria

- [ ] Um CSV Nubank sanitizado pode ser importado duas vezes sem duplicar transacoes.
- [ ] Um CSV Bradesco sanitizado pode ser importado duas vezes sem duplicar transacoes.
- [ ] Uma parcela ja planejada e importada depois aparece uma unica vez nos totais do dashboard.
- [ ] Sugestoes ambiguas aparecem na inbox em vez de serem aplicadas silenciosamente.
- [ ] Gastos fora de Nubank/Bradesco continuam registraveis manualmente.
- [ ] O usuario consegue explicar de onde veio cada realizado do mes: planejamento confirmado, CSV importado ou match entre os dois.
- [ ] O app nao mostra mais fluxo Pluggy na rota principal.
- [ ] O app nao mostra mais login/cadastro manual no uso pessoal normal.

## Open Inputs Before Implementation

- Fixtures sanitizadas foram criadas em `.specs/features/card-statement-import/fixtures/`.
- Decisao de UX: banco detectado automaticamente pelo parser ou selecionado manualmente antes do upload.
- Decisao de competencia: usar data da compra, mes da fatura selecionado, ou uma regra diferente para parcelas de cartao.
- Decisao de tratamento para `Lancamentos programados` do Bradesco: preview de proximos gastos, planejamentos futuros, ou importacao diferida.
