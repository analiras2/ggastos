# Layout Guide - GGastos v2

## Metadados
- Projeto: GGastos v2
- Data: 2026-07-11
- Status: Proposta de direção visual para design do MVP
- Uso principal: base para Claude Design / exploração visual / implementação mobile
- Idioma: PT-BR

## Fontes de verdade
- `docs/prd-ggastos-v2.md`
- `.specs/features/foundation-supabase-mobile/spec.md`
- `.specs/features/monthly-core/spec.md`
- `.specs/features/monthly-core/design.md`

## Quando este layout precisa estar definido
- Milestone 1: basta um `app shell` com auth, navegação base e placeholders.
- Milestone 2: o layout funcional precisa estar definido antes da implementação das telas reais.
- Em termos práticos, o design precisa estar fechado antes de construir:
  - dashboard mensal;
  - criação de planejamento;
  - detalhe por categoria;
  - estados vazios e feedbacks de sync/manual.

## Objetivo do layout
Traduzir a proposta central do GGastos para uma interface mobile clara:
- mostrar `planejado vs. realizado` sem ambiguidade;
- destacar o quanto do mês já está comprometido;
- permitir leitura rápida do mês atual;
- manter explicabilidade sobre a origem dos números;
- evitar a aparência genérica de app bancário ou dashboard corporativo.

## Norte de produto
O GGastos não é um banco e não é um app de gastos focado apenas em histórico.
O produto é um planejador financeiro mensal com importação bancária como apoio.

Isso precisa aparecer no layout:
- o mês é a unidade principal da experiência;
- planejamento tem peso visual igual ou maior que transações já ocorridas;
- categorias precisam explicar o orçamento, não apenas listar lançamentos;
- a interface deve comunicar previsão, progresso e compromisso futuro.

## Direção visual proposta

### Mood
- Calmo
- Editorial
- Prático
- Confiável
- Humano

### Personalidade da interface
- Mais "planner financeiro" do que "internet banking".
- Mais "clareza de orçamento" do que "gráficos chamativos".
- Mais "papel, organização e ritmo mensal" do que "fintech neon".

### Referências de linguagem visual
Use apenas como direção de linguagem, não para copiar layout:
- clareza e foco de leitura de apps de notas/calendário;
- organização em blocos de dashboards pessoais;
- cards com respiro e hierarquia editorial;
- visual leve, sem dark mode agressivo e sem excesso de brilho.

## Design Direction Summary

### Paleta sugerida
- `bg-base`: `#F7F2EA` - fundo principal quente e claro
- `bg-surface`: `#FFFDFC` - cards e superfícies elevadas
- `ink-strong`: `#1F1A17` - texto principal
- `ink-soft`: `#5E554D` - texto secundário
- `line-soft`: `#DDD3C7` - divisores e bordas leves
- `brand-primary`: `#1F6B57` - saldo saudável, ações principais
- `brand-primary-soft`: `#DCEEE7` - fundos de destaque positivo
- `expense`: `#C65A46` - despesas e alertas de comprometimento
- `expense-soft`: `#F6E0DA` - fundos suaves de despesa
- `income`: `#2F8A57` - receitas
- `investment`: `#356FA8` - investimentos
- `transfer`: `#7A7A74` - transferências neutras
- `warning`: `#C28A2C` - pendências e revisão manual

### Tipografia
- Títulos e métricas: `Space Grotesk`
- Corpo, labels e navegação: `Manrope`

### Uso tipográfico
- métricas principais: grandes, densas, com forte contraste;
- labels explicativos: menores e suaves;
- mês atual: título com presença visual, quase como capa editorial;
- números devem ser extremamente legíveis.

### Layout approach
- app mobile-first;
- grid de 8pt;
- superfícies empilhadas com bastante hierarquia vertical;
- cards com cantos arredondados médios, não exagerados;
- header do mês com forte identidade;
- CTA principal sempre claro e visível;
- uso de `bottom sheet` para ações rápidas e formulários leves;
- lista de categorias com densidade média, não compacta demais.

## Princípios de interface
1. Nunca misturar `planejado` e `realizado` sem rotular claramente.
2. Saldo previsto e saldo atual devem aparecer lado a lado, nunca fundidos.
3. Comprometimento restante precisa ter destaque visual forte.
4. Transferências internas devem parecer neutras, não custo.
5. A explicabilidade deve estar próxima do número, sem exigir navegação complexa.
6. O mês atual deve ser entendível em menos de 5 segundos.

