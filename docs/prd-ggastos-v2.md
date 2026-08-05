# PRD - GGastos v2

## Metadados
- Produto: GGastos v2
- Data: 2026-07-10
- Status: Baseline histórico; estratégia ativa revisada em 2026-08-05
- Idioma: PT-BR

## Atualização de estratégia

Este PRD registra o desenho inicial baseado em Pluggy. A estratégia ativa do
MVP passou a ser a importação assistida de faturas CSV de Nubank e Bradesco,
com planejamento manual, conciliação e fechamento preservados. As seções que
citam Pluggy abaixo são contexto histórico, não orientação de implementação ou
deploy.

Fonte ativa: [`card-statement-import.md`](card-statement-import.md) e
`.specs/features/card-statement-import/`.

## Contexto
O GGastos nasceu a partir de uma planilha mensal de controle financeiro com uma característica pouco atendida pelos apps atuais: mostrar com clareza o quanto do mês já está comprometido por gastos planejados, antes mesmo de todas as transações acontecerem.

Na planilha de 2021, cada mês combina:
- receitas esperadas x recebidas;
- despesas esperadas x pagas;
- saldo esperado x saldo atual;
- consolidação anual por categoria;
- planejamento manual de gastos recorrentes, parcelas e metas de poupança.

O app atual em React Native preserva parte dessa ideia, mas ainda funciona como um protótipo local:
- dados salvos apenas em `AsyncStorage`;
- compras parceladas materializadas por mês;
- pouca separação entre planejado, realizado e conciliado;
- sem backend, sem sync, sem usuários, sem integração bancária;
- telas de gráficos e configurações ainda vazias.

## Problema
Apps de finanças normalmente mostram bem o passado e o presente, mas mostram mal o compromisso futuro do mês. O usuário consegue ver o que já gastou, mas não consegue responder com segurança perguntas como:
- quanto ainda posso gastar este mês sem estourar meu plano;
- quais despesas já estão comprometidas, mesmo sem terem sido debitadas;
- quanto do cartão e das recorrências futuras já deveria entrar no mês;
- o que veio automaticamente do banco e o que ainda preciso planejar manualmente.

## Visão do Produto
O GGastos v2 é um app mobile de planejamento financeiro pessoal centrado em
`planejado vs. realizado`. A fonte automática ativa são faturas CSV de cartão
Nubank e Bradesco; registros fora desses cartões permanecem manuais.

## Objetivos
1. Transformar o modelo mental da planilha em um produto digital confiável.
2. Reduzir drasticamente a digitação manual por importação de faturas CSV suportadas.
3. Preservar e ampliar a visão de gasto previsto do mês.
4. Conciliar automaticamente transações importadas com compromissos planejados.
5. Dar fechamento mensal e consolidado anual com poucas ações manuais.

## Não Objetivos
- Fazer internet banking completo.
- Substituir contabilidade formal ou ERP.
- Cobrar pagamentos ou automatizar Pix no MVP.
- Atender múltiplos usuários em orçamento compartilhado no MVP.
- Fazer consultoria financeira ou recomendação de investimento.

## Público-Alvo
- Pessoa física que já controla gastos manualmente e valoriza previsibilidade.
- Usuário que tem contas em múltiplos bancos/cartões e quer centralização.
- Usuário que trabalha com orçamento mensal por categoria e compromissos futuros.

## Princípios de Produto
- Automação sem perda de controle: importar o máximo possível, mas permitir correção manual.
- Planejamento é entidade de primeira classe: uma transação futura planejada vale tanto quanto uma transação já ocorrida para fins de orçamento.
- Explicabilidade: todo valor agregado deve mostrar de onde veio.
- Conciliação antes de resumo: dashboard não pode misturar planejado e realizado sem deixar a regra explícita.
- Mês como unidade operacional: a experiência principal continua sendo mensal, com visão anual consolidada.

## Escopo ativo do MVP

### 1. Importação de fatura
- Importar CSV de Nubank e Bradesco.
- Mostrar resultado por lote: lidas, importadas, duplicadas, ignoradas, falhas
  e matches criados.
- Preservar dados de origem e impedir duplicidade por fingerprint de linha.

### 2. Planejamento e conciliação
- Manter lançamentos manuais, recorrências e parcelas futuras conhecidas.
- Conciliar automaticamente ou sugerir a conciliação entre linha da fatura e
  planejamento, sem dupla contagem no dashboard.

### 3. Limites da primeira versão
- Não há importação por PDF/OCR, e-mail ou Open Finance.
- Apenas Nubank e Bradesco são suportados.
- Categorias internas podem ficar vazias após a importação e ser revisadas
  depois, sem bloquear o realizado do mês.

## Escopo MVP original (histórico)

### 1. Conexão financeira
- Consumir os próprios dados já autorizados no ambiente pessoal da Pluggy.
- Exibir status da conexão por instituição quando essa informação estiver disponível.
- Permitir sincronização manual dos dados quando necessário.
- Exibir erros acionáveis de consentimento, autorização ou indisponibilidade da origem.

