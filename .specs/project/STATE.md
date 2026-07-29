# State

**Last Updated:** 2026-07-24T18:55:00Z
**Current Work:** Milestone 4 (Fechamento e endurecimento) concluída — T1-T10 feitas e validadas ponta a ponta. MVP (Milestones 1-4) completo. Próximo passo: definir o que vem depois (Future Considerations do ROADMAP.md) ou endereçar os itens em Deferred Ideas.

---

## Recent Decisions (Last 60 days)

### AD-001: Arquivar o app antigo em `legacy/` (2026-07-10)

**Decision:** O app React Native anterior foi mantido apenas como referência e movido para `legacy/`.
**Reason:** Preservar histórico e conceitos úteis sem contaminar a nova base de implementação.
**Trade-off:** O repositório passa a ter material legado que exige disciplina para não ser reutilizado indevidamente.
**Impact:** O novo desenvolvimento parte de `docs/`, `.specs/` e da nova estrutura que será criada.

### AD-002: Pluggy será usada no modo pessoal/free (2026-07-10)

**Decision:** O MVP assume acesso aos próprios dados financeiros via Pluggy em plano pessoal/free.
**Reason:** Reduzir custo e validar o produto sem depender de um plano comercial.
**Trade-off:** Sem assumir onboarding embutido no app, webhooks comerciais ou enriquecimentos premium.
**Impact:** O sync será por `pull`, manual e/ou agendado.

### AD-003: Backend do MVP será Supabase (2026-07-10)

**Decision:** O backend principal será Supabase com Postgres, Auth, RLS, Edge Functions e Cron.
**Reason:** Melhor encaixe com o domínio relacional e maior velocidade de entrega para MVP.
**Trade-off:** Parte da lógica ficará em SQL e Edge Functions, aumentando acoplamento com a plataforma.
**Impact:** O projeto será estruturado em torno de `mobile/` e `supabase/`.

### AD-004: Integração Pluggy híbrida para descoberta, API direta para produto (2026-07-11)

**Decision:** O MVP pode usar MCP/CLI como apoio de descoberta, mas a implementação de produto deve mirar API direta server-side via Edge Functions.
**Reason:** Permite aprender com payloads reais sem desviar a arquitetura final.
**Trade-off:** Ainda será necessário confirmar detalhes operacionais da API antes do sync real.
**Impact:** A fundação cria `sync-pluggy` stub autenticado e compatível com API direta.

### AD-005: Schema central completo nasce na fundação (2026-07-11)

**Decision:** A primeira migration deve criar todas as tabelas centrais do MVP, mesmo que as telas/funções de negócio sejam implementadas depois.
**Reason:** O custo de alterar modelagem financeira depois é alto.
**Trade-off:** A fundação fica mais trabalhosa.
**Impact:** O schema inclui planejamento, transações importadas, conciliação, regras, snapshots e sync events desde o início.

### AD-006: Modelagem de usuário e categorias (2026-07-11)

**Decision:** Usar `public.profiles` referenciando `auth.users`; categorias são globais com seed inicial e personalização por `user_category_rules`.
**Reason:** Evita confusão com `auth.users` e mantém uma taxonomia consistente para dashboard.
**Trade-off:** CRUD de categorias por usuário fica fora do MVP.
**Impact:** `categories` não terá `user_id`; RLS de categorias será leitura global autenticada.

### AD-007: Regras de domínio fechadas para MVP (2026-07-11)

**Decision:** Transferências internas são neutras por padrão com override; cartão não terá `credit_card_bills`; recorrência usa enum + campos auxiliares; transações importadas aceitam edição só de metadados internos; fechamento mensal é snapshot informativo.
**Reason:** Preserva foco do MVP sem bloquear evolução futura.
**Trade-off:** Fatura de cartão completa, metas por categoria e RRULE ficam fora do MVP.
**Impact:** Schema e tasks devem refletir essas restrições desde a fundação.

### AD-008: Seed global inicial de categorias aprovado (2026-07-11)

**Decision:** O MVP usará um catálogo global inicial com quatro raízes (`income`, `expense`, `investment`, `transfer`) e categorias filhas aprovadas com `impact_type`, cor e hierarquia simples.
**Reason:** Permite iniciar dashboard, planejamento e consolidado com taxonomia consistente desde a fundação.
**Trade-off:** A taxonomia nasce mais opinativa e pode exigir expansão posterior.
**Impact:** A fundação deve criar seed idempotente em `categories` e as milestones seguintes devem reutilizar esse catálogo.