## Arquitetura de navegação

### Navegação recomendada do MVP
Bottom tabs com 4 entradas:
- `Mês`
- `Planejamento`
- `Revisar`
- `Ajustes`

### Prioridade visual
- `Mês` é a tela principal e default do app.
- `Planejamento` concentra criação e manutenção de compromissos.
- `Revisar` recebe conciliações, syncs com baixa confiança e pendências.
- `Ajustes` contém conexão, perfil, categorias futuras e preferências.

### Observação de milestone
- Na Milestone 1, `Revisar` e parte de `Ajustes` podem existir como placeholders.
- Na Milestone 2, `Mês`, `Planejamento` e detalhe de categoria precisam ter layout real.

## Inventário de telas

### 1. Auth / entrada
Objetivo:
- login e cadastro simples, sem excesso de marketing.

Estrutura:
- topo com marca/nome;
- mensagem curta de proposta de valor;
- formulário principal;
- CTA primário;
- CTA secundário para alternar entre entrar e criar conta.

Estilo:
- minimalista;
- foco em confiança e clareza;
- sem ilustração genérica de fintech.

### 2. Dashboard mensal
Objetivo:
- ser a tela central do produto.

Estrutura recomendada de cima para baixo:
1. header com mês atual e troca de mês;
2. card hero com saldo previsto;
3. bloco comparativo `previsto x atual`;
4. card de `comprometido restante`;
5. quick actions;
6. lista de categorias com previsto, realizado e delta;
7. bloco opcional de pendências ou sync status.

### 3. Planejamento do mês
Objetivo:
- listar e criar compromissos futuros.

Estrutura:
- header com mês;
- resumo curto do que já está planejado;
- filtro por tipo: despesa, receita, investimento, transferência;
- lista de lançamentos planejados;
- CTA flutuante ou fixo para `Adicionar planejamento`.

### 4. Criar/editar planejamento
Objetivo:
- permitir cadastro rápido, claro e sem jargão técnico.

Campos:
- título;
- valor;
- categoria;
- impacto;
- competência;
- conta/cartão esperado opcional;
- observações;
- tipo: avulso, recorrente mensal, recorrente anual, parcelado;
- flags: opcional, fixo, obrigatório.

Padrão visual:
- preferir `bottom sheet` alta ou tela dedicada;
- mostrar preview do impacto no mês;
- esconder complexidade até ser necessária.

### 5. Detalhe de categoria
Objetivo:
- explicar por que a categoria está acima ou abaixo do esperado.

Estrutura:
- header com nome da categoria;
- números principais da categoria;
- abas ou seções para `Planejado` e `Realizado`;
- lista cronológica de itens;
- estado vazio claro.

### 6. Revisão / conciliação
Objetivo:
- tratar o que veio do banco mas ainda não bate com o planejamento.

Estrutura:
- resumo de itens pendentes;
- cards de revisão com score/nível de confiança;
- ações rápidas: confirmar, rejeitar, ignorar;
- badges para `AUTO`, `MANUAL`, `PENDENTE`.

### 7. Conexões e sync
Objetivo:
- mostrar status da origem financeira sem parecer tela técnica demais.

Estrutura:
- lista de instituições conectadas;
- status do consentimento;
- último sync;
- CTA `Sincronizar agora`;
- mensagens acionáveis para erro/autorização expirada.

### 8. Ajustes
Objetivo:
- concentrar conta, preferências, ajuda e configuração futura.

Estrutura:
- perfil;
- conexões;
- preferências de visão do mês;
- sair da conta.

## Anatomia detalhada do dashboard mensal

### Header
- nome do mês em destaque;
- seletor de mês discreto;
- atalho de sync no topo direito;
- evitar header pesada com muitos ícones.

### Card hero
Conteúdo:
- label `Saldo previsto do mês`
- valor principal
- microtexto com variação versus realizado
- status visual de saúde do mês

Comportamento:
- se o mês estiver apertado, o card muda acento para `expense`;
- se estiver saudável, usa `brand-primary`.

### Bloco comparativo
Dois cards lado a lado:
- `Previsto`
- `Atual`

Cada um deve deixar claro:
- o que está incluído;
- se é valor acumulado ou projetado.

### Card de comprometimento
Este é o diferencial do produto.

Conteúdo:
- label `Comprometido restante`
- valor principal
- subtítulo explicando: "quanto do mês ainda está reservado por compromissos futuros"