### 2. Ingestão e normalização
- Importar extrato, saldo e investimentos.
- Importar contas e cartões apenas quando esses dados estiverem disponíveis no modo pessoal usado.
- Manter histórico via sincronização por consulta (`pull`) sob demanda ou agendada.
- Normalizar transações em um schema interno estável.
- Deduplicar sincronizações e suportar atualizações no dado de origem.

### 3. Planejamento mensal
- Criar lançamentos planejados manuais.
- Criar recorrências mensais e anuais simples.
- Criar parcelas futuras conhecidas.
- Definir categoria, competência, conta/cartão esperado, valor previsto e observações.
- Permitir marcar um planejamento como opcional, fixo ou obrigatório.

### 4. Conciliação planejado x realizado
- Tentar conciliar automaticamente transações importadas com planejamentos.
- Permitir confirmar, desfazer ou refazer a conciliação manualmente.
- Tratar diferenças de valor, data e descrição.
- Mostrar itens não conciliados em uma caixa de entrada.

### 5. Visão do mês
- Saldo previsto do mês.
- Saldo realizado até agora.
- Total comprometido restante.
- Totais por categoria: previsto, realizado e diferença.
- Separação entre receita, despesa, investimento e transferência.

### 6. Fechamento e consolidado
- Fechamento mensal lógico com snapshot informativo, sem bloquear correções posteriores.
- Visão anual consolidada por categoria.
- Comparação entre meses.
- Rollover de compromissos pendentes para o mês seguinte quando aplicável.

## Escopo Pós-MVP
- Regras automáticas avançadas de categorização próprias do usuário.
- Forecast de caixa de 3 a 6 meses.
- Metas financeiras e envelopes.
- Orçamento-meta por categoria.
- Entidade explícita de fatura de cartão (`credit_card_bills`).
- Orçamento compartilhado.
- Importação de anexos e comprovantes.
- Qualquer migração futura para um plano comercial da Pluggy com onboarding embutido no app.

## Fluxos Principais

### Fluxo 1. Primeiro uso
1. Usuário cria conta no GGastos.
2. Usuário conecta seus bancos no ambiente pessoal da Pluggy e concede os consentimentos necessários.
3. GGastos sincroniza os próprios dados disponíveis via API direta server-side; MCP/CLI podem apoiar descoberta técnica fora do fluxo de produto.
4. Usuário revisa categorias internas do GGastos, usando a visão categorizada da Pluggy apenas como referência complementar quando existir.
5. Usuário cadastra compromissos futuros que não aparecem no extrato.
6. Dashboard do mês mostra previsto, realizado e diferença.

### Fluxo 2. Planejamento do mês
1. Usuário abre o mês atual.
2. Visualiza recorrências e parcelas já geradas.
3. Adiciona ou ajusta gastos esperados.
4. Saldo previsto é recalculado em tempo real.

### Fluxo 3. Conciliação
1. Usuário dispara uma sincronização ou o sistema executa uma sincronização agendada.
2. Motor de matching tenta vinculá-la a um planejamento existente.
3. Se confiança alta, marca como conciliada automática.
4. Se confiança baixa, cai na fila “Revisar”.
5. Usuário confirma ou corrige.

### Fluxo 4. Refresh de conexão
1. Usuário toca em “Sincronizar”.
2. O backend consulta os próprios dados liberados na Pluggy para esse usuário.
3. Se houver problema de consentimento ou autorização, o app orienta o usuário a resolver isso no ambiente pessoal da Pluggy.
4. Dados novos são incorporados sem recriar histórico local.

## Requisitos Funcionais

### RF-01 Conexões
- O sistema deve permitir múltiplas conexões financeiras do próprio usuário.
- O sistema deve armazenar os identificadores de origem necessários para reencontrar contas e transações sincronizadas.
- O sistema deve impedir duplicidade de vínculos locais quando possível.

### RF-02 Contas e cartões
- O sistema deve exibir contas bancárias e cartões vinculados a cada conexão.
- O sistema deve distinguir `BANK` de `CREDIT`.

### RF-03 Transações
- O sistema deve persistir transações importadas como imutáveis na origem e mutáveis apenas em metadados internos.
- O sistema deve suportar `POSTED` e `PENDING`.
- O sistema deve suportar atualização e exclusão vindas da origem.
- O sistema deve permitir edição apenas de metadados internos, como categoria interna, nota, ocultar do orçamento e marcação de transferência.

### RF-04 Planejamentos
- O sistema deve permitir planejamento manual independente da Pluggy.
- O sistema deve gerar ocorrências futuras a partir de modelos recorrentes.
- O sistema deve suportar parcelas futuras conhecidas.

### RF-05 Categorias
- O sistema deve possuir taxonomia própria de categorias do GGastos.
- O sistema pode usar categorias e sinais de saúde financeira da Pluggy como apoio, mas não deve depender disso como verdade final nem como contrato obrigatório da API.
- O sistema deve permitir remapeamento por regra do usuário.
- O MVP deve usar catálogo global de categorias com personalização por regras do usuário.