### AD-009: Sync agendado padrão do MVP será a cada 12 horas (2026-07-11)

**Decision:** O sync agendado do MVP real rodará por padrão a cada 12 horas, mantendo também o sync manual.
**Reason:** Equilibra atualidade dos dados, custo operacional e risco de rate limit no contexto pessoal/free.
**Trade-off:** O usuário pode ver dados defasados entre execuções automáticas se não disparar sync manual.
**Impact:** Specs de cron, observabilidade e UX de status de conexão devem assumir essa frequência.

### AD-010: Consolidado anual do MVP será apenas por competência (2026-07-11)

**Decision:** O consolidado anual do MVP usará somente competência; liquidação fica explicitamente como evolução futura.
**Reason:** Remove ambiguidade semântica e mantém a Milestone 4 enxuta.
**Trade-off:** Usuários que desejarem leitura por liquidação terão de esperar uma fase posterior.
**Impact:** O contrato do read model anual e as tasks de fechamento não devem misturar competência e liquidação no MVP.

### AD-011: Specs/tasks das Milestones 2-4 aprovadas com ajustes leves (2026-07-11)

**Decision:** As specs/tasks das Milestones 2-4 foram aprovadas após registrar seed de categorias, cron de 12 horas e consolidado anual por competência.
**Reason:** Não restou bloqueio estrutural de produto ou arquitetura antes da implementação.
**Trade-off:** Ajustes futuros passam a ser refinamentos, não redefinições do escopo base.
**Impact:** O projeto fica pronto para iniciar implementação pela Milestone 1.

### AD-012: Validar fundação inicial primeiro no Supabase local (2026-07-11)

**Decision:** A execução da Milestone 1 passou a validar migrations primeiro no ambiente local do Supabase antes de seguir para seed, RLS e mobile.
**Reason:** Permite verificar schema, enums, FKs e constraints com feedback rápido e sem depender do projeto remoto.
**Trade-off:** Parte do progresso fica inicialmente confirmada só no ambiente local; aplicação remota continua como passo separado.
**Impact:** `T1` e `T2` foram confirmados localmente e o próximo passo segue para `T2.1`.

### AD-013: Seed de categorias executada como arquivo reaplicável (2026-07-11)

**Decision:** Implementar o catálogo global em `supabase/seed.sql`, com `ON CONFLICT (code)` e resolução de `parent_id` por `code`.
**Reason:** Garante reexecução segura em `db reset`, evita dependência de UUID fixo e mantém a hierarquia legível.
**Trade-off:** O seed depende da unicidade de `categories.code` permanecer contrato estável do catálogo.
**Impact:** `T2.1` foi validado localmente com 17 categorias sem duplicidade e `T3` pode seguir sobre esse catálogo.

### AD-014: RLS inicial inclui grants explícitos para `authenticated` (2026-07-11)

**Decision:** A migration de `T3` passou a combinar `ENABLE ROW LEVEL SECURITY`, policies por tabela e `GRANT` explícito por operação ao papel `authenticated`.
**Reason:** Policy sem privilégio SQL não libera acesso no Supabase; o cliente precisa dos dois níveis para operar corretamente.
**Trade-off:** A migration fica mais verbosa e obriga manutenção conjunta de grants e policies.
**Impact:** `categories` ficou como leitura autenticada, `sync_events` como leitura do próprio usuário, e as tabelas com `user_id` passaram a aceitar CRUD isolado por dono.

### AD-015: Shell mobile inicial segue Expo Router em `src/app` (2026-07-12)

**Decision:** O bootstrap do app móvel foi criado com `create-expo-app` oficial, preservando Expo Router em `mobile/src/app` e organizando a lógica de produto em `src/features/` e `src/lib/`.
**Reason:** Mantém o shell alinhado ao template suportado do Expo, reduz atrito de setup e permite evoluir a navegação sem abandonar a separação por feature.
**Trade-off:** O projeto herda alguns arquivos utilitários do template do Expo, mesmo usando apenas uma rota mínima nesta fase.
**Impact:** `T4` e `T5` ficaram com shell compilável, rota raiz única e sessão persistida via Supabase Auth + AsyncStorage.

### AD-016: Design system e dashboard visual foram antecipados no mobile (2026-07-12)

