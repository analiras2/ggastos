# Plano: categorização em lote de lançamentos importados

## Status

Em andamento. Branch: `feature/bulk-categorization`.

- Fase 1 concluída: `merchantKey`, matcher e gravação de regras pela chave.
- Fase 2 concluída: migration `20261024120000_bulk_categorization.sql` (função
  `normalize_rule_value`, índice único parcial em regras ativas e RPC
  `categorize_imported_transactions`), aplicada no banco remoto. Testes em
  `supabase/tests/bulk-categorization-suite.mjs` (pilha local).

## Problema

Hoje cada lançamento sem categoria é categorizado individualmente: tocar em
**Categorizar** na aba de pendências, abrir a folha de revisão, escolher a
categoria, decidir sobre a regra e salvar. Uma importação anual (cerca de 240
lançamentos só da Bradesco) transforma isso em centenas de toques repetidos.

Situação real do banco remoto no momento da análise (importação em andamento):

| Medida | Valor |
| --- | --- |
| Lançamentos importados | 71 |
| Sem categoria | 27 (24 descrições distintas) |
| Regras ativas | 32 |
| Categorias de despesa ativas | 10 |
| Maior grupo de pendentes com o mesmo estabelecimento | 3 |

Conclusão: poucos pendentes repetem o mesmo estabelecimento, então **agrupar por
estabelecimento ajuda, mas não resolve**. O ganho principal vem de selecionar
vários lançamentos **de estabelecimentos diferentes** e aplicar uma categoria de
uma só vez, em levas (ex.: "estes 12 são Alimentação", depois "estes 7 são
Transporte").

## Como funciona hoje (pontos relevantes)

- Lista: `reconciliation/pending-screen.tsx` renderiza os pendentes com
  `ScrollView` + `map` (sem virtualização).
- Folha de revisão: `statements/uncategorized-transaction-review-sheet.tsx`
  trabalha com **um** lançamento por vez.
- Gravação: `use-uncategorized-transactions.ts` faz `update` de uma linha e, se
  "usar nas próximas faturas" estiver ligado, um `select` seguido de `insert` ou
  `update` em `user_category_rules`. São de 2 a 3 chamadas por lançamento, sem
  transação.
- Regras (`DESCRIPTION_CONTAINS`) só são aplicadas **no momento da importação**
  (`import-card-statement`, `resolveStatementCategory`). Criar uma regra depois
  não categoriza os pendentes que já existem.
- O valor da regra é a **descrição completa**. Duas das 32 regras atuais
  terminam em sufixo de parcela (`3/10`) e não vão casar com a parcela
  seguinte (`4/10`).
- `user_category_rules` não tem índice único em
  `(user_id, rule_type, lower(btrim(rule_value)))`, então a deduplicação depende
  do `select` prévio do cliente. Hoje não há grupos duplicados (0).

## Objetivo e fora de escopo

**Objetivo:** selecionar vários pendentes e categorizá-los juntos, em levas,
com uma única ação, de forma atômica e rápida, no PWA (toque e mouse) e no app.

**Fora de escopo da primeira versão:** recategorizar lançamentos que já têm
categoria; categorias para receitas e transferências; mudar as regras de
conciliação; reprocessar faturas já importadas.

## Experiência proposta

Na aba de pendências, seção **Categorias**:

1. Botão **Selecionar** no cabeçalho da seção liga o modo de seleção. Não depende
   de pressão longa (que não existe no desktop).
2. Cada linha ganha uma caixa de seleção. Tocar na linha alterna a seleção.
3. Uma barra fixa na parte de baixo mostra "N selecionados · R$ total" com
   **Categorizar** e **Cancelar**. Também oferece **Selecionar todos (N)** e
   **Limpar**.
4. **Categorizar** abre `BulkCategorizeSheet`: resumo (quantidade e total), o
   `CategoryField` já existente (só despesas) e o interruptor "Criar regras para
   as próximas faturas".
5. Ao confirmar, os lançamentos saem da lista, a seleção é limpa e o modo de
   seleção continua ligado para a próxima leva. Aparece o aviso "N lançamentos
   categorizados" com **Desfazer** (fase 6).
6. A folha individual continua existindo para o caso a caso.

Auxílios para montar as levas (fase 5):

- Campo de busca por descrição, com **Selecionar resultados**.
- Ordenar por data, valor ou descrição.
- Chips de agrupamento por estabelecimento ("Netflix · 3"), com "selecionar
  semelhantes".
- Na web, `Shift` + clique para selecionar um intervalo.

## Desenho técnico

### 1. Chave de estabelecimento (puro, com testes)

Novo helper `merchantKey(description)` em `supabase/functions/_shared` e espelho
no app (ou um único módulo importável pelos dois, se o bundler permitir):
minúsculas, sem acentos, sem sufixo de parcela (`\d{1,2}/\d{1,2}$`), espaços
colapsados e prefixos de adquirente comuns removidos (`MP*`, `PAG*`, `IFD*`).
Regras de segurança contra regras amplas demais: tamanho mínimo da chave e
lista de chaves proibidas (`pix`, `compra`, etc.).

Usos: agrupamento na UI, valor das regras novas (corrige o problema das
parcelas) e `resolveStatementCategory` passa a comparar com a chave.

### 2. Banco (migration + RPC)

- Índice único em `user_category_rules (user_id, rule_type, lower(btrim(rule_value)))`.
  Antes de criar, a migration remove duplicatas e normaliza as regras com sufixo
  de parcela existentes.
- Função `public.categorize_imported_transactions(p_transaction_ids uuid[],
  p_category_id uuid, p_rule_values text[] default '{}')`:
  - `security invoker` e `set search_path = ''`, para o RLS continuar valendo;
  - valida que a categoria existe, está ativa e é de despesa;
  - atualiza **só** linhas com `internal_category_id is null` e
    `is_hidden_from_budget = false`, evitando sobrescrever categorias definidas
    em paralelo;
  - faz `insert ... on conflict do update` das regras;
  - retorna `updated_count`, `skipped_count` e `rules_upserted`;
  - roda numa única transação: ou tudo, ou nada.
- Limite de 500 ids por chamada; o cliente divide listas maiores em blocos.

### 3. Dados (React Query)

- `useBulkCategorizeTransactions`: mutation que chama a RPC e invalida
  `uncategorized-transactions`, `month-dashboard` e `annual-summary`, como a
  mutation atual.
- Atualização otimista da lista de pendentes com reversão em caso de erro.

### 4. ViewModels (MVVM)

- `use-selection-view-model.ts`: estado de seleção com `Set<string>`,
  alternar, selecionar todos, limpar, intervalo, total selecionado.
- `use-bulk-categorize-view-model.ts`: categoria escolhida, regras ligadas,
  chamada da mutation, erros e estado de envio.
- `use-pending-view-model.ts` passa a compor os dois e expõe filtros e
  ordenação.

### 5. UI

- `pending-screen.tsx` migra de `ScrollView` + `map` para `FlatList`, com
  `keyExtractor` e `renderItem` estáveis e item memoizado (regra de listas do
  projeto). Linhas de altura fixa para usar `getItemLayout`.
- Novos componentes (cada arquivo abaixo de 150 linhas):
  `selectable-transaction-row.tsx`, `selection-action-bar.tsx`,
  `bulk-categorize-sheet.tsx`, `merchant-group-chips.tsx`.
- Animação de entrada da barra com `react-native-reanimated`.
- Valores como altura da barra, limite de ids e tamanho mínimo da chave ficam
  em constantes nomeadas.
- Acessibilidade: `accessibilityRole="checkbox"` com estado marcado, foco por
  teclado e atalhos na web (`Esc` cancela a seleção).

## Fases (cada uma é um PR pequeno)

| Fase | Entrega | Verificação |
| --- | --- | --- |
| 1 | `merchantKey` e correção do valor das regras (fluxo individual) | Testes unitários em `supabase/tests`; regras novas sem sufixo de parcela |
| 2 | Migration, RPC e índice único | Suíte própria `bulk-categorization-suite.mjs`: um usuário não categoriza linhas de outro; categoria inativa, de receita ou alheia é rejeitada; atomicidade; paridade SQL/TypeScript da normalização |
| 3 | Hook da mutation e ViewModels de seleção | Teste de unidade do estado de seleção; tipagem estrita |
| 4 | Modo de seleção, barra e `BulkCategorizeSheet` na aba de pendências, com `FlatList` | Verificação no navegador e no iPhone; leva de 20+ itens sem travar |
| 5 | Busca, ordenação, chips de grupo e intervalo com `Shift` | Verificação manual com os dados reais |
| 6 | Desfazer e aviso de resultado | Desfazer restaura `internal_category_id = null` e desativa as regras criadas na leva |

A fase 4 já entrega o ganho principal. As fases 5 e 6 são incrementais e podem
ser reordenadas depois do uso real.

## Riscos e decisões em aberto

1. **Regras amplas demais.** `DESCRIPTION_CONTAINS` com chave curta pode
   categorizar errado em faturas futuras. Mitigação: tamanho mínimo, lista
   proibida e prévia da regra na folha.
2. **Regras na leva.** Padrão sugerido: ligadas, uma regra por estabelecimento
   distinto da seleção. Decisão sua: preferem ligadas ou desligadas por padrão?
3. **Corrida entre dispositivos.** Tratada pelo filtro `internal_category_id is
   null` e pelo retorno `skipped_count`, exibido ao usuário.
4. **Regras só valem na importação.** Opcional, depois da fase 4: ao criar uma
   regra, oferecer "aplicar aos N pendentes semelhantes". Não está nas fases
   acima; decidir após o uso.
5. **Escopo da tela.** A folha por lote da tela inicial
   (`dashboard-screen.tsx`) continua individual. Decisão: manter assim ou
   acrescentar o link "Revisar em lote" que leva à aba de pendências?
6. **Sem runner de testes no app.** `mobile/` não tem Jest nem Vitest. A lógica
   testável (chave de estabelecimento e SQL) fica em `supabase/tests`. Testes de
   ViewModel exigiriam adicionar um runner; ficam fora desta proposta.

## Conformidade com as regras do projeto

MVVM com hooks (`.claude/rules/rn-expo.md` §3), React Query para o servidor e
estado local simples para a seleção (§4), `FlatList` com referências estáveis
(§5), resiliência offline com erro tratado e sem rejeições soltas (§6),
Reanimated para animação (§7), TypeScript estrito sem `any` e arquivos abaixo de
150 linhas (§8), nomes em inglês e constantes nomeadas
(`.claude/rules/code-standards.md`). Mudanças nativas não são necessárias.