Visual:
- não usar vermelho de erro por padrão;
- usar tom quente de atenção quando o comprometimento estiver alto.

### Quick actions
- `Adicionar planejamento`
- `Sincronizar`

Formato:
- botões pequenos ou chips largos;
- fáceis de tocar;
- sem excesso de ícones.

### Lista de categorias
Cada linha deve conter:
- nome da categoria;
- valor planejado;
- valor realizado;
- delta;
- indicador visual de tendência.

Padrão:
- linha inteira clicável;
- delta positivo/negativo fácil de interpretar;
- mini barra ou trilha opcional para progresso.

## Sistema de componentes

### Componentes obrigatórios
- `MonthHeader`
- `MetricHeroCard`
- `KpiComparisonCard`
- `CommitmentCard`
- `QuickActionRow`
- `CategoryBudgetRow`
- `PlannedEntryRow`
- `TransactionRow`
- `StatusChip`
- `EmptyStateCard`
- `SyncStatusBanner`
- `FloatingPrimaryAction`

### Status chips
- `PLANEJADO`: fundo suave neutro
- `REALIZADO`: fundo suave verde
- `PENDENTE`: fundo suave amarelo
- `CONCILIADO AUTO`: fundo suave azul-esverdeado
- `CONCILIADO MANUAL`: fundo suave azul
- `CANCELADO`: fundo suave cinza quente

### Ícones
- estilo linear, limpo, sem 3D;
- traço consistente;
- preferência por formas simples e levemente arredondadas.

## Estados importantes

### Estado vazio do mês
Deve comunicar:
- o mês ainda não tem planejamento;
- o usuário pode começar manualmente;
- sync não é obrigatório para começar.

CTA:
- `Criar primeiro planejamento`

### Estado com pouco dado
- mostrar estrutura completa, mesmo com poucos itens;
- evitar sensação de app quebrado.

### Estado de erro de sync
- mensagem humana;
- explicar ação seguinte;
- nunca despejar erro técnico cru.

### Estado de categoria sem itens
- mostrar categoria, números zerados e orientação curta.

### Estado de revisão pendente
- destacar quantidade;
- permitir ação rápida sem navegar demais.

## Microcopy e tom de voz
- direto;
- claro;
- sem linguagem bancária excessiva;
- sem humor desnecessário;
- sempre orientado à próxima ação.

Exemplos de labels boas:
- `Saldo previsto`
- `Saldo atual`
- `Comprometido restante`
- `Ainda falta planejar`
- `Revisar pendências`
- `Sincronizar agora`

Evitar:
- `Budget health score`
- `Cashflow intelligence`
- `Optimization hub`

## Acessibilidade e legibilidade
- contraste forte entre texto e fundo;
- não depender só de cor para explicar variação;
- áreas de toque confortáveis;
- números grandes e estáveis;
- listas com boa separação vertical;
- labels sempre explícitas em métricas financeiras.

## O que evitar
- visual genérico de fintech escura com gradientes neon;
- excesso de gráficos antes de explicar o mês;
- cards demais competindo entre si;
- ícones decorativos sem função;
- excesso de roxo;
- linguagem de banco ou ERP;
- misturar transferência com despesa no mesmo tratamento visual;
- esconder ações principais atrás de menus.

## Entregáveis desejados do Claude Design
Pedir um conjunto coeso de telas mobile:
1. login/cadastro;
2. dashboard mensal;
3. criar planejamento;
4. detalhe de categoria;
5. opcional: revisão/conciliação.

Cada tela deve:
- compartilhar o mesmo design system;
- parecer parte do mesmo app;
- priorizar clareza financeira;
- respeitar a hierarquia `planejado -> realizado -> explicação`.

## Critério de sucesso visual
O layout está correto quando:
- o usuário entende em poucos segundos quanto planejou, quanto já aconteceu e quanto ainda está comprometido;
- a tela principal parece um planejador mensal, não um extrato bancário;
- categorias explicam o orçamento;
- o app parece confiável, calmo e intencional.

## Resumo operacional para IA de design
- Plataforma: app mobile
- Prioridade: dashboard mensal e planejamento
- Navegação: bottom tabs
- Estilo: editorial prático, claro, humano
- Cor dominante: verde profundo em base quente clara
- Tipografia: `Space Grotesk` + `Manrope`
- Evitar: fintech neon, visual corporativo frio, purple-first UI