**Decision:** O repositório agora já contém um design system GGastos (`mobile/src/components/ggastos/`, `mobile/src/constants/ggastos-theme.ts`), `AppShell` autenticado e uma tela de dashboard com dados mockados.
**Reason:** Antecipar a linguagem visual reduz retrabalho de UI e acelera a Milestone 2.
**Trade-off:** Parte da implementação visual do núcleo mensal existe antes das integrações reais, então as próximas tasks devem evoluir scaffolds existentes em vez de recriá-los.
**Impact:** As specs de `monthly-core` foram ajustadas para reutilizar esse material em `T7`, `T8` e `T9`.

### AD-017: Integração móvel inicial usa React Query + Edge Function real de sync (2026-07-12)

**Decision:** `T7` conectou o shell autenticado a um `QueryClientProvider`, ao client Supabase configurado no padrão oficial para React Native e à chamada real da Edge Function `sync-pluggy`.
**Reason:** Permite validar o loop auth → app shell → comando sensível sem esperar o read model mensal real da Milestone 2.
**Trade-off:** O dashboard ainda combina UI mockada com uma integração real apenas para sync/status, criando uma fase híbrida temporária.
**Impact:** O app já consegue autenticar, entrar no shell e disparar sync manual; `T8` passa a focar validação ponta a ponta local em vez de wiring básico.

### AD-018: `service_role` precisa de GRANT SQL explícito além do bypass de RLS (2026-07-12)

**Decision:** A migration de `T3` concedia privilégios apenas a `authenticated`; `service_role` ficou sem `SELECT/INSERT/UPDATE/DELETE` em nenhuma tabela, quebrando a Edge Function `sync-pluggy` com `permission denied for table profiles`. Criada a migration `20260712020000_grant_service_role_table_privileges.sql` concedendo os privilégios a `service_role` em todas as tabelas do domínio.
**Reason:** `service_role` no Postgres do Supabase ignora *policies* de RLS, mas continua exigindo GRANT de tabela como qualquer outro role — o mesmo princípio já registrado em AD-014 para `authenticated` também se aplica a `service_role`.
**Trade-off:** Nenhum; é uma correção necessária para o contrato de acesso server-side funcionar.
**Impact:** `T8` validou ponta a ponta (dois usuários isolados, seed de categorias, sync real via UI retornando 202) somente após essa correção. Futuras migrations que criem tabelas RLS devem sempre conceder privilégios a `authenticated` e `service_role` juntos.

### AD-019: Componentes mortos do template Expo removidos por quebrarem o typecheck (2026-07-12)

**Decision:** `mobile/src/components/app-tabs.tsx` e `app-tabs.web.tsx` (scaffolding do `create-expo-app`, não importados por nenhuma rota real) foram removidos após confirmarem quebra de `tsc --noEmit` (referenciavam uma rota `/explore` inexistente). `external-link.tsx`, `animated-icon*`, `hint-row.tsx`, `web-badge.tsx` e `ui/collapsible.tsx` ficaram órfãos como consequência e foram sinalizados para limpeza futura (task em background, não bloqueia Milestone 1).
**Reason:** "App compila/inicia no shell mínimo" é critério de `T8`; um `tsc --noEmit` quebrado por código morto não satisfaz esse critério, mesmo o bundler do Metro não falhando em dev.
**Trade-off:** Nenhum — os arquivos removidos não eram usados em nenhuma tela real (`src/app/index.tsx` + `src/app/_layout.tsx` + `src/features/`).
**Impact:** Segunda rodada de validação de `T8` (re-execução completa: migrations do zero, seed idempotente, isolamento RLS em `planned_entries`/`financial_connections`/`sync_events`, bloqueio de acesso não autenticado, rejeição de escrita cross-user, Edge Function com `manual`/`scheduled`/erros de validação, e fluxo completo via UI no browser) passou 100% após as correções de AD-018 e AD-019.

### AD-020: Dashboard e geração de ocorrências calculados 100% no Postgres (2026-07-13)

**Decision:** `get_month_dashboard(p_month)` e `generate_planned_entries(p_month)` foram implementados como funções `plpgsql` que derivam o usuário via `auth.uid()` (sem receber `user_id` como parâmetro), em vez de expor esse valor ao cliente.
**Reason:** Evita qualquer possibilidade de um cliente passar o `user_id` de outra pessoa; a combinação de `auth.uid()` interno + RLS nas tabelas subjacentes torna as duas funções seguras por padrão, mesmo com `security invoker`.
**Trade-off:** O contrato ficou levemente diferente do desenho original em `design.md` (que sugeria `generate_planned_entries(user_id, month)`), mas é estritamente mais seguro.
**Impact:** `T2`, `T3` e `T6` reusam o mesmo padrão; qualquer nova RPC de escrita/leitura por usuário deve seguir essa convenção.