### RF-06 Conciliação
- O sistema deve conciliar transação importada com planejamento por regras de valor, data, categoria, conta/cartão e descrição.
- O sistema deve permitir conciliação 1:1 no MVP.
- O sistema deve registrar trilha de auditoria da conciliação.

### RF-07 Dashboard mensal
- O sistema deve mostrar:
  - receitas previstas;
  - receitas realizadas;
  - despesas previstas;
  - despesas realizadas;
  - saldo previsto;
  - saldo atual;
  - comprometido restante;
  - consolidado por categoria.
- Transferências internas devem ser neutras por padrão, com possibilidade de override pelo usuário.

### RF-08 Fechamento
- O sistema deve permitir fechamento mensal lógico sem impedir correções posteriores.
- O sistema deve gerar snapshot para consolidado anual.

## Requisitos Não Funcionais
- Dados financeiros e credenciais devem trafegar e ser armazenados com criptografia.
- Cliente mobile não pode expor segredos de integração usados para acessar a Pluggy.
- Sistema deve ser resiliente a retries e duplicidade de sincronização.
- Leituras do dashboard mensal devem ser rápidas o suficiente para uso diário.
- Logs devem permitir reprocessar syncs e conciliações.

## Dependências Externas
- Acesso pessoal/free da Pluggy para os próprios dados, conforme plano vigente em 2026-07-10.
- API direta da Pluggy para leitura de extrato, saldo e investimentos dos próprios dados; MCP/CLI podem apoiar descoberta operacional quando útil.
- Gestão de consentimentos Open Finance no ambiente pessoal da Pluggy.

## Decisões Fechadas Para o MVP

- Auth: Supabase Auth com e-mail/senha.
- Integração Pluggy: descoberta híbrida quando útil, mas arquitetura de produto por API direta server-side em Edge Functions.
- Sync: manual + agendado; endpoint/stub na fundação, cron no sync real.
- Transferências internas: neutras por padrão, com override.
- Cartão: sem entidade de fatura no MVP; compras individuais, dados de fechamento/vencimento na conta e parcelas por planejamento.
- Orçamento-meta por categoria: fora do MVP.
- Transações importadas: campos de origem preservados; usuário edita apenas metadados internos.
- Fechamento mensal: snapshot informativo/recalculável, sem bloqueio rígido de alteração.
- Seed global de categorias: catálogo fixo inicial com hierarquia simples aprovada.
- Sync agendado padrão: a cada 12 horas.
- Consolidado anual do MVP: somente por competência; liquidação fica para evolução futura.

## Métricas de Sucesso
- Percentual de transações importadas automaticamente.
- Percentual de transações conciliadas sem intervenção manual.
- Tempo médio para fechamento mensal.
- Quantidade média de lançamentos manuais por usuário por mês.
- Retenção mensal de usuários ativos.
- Precisão percebida do saldo previsto.

## Riscos
- O acesso free da Pluggy para uso pessoal não oferece o mesmo nível de controle de onboarding e eventos de um plano comercial.
- A disponibilidade de categorias via API no modo pessoal pode não ser suficiente para o produto depender disso diretamente.
- Cartões de crédito exigem regras específicas de competência, fatura e parcelas mesmo quando parte do dado vier de extrato.
- Planejamento mal modelado pode gerar dupla contagem entre previsão manual e transação importada.
- O app atual não oferece base pronta para sync distribuído; a evolução exigirá backend novo.

## Decisões Operacionais Fechadas

### Seed global inicial de categorias

| code | name | impact_type | color | parent_code |
| --- | --- | --- | --- | --- |
| income | Receitas | INCOME | `#2E8B57` | - |
| expense | Despesas | EXPENSE | `#D1495B` | - |
| investment | Investimentos | INVESTMENT | `#1F6FEB` | - |
| transfer | Transferências | TRANSFER | `#6B7280` | - |
| salary | Salário | INCOME | `#2E8B57` | income |
| extra_income | Renda extra | INCOME | `#3FAF75` | income |
| housing | Moradia | EXPENSE | `#C44536` | expense |
| food | Alimentação | EXPENSE | `#E07A5F` | expense |
| transport | Transporte | EXPENSE | `#F2A65A` | expense |
| health | Saúde | EXPENSE | `#D7263D` | expense |
| education | Educação | EXPENSE | `#4D908E` | expense |
| bills | Contas e serviços | EXPENSE | `#577590` | expense |
| shopping | Compras | EXPENSE | `#9C6644` | expense |
| leisure | Lazer | EXPENSE | `#7B2CBF` | expense |
| taxes_fees | Impostos e tarifas | EXPENSE | `#6C757D` | expense |
| invested_amount | Aportes | INVESTMENT | `#277DA1` | investment |
| internal_transfer | Transferência interna | TRANSFER | `#6B7280` | transfer |

### Sync agendado padrão

- Executar a cada `12 horas` no MVP real.

### Consolidado anual do MVP

- Calcular apenas por `competência`.
- Preservar evolução futura para visão por `liquidação`, sem contrato funcional duplo nesta fase.
