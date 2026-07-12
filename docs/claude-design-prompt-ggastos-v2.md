# Prompt - Claude Design

Use o documento `docs/layout-guide-ggastos-v2.md` como fonte principal de direção visual e arquitetura de telas.

Quero que você crie o layout de um app mobile chamado **GGastos v2**, em PT-BR, com foco em planejamento financeiro mensal.

## Contexto do produto
O GGastos não é um banco e não é apenas um app de histórico de gastos. O centro da experiência é mostrar com clareza:
- o que foi planejado para o mês;
- o que já aconteceu de fato;
- quanto ainda está comprometido por gastos futuros;
- como cada categoria explica o orçamento do mês.

## Objetivo de design
Crie uma interface mobile que pareça um **planner financeiro editorial, calmo, confiável e prático**.
Evite aparência genérica de fintech, internet banking ou dashboard corporativo frio.

## Direção visual obrigatória
- Estilo: editorial prático, humano, claro, organizado
- Fundo base: quente e claro
- Cor principal: verde profundo
- Tipografia: títulos e métricas com presença forte; corpo limpo e legível
- Sensação geral: controle, previsibilidade, clareza e leve sofisticação
- Navegação: bottom tabs

## O que evitar
- dark mode agressivo
- neon
- excesso de roxo
- visual de banco
- gráficos chamativos demais
- cards demais competindo entre si
- linguagem visual fria ou excessivamente corporativa

## Hierarquia de produto que a UI precisa respeitar
1. O mês é a unidade principal da experiência.
2. Planejamento tem peso visual igual ou maior que transações já ocorridas.
3. `Planejado` e `realizado` nunca podem parecer a mesma coisa.
4. `Comprometido restante` precisa ser um destaque central da tela.
5. Categorias devem explicar o orçamento, não apenas listar itens.

## Telas para criar
Crie um conjunto coeso de telas mobile:

1. **Login / cadastro**
- visual simples e confiável
- sem marketing exagerado
- foco em clareza e entrada rápida

2. **Dashboard mensal**
- header com mês atual
- card hero com `Saldo previsto do mês`
- bloco comparativo `Previsto` x `Atual`
- card de `Comprometido restante`
- ações rápidas
- lista de categorias com `planejado`, `realizado` e `delta`
- opcional: bloco de sync ou pendências

3. **Criar planejamento**
- fluxo claro para criar lançamento planejado
- campos para título, valor, categoria, impacto, competência e tipo
- visual simples, sem parecer formulário burocrático
- mostrar sensação de controle e previsão do mês

4. **Detalhe da categoria**
- resumo da categoria
- separação entre `Planejado` e `Realizado`
- lista de itens da categoria
- boa explicabilidade dos números

5. **Opcional: Revisão / conciliação**
- lista de pendências
- ações rápidas para revisar itens
- linguagem visual clara de status

## Componentes que devem aparecer ou ser sugeridos
- header do mês
- cards de métricas
- chips de status
- lista de categorias clicável
- CTA principal de adicionar planejamento
- banner leve de sync/pêndencia
- estados vazios elegantes e acionáveis

## Tom de interface
Textos curtos, claros e diretos, em PT-BR.
Evite jargão técnico e evite parecer app bancário tradicional.

## Entrega esperada
- um design system visual coerente para todas as telas
- telas que pareçam parte do mesmo produto
- composição mobile realista e pronta para virar implementação
- foco em hierarquia da informação, e não em decoração

## Instrução final
Use o `layout-guide-ggastos-v2.md` como referência principal.
Se precisar escolher entre algo "bonito" e algo "mais claro para entender o mês", escolha a clareza.