### AD-021: Categoria inativa bloqueada por trigger, não só por validação client-side (2026-07-13)

**Decision:** Criado trigger `ensure_active_category()` em `planned_entries` e `planning_templates` (migration `20260713003000`) que rejeita INSERT/UPDATE de `category_id` apontando para uma categoria com `is_active = false`.
**Reason:** A validação `T10` ponta a ponta encontrou que o edge case "categoria inativa não pode receber novos lançamentos" (já documentado em `spec.md`) não era enforced em lugar nenhum — nem Zod nem o schema do banco bloqueavam. Como `categoryId` só é validado como UUID no client, a única forma confiável de garantir a regra é no banco.
**Trade-off:** Nenhum — é uma correção de gap, não uma nova capacidade de produto.
**Impact:** Testado com sucesso rejeitando tanto `planned_entries` quanto `planning_templates` apontando para categoria inativa; geração de ocorrências e dashboard continuam funcionando normalmente para categorias ativas.

### AD-022: Desfazer conciliação reaproveita a linha existente com status `UNMATCHED` (2026-07-15)

**Decision:** `T8` (`reconcile-transactions`) implementa `undo` fazendo `UPDATE` do `status` da linha ativa (`AUTO_MATCHED`/`MANUAL_MATCHED`) existente para `UNMATCHED`, em vez de deletar a linha ou criar uma nova.
**Reason:** Os índices únicos de `reconciliation_matches` só bloqueiam duplicidade para status `AUTO_MATCHED`/`MANUAL_MATCHED`; mudar para `UNMATCHED` libera o par para nova sugestão/match sem perder `created_at`, `match_score` e `rationale` originais, satisfazendo "desfazer preserva trilha" da spec sem exigir tabela de histórico separada.
**Trade-off:** `UNMATCHED` nesta tabela passa a significar "já teve match e foi desfeito", distinto de nunca ter existido uma linha — consumidores futuros da tabela devem tratar essa diferença via ausência de linha vs. `status = 'UNMATCHED'`.
**Impact:** `confirm` sempre insere uma nova linha; `reject` atualiza a linha existente do par (qualquer status) para `REJECTED` ou insere uma nova se não houver; `undo` só age sobre linha com status ativo e retorna `409 no_active_match` caso contrário.

### AD-024: App é de uso pessoal — login fica invisível via auto sign-in (2026-07-29)

**Decision:** Mantida a arquitetura de Supabase Auth + RLS (não removida — 39 usos de `auth.uid()` espalhados em RLS policies e funções SQL tornariam essa remoção um refactor grande e arriscado para um ganho pequeno). Em vez disso, `mobile/src/features/auth/auth-provider.tsx` tenta login silencioso com `EXPO_PUBLIC_OWNER_EMAIL`/`EXPO_PUBLIC_OWNER_PASSWORD` assim que o app abre sem sessão — login na primeira vez (`signUp`), depois `signInWithPassword` nas seguintes. `AuthScreen` deixou de aparecer no fluxo normal, mas continua existindo como fallback manual (env vars não configuradas, ou auto-login falha).
**Reason:** Usuário confirmou que o app é para uso pessoal (planilha de gastos, sem multiusuário real) e achou desnecessário digitar email/senha toda vez.
**Trade-off:** A senha do dono fica em texto plano no bundle JS do app (`EXPO_PUBLIC_*`). Aceitável para um app pessoal não distribuído publicamente, mas não deve ser tratado como segredo forte.
**Impact:** `mobile/.env`/`.env.example` ganharam essas duas variáveis. Ver `mobile/src/lib/supabase/client.ts` (`ownerCredentials`) e `auth-provider.tsx` (`attemptOwnerAutoSignIn`).

### AD-025: Conexão bancária real migrou do formulário simples para o Pluggy Connect Widget oficial (2026-07-29)

**Decision:** Superou a decisão provisória do AD anterior (formulário usuário/senha direto na API `/items`) depois que a análise do catálogo real de conectores mostrou que 130 dos 137 bancos pessoais brasileiros (praticamente todos os grandes: Nubank, Itaú, Bradesco, Santander, BB conta corrente, Inter...) exigem Open Finance/OAuth, que só funciona com o widget hospedado (WebView + postMessage), não com um POST direto de credenciais. Migrado para `react-native-pluggy-connect` + `react-native-webview`.
**Reason:** O usuário confirmou que quer conectar um banco grande de verdade, não só o sandbox — o formulário simples nunca teria funcionado para esse caso.
**Trade-off:** Saiu do Expo Go. O projeto agora tem `/ios` e `/android` (gerados via `expo prebuild`) e roda via dev client customizado (`npx expo run:ios`), não mais `expo start` + Expo Go puro. `app.json` ganhou `ios.bundleIdentifier`/`android.package` (`com.ggastos.app`), exigidos pelo prebuild.
**Impact:**
- Backend: nova Edge Function `pluggy-connect-token` (emite Connect Token via `POST /connect_token` da Pluggy, nunca a API key completa) e `connect-pluggy-item` simplificada para um único modo `link` (persiste o item que o próprio widget já criou/atualizou, reaproveitando `buildConnectionUpsert`). `PluggyClient.createItem`/`updateItem` (credenciais diretas) foram removidos por ficarem mortos.
- Mobile: `ConnectAccountSheet` renderiza `<PluggyConnect connectToken updateItem includeSandbox onSuccess onError onClose />` em vez de um formulário; `use-connect-account-view-model.ts` busca o Connect Token via `useQuery` (não `useEffect`) e persiste o item no `onSuccess`.
**Verified:** testado ponta a ponta no simulador com o widget real — busca de instituição (incluindo bancos reais como Inter, Caixa), fluxo "criar" completo com o conector sandbox, e fluxo "reconectar" confirmado entrando em modo update (`updateItem` correto, botão muda para "Atualizar").

### AD-023: Sync agendado autentica `sync-pluggy` com a própria `service_role` key (2026-07-15)

**Decision:** `T11` adicionou um segundo caminho de execução à Edge Function `sync-pluggy`: quando o `Authorization: Bearer` recebido é exatamente igual à `SUPABASE_SERVICE_ROLE_KEY` do runtime, a função entra em modo interno/agendado (exige `mode: "scheduled"` no corpo, senão retorna `400`), ignora `readAuthenticatedUser`, varre `financial_connections` de todos os usuários com `pluggy_item_id` preenchido e `status` fora de `LOGIN_ERROR`/`WAITING_USER_INPUT`/`DELETED`, e grava um único `sync_events` por execução com `user_id`/`connection_id` nulos. A migration `20260715220000_schedule_sync_pluggy_cron.sql` habilita `pg_cron` (já vinha em `shared_preload_libraries` da imagem local) e agenda `net.http_post` a cada 12h usando `current_setting('app.settings.supabase_url'|'service_role_key', true)`.
**Reason:** Quem detém a `service_role` key já tem acesso irrestrito ao banco, então reconhecê-la como chamador "interno" no corpo da função não amplia superfície de ataque nenhuma, e evita inventar um segundo segredo/gateway só para o cron. A policy `sync_events_owner_read` (`user_id = auth.uid()`) já torna `user_id null` automaticamente invisível a qualquer cliente autenticado — sem precisar de policy nova.
**Trade-off:** `current_setting('app.settings.supabase_url'|'service_role_key')` só vem pré-populado em projetos hospedados no Supabase Cloud; localmente é preciso rodar manualmente `alter database postgres set app.settings.... to '...'` (não versionado) para o cron realmente disparar — sem isso o job roda no schedule mas falha ao montar a URL. A verificação de `T11` foi feita disparando `net.http_post`/a Edge Function manualmente com a `service_role` key, replicando exatamente o que o cron enviaria.
**Impact:** Qualquer nova Edge Function que precise rodar em contexto de sistema (sem usuário) deve seguir o mesmo padrão: checar `accessToken === serviceRoleKey`, exigir um sinalizador explícito no corpo (`mode`/similar) para evitar chamadas acidentais, e gravar auditoria com `user_id: null` para herdar a mesma invisibilidade via RLS.

---

## Active Blockers

None.

---

## Lessons Learned

### L-004: `expo-modules-jsi` não compila em Xcode 26 / Swift 6.2 sem patch — precisa de `patch-package` (2026-07-29)

**Context:** Primeiro build nativo real do projeto (`expo prebuild` + `npx expo run:ios`), feito para adotar `react-native-webview`/`react-native-pluggy-connect` (AD-025). Até então o app só rodava via Expo Go, que não compila módulos nativos localmente.
**Problem:** `expo-modules-jsi@57.0.4` (dependência interna do Expo SDK 57, não algo que o projeto instala diretamente) declara `weak let` em várias structs `~Copyable` — inválido em qualquer Swift, mas só é pego pelo compilador do Xcode 26.0.1/Swift 6.2 instalado nesta máquina. Depois de trocar para `weak var`, um segundo erro aparece: Swift 6.2 rejeita propriedade `weak var` mutável em classe `Sendable` sem `nonisolated(unsafe)`. Um terceiro bug separado (`abs(milliseconds)` ambíguo em `JavaScriptCodable+Date.swift`, provavelmente por overload de `abs` vindo do lado C++/JSI) também só aparece nesse toolchain.
**Solution:** Editados os 14 arquivos afetados em `node_modules/expo-modules-jsi` (`weak let`→`weak var`, `nonisolated(unsafe) weak var` nas 5 classes `Sendable`, `abs(milliseconds)`→`milliseconds.magnitude`), depois congelado com `patch-package` (`npx patch-package expo-modules-jsi`, patch salvo em `mobile/patches/`, `postinstall: patch-package` no `package.json`) para sobreviver a um `npm install` limpo.
**Prevents:** Se um `npm install` limpo voltar a quebrar o build iOS com erros de `weak let`/`Sendable` em `expo-modules-jsi`, não é regressão do projeto — é essa mesma incompatibilidade Xcode 26/Swift 6.2 reaparecendo (ex.: alguém rodou `rm -rf node_modules` sem o patch, ou o patch não bateu numa versão nova do pacote). Primeiro confirmar se `patches/expo-modules-jsi+*.patch` está presente e se `postinstall` rodou; se o Expo já tiver corrigido isso upstream (acompanhar `expo/expo#46242`), o patch pode ser removido.

### L-003: `category` da Pluggy é sempre em inglês e nunca bate com o catálogo em português — o componente de categoria do score fica preso em zero (2026-07-16)

**Context:** Validação `T12` com um item real do conector sandbox "Pluggy Bank" (id 2, `user-ok`/`password-ok`). Toda transação retornada trazia `category` preenchido em inglês (`"Salary"`, `"Housing"`, `"Electricity"`, etc.), nunca `null`.
**Problem:** `scoreMatch` em `score.ts` só exclui o componente de categoria (peso 0.15) do cálculo quando `pluggy_category_name` é `null`; quando presente, ele SEMPRE entra na média ponderada, mas como as categorias do catálogo são nomeadas em português (`Moradia`, `Salário`, `Contas e serviços`...), a similaridade Jaccard com o texto em inglês da Pluggy é matematicamente sempre `0`. Isso cria um teto de score de `0.85` para qualquer transação categorizada pela Pluggy, mesmo com valor, data, conta e descrição perfeitos — abaixo do `AUTO_MATCH_THRESHOLD` (0.9). Ou seja, **com dados reais da Pluggy, o auto-match praticamente nunca dispara**, mesmo em pares que deveriam ser óbvios; tudo cai pelo menos para revisão manual na inbox.
**Solution (validação, não corrigido nesta task):** Confirmado auto-match funcionando corretamente quando a categoria está ausente (`pluggy_category_name: null`, via fixture controlada) — score chegou a `0.9706` e criou `AUTO_MATCHED`. Isso prova que o motor de score e o auto-match em si estão corretos; o gap é especificamente a comparação textual EN↔PT do componente de categoria.
**Prevents:** Não tentar "consertar" chamando isso de bug do auto-match — o código está correto, o problema é a ausência de um mapeamento Pluggy-categoria → categoria interna antes de alimentar o score. Ver Deferred Ideas para a solução recomendada.

### L-002: UUIDs sintéticos de teste precisam respeitar o nibble de variante RFC4122 (2026-07-15)

**Context:** Validação manual de `T10` (tela de inbox) com fixtures SQL usando IDs previsíveis como `77777777-7777-7777-7777-777777777777`.
**Problem:** O Zod `.uuid()` usado em `reconciliation-schema.ts` valida o formato RFC4122 completo, incluindo o nibble de variante (`[89abAB]` no 17º caractere). IDs sintéticos "todos iguais" falham nessa validação, e como a falha ocorre dentro do `queryFn` do React Query, o retry entra em `fetchStatus: 'paused'` sem nunca expor `isError`, criando um estado que parece silenciosamente "vazio" na tela em vez de um erro visível.
**Solution:** Gerar fixtures de teste com `uuid.uuid4()` real (Python) ou `gen_random_uuid()` do Postgres, nunca IDs decorativos como `aaaa...`/`1111...`.
**Prevents:** Perda de tempo depurando "bug" de UI que na verdade é fixture malformada; também expõe que erros de parse dentro de `queryFn` ficam mascarados como carregamento infinito em vez de erro — vale considerar futuramente reduzir `retry` ou tratar `fetchStatus: 'paused'` explicitamente na UI se isso se repetir com dados reais.

### L-001: O principal ativo do legado é o modelo mental, não o código (2026-07-10)

**Context:** Revisão da planilha de 2021 e do app React Native antigo.
**Problem:** O código antigo não suporta sync real, auth nem conciliação distribuída.
**Solution:** Preservar a lógica de `previsto vs. realizado` na documentação e arquivar o app em `legacy/`.
**Prevents:** Reaproveitamento indevido de storage local, modelagem de parcelas frágil e acoplamentos antigos.

---

## Quick Tasks Completed

| #   | Description                                         | Date       | Commit | Status  |
| --- | --------------------------------------------------- | ---------- | ------ | ------- |
| 001 | Criar docs de produto, TDD, schema e stack técnica  | 2026-07-10 | -      | ✅ Done |
| 002 | Arquivar o projeto legado em `legacy/`              | 2026-07-10 | -      | ✅ Done |
| 003 | Criar estrutura inicial `.specs/` a partir de docs  | 2026-07-10 | -      | ✅ Done |
| 004 | Fechar lacunas de produto e arquitetura             | 2026-07-11 | -      | ✅ Done |
| 005 | Criar specs/tasks das Milestones 2-4                | 2026-07-11 | -      | ✅ Done |
| 006 | Fechar seed, cron, anual e aprovação final das specs | 2026-07-11 | -      | ✅ Done |
| 007 | Criar estrutura base do Supabase (`T1`)             | 2026-07-11 | -      | ✅ Done |
| 008 | Criar migration inicial do domínio MVP (`T2`)       | 2026-07-11 | -      | ✅ Done |
| 009 | Validar `T2` no Supabase local                      | 2026-07-11 | -      | ✅ Done |
| 010 | Criar seed global de categorias (`T2.1`)            | 2026-07-11 | -      | ✅ Done |
| 011 | Habilitar RLS e policies mínimas (`T3`)             | 2026-07-11 | -      | ✅ Done |
| 012 | Criar shell mobile Expo (`T4`)                      | 2026-07-12 | -      | ✅ Done |
| 013 | Implementar autenticação base (`T5`)                | 2026-07-12 | -      | ✅ Done |
| 014 | Criar stub inicial de `sync-pluggy` (`T6`)          | 2026-07-12 | -      | ✅ Done |
| 015 | Integrar mobile com Supabase (`T7`)                 | 2026-07-12 | -      | ✅ Done |
| 016 | Validar fundação ponta a ponta (`T8`)               | 2026-07-12 | -      | ✅ Done |
| 017 | Implementar schemas Zod do núcleo mensal (`T1`)     | 2026-07-13 | -      | ✅ Done |
| 018 | Criar `get_month_dashboard` (`T2`)                  | 2026-07-13 | -      | ✅ Done |
| 019 | Criar constraints de idempotência (`T3`)            | 2026-07-13 | -      | ✅ Done |
| 020 | Implementar serviço de planejamentos avulsos (`T4`) | 2026-07-13 | -      | ✅ Done |
| 021 | Implementar templates recorrentes/parcelados (`T5`) | 2026-07-13 | -      | ✅ Done |
| 022 | Criar `generate_planned_entries` (`T6`)             | 2026-07-13 | -      | ✅ Done |
| 023 | Criar hook de dashboard real (`T7`)                 | 2026-07-13 | -      | ✅ Done |
| 024 | Conectar dashboard aos dados reais (`T8`)           | 2026-07-13 | -      | ✅ Done |
| 025 | Criar detalhe de categoria mensal (`T9`)            | 2026-07-13 | -      | ✅ Done |
| 026 | Validar núcleo mensal ponta a ponta (`T10`)         | 2026-07-13 | -      | ✅ Done |
| 027 | Criar Edge Function de decisões de conciliação (`T8`) | 2026-07-15 | -      | ✅ Done |
| 028 | Implementar hooks mobile de inbox (`T9`)            | 2026-07-15 | -      | ✅ Done |
| 029 | Criar tela de inbox de conciliação (`T10`)          | 2026-07-15 | -      | ✅ Done |
| 030 | Configurar sync agendado via pg_cron (`T11`)        | 2026-07-15 | -      | ✅ Done |
| 031 | Validar sync e conciliação ponta a ponta (`T12`)    | 2026-07-16 | -      | ✅ Done |
| 032 | Criar função de snapshot mensal (`T1`)              | 2026-07-24 | -      | ✅ Done |
| 033 | Criar RPC de consolidado anual (`T2`)               | 2026-07-24 | -      | ✅ Done |
| 034 | Criar hook mobile de fechamento mensal (`T3`)       | 2026-07-24 | -      | ✅ Done |
| 035 | Padronizar observabilidade de sync/conciliação (`T5`) | 2026-07-24 | -    | ✅ Done |
| 036 | Criar suíte de segurança RLS (`T6`)                 | 2026-07-24 | -      | ✅ Done |
| 037 | Criar função de reprocessamento (`T4`)              | 2026-07-24 | -      | ✅ Done |
| 038 | Criar tela de consolidado anual (`T7`)              | 2026-07-24 | -      | ✅ Done |
| 039 | Criar status mínimo de sync em Ajustes (`T8`)       | 2026-07-24 | -      | ✅ Done |
| 040 | Criar checklist de hardening do MVP (`T9`)          | 2026-07-24 | -      | ✅ Done |
| 041 | Validar MVP ponta a ponta (`T10`)                   | 2026-07-24 | -      | ✅ Done |

---

## Deferred Ideas

- [ ] `@react-native-community/datetimepicker` (usado em `mobile/src/features/planning/date-field.tsx`) não renderiza nada no `Platform.OS === 'web'` — o campo "Data" do formulário "Adicionar planejamento" fica impossível de preencher via UI no build web (funciona normalmente em iOS/Android). Precisa de um fallback web (ex.: `<input type="date">` condicional por plataforma) — Captured during: validação `T10`
- [x] ~~`useCloseMonth` nunca foi conectado a nenhum botão/tela~~ — Resolvido em 2026-07-28: botão "Fechar mês" adicionado ao `QuickActionRow` do dashboard (`dashboard-screen.tsx`), com banner de loading/erro/sucesso reaproveitando `SyncStatusBanner`. Verificado ao vivo via browser real (signup → clique → `200` → snapshot persistido no banco).
- [ ] Mapear `pluggy_category_name` (inglês) para as categorias internas (português) antes do score de conciliação, ou remover/reponderar o componente de categoria — sem isso, `AUTO_MATCH_THRESHOLD` (0.9) é praticamente inatingível para transações reais da Pluggy (teto de 0.85 comprovado em `T12`, ver L-003) — Captured during: validação `T12`
- [ ] `internal_category_id` de `imported_transactions` nunca é preenchido automaticamente a partir do `pluggy_category_name`/`user_category_rules`, então o breakdown por categoria do dashboard mensal mostra `actualCents: 0` mesmo com transações reais sincronizadas (os totais gerais do resumo continuam corretos) — Captured during: validação `T12`
- [ ] Usar sinais de saúde financeira da Pluggy como enriquecimento opcional — Captured during: definição do PRD
- [ ] Considerar entidade explícita de fatura de cartão em fase 2 — Captured during: TDD
- [ ] Considerar RRULE para recorrências avançadas em fase posterior — Captured during: revisão de lacunas
- [ ] Considerar orçamento-meta por categoria pós-MVP — Captured during: revisão de lacunas
- [ ] Adicionar anexos e comprovantes com Supabase Storage — Captured during: roadmap
- [ ] Avaliar migração para plano comercial da Pluggy se o onboarding no app virar requisito — Captured during: estratégia de integração
- [x] ~~Substituir o formulário simples de conexão Pluggy pelo Pluggy Connect Widget oficial~~ — Resolvido em 2026-07-29 (AD-025): app migrou para `react-native-pluggy-connect` + dev client customizado, suporta busca de instituição e Open Finance/OAuth. Ver AD-025 e L-004.

---

## Todos

## Preferences

**Model Guidance Shown:** never
