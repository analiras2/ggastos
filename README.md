# GGastos

App mobile pessoal de finanças centrado em `planejado vs. realizado`. A rota ativa
do produto importa faturas de cartão em CSV, concilia as linhas com o
planejamento e mantém dashboard, inbox de revisão e fechamento mensal.

## Estrutura
- [`mobile/`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/mobile): app Expo/React Native.
- [`supabase/`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/supabase): schema, Edge Functions e testes de RLS.
- [`docs/`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs): documentação ativa de produto, arquitetura e operação.
- [`.specs/`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/.specs): especificações e histórico de decisões.

## Como rodar localmente

### Pré-requisitos

- Node.js compatível com o Expo SDK 57.
- Docker Desktop em execução (necessário para o Supabase local).
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) instalada.
- Para executar no iOS, Xcode e um simulador configurados; para Android, Android Studio e um emulador configurados.

### 1. Inicie o backend

Em um terminal, na raiz do repositório, inicie os serviços locais e aplique o
schema com os dados de seed:

```bash
cd supabase
supabase start
supabase db reset
```

O comando `supabase db reset` executa todas as migrations e carrega
`supabase/seed.sql`. Para consultar a URL e a chave pública usadas pelo app,
execute:

```bash
supabase status
```

Mantenha os serviços do Supabase em execução enquanto utiliza o aplicativo.

### 2. Configure e inicie o app mobile

Em outro terminal, crie o arquivo de ambiente a partir do exemplo:

```bash
cp mobile/.env.example mobile/.env
```

Edite `mobile/.env` e preencha `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` com a
chave **Publishable** exibida por `supabase status`. A URL local padrão já é
`http://127.0.0.1:54321`. O app exibe uma tela de login (e-mail e senha) e
mantém a sessão persistida. Não coloque senhas em variáveis `EXPO_PUBLIC_*`.

Instale as dependências e escolha uma plataforma:

```bash
cd mobile
npm install
npm start
```

Com o servidor Expo ativo, use o menu interativo para abrir o simulador ou
emulador. Você também pode iniciar diretamente:

```bash
npm run ios
npm run android
npm run web
```

### Verificações úteis

```bash
cd mobile
npm run lint
npx tsc --noEmit
npx expo install --check
```

## Documentos principais
- [PRD](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/prd-ggastos-v2.md)
- [TDD](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/tdd-ggastos-v2.md)
- [Data Contract / Schema Spec](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/data-contract-schema-spec.md)
- [Stack Técnica Supabase MVP](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/stack-tecnica-supabase-mvp.md)
- [Importação de fatura CSV](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/card-statement-import.md)
- [Roadmap](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/.specs/project/ROADMAP.md)

## Estratégia ativa

- Importação assistida de faturas CSV de **Nubank** e **Bradesco**.
- Idempotência por fingerprint de origem: reimportar um arquivo não duplica
  transações já persistidas.
- Conciliação 1:1 reaproveitada para que parcelas planejadas não sejam somadas
  duas vezes quando chegam na fatura.
- Lançamentos fora dos cartões suportados continuam no fluxo manual.

A integração Pluggy foi preservada apenas como histórico na branch
`pluggy-integration-snapshot`; não é um destino de deploy nem um fluxo ativo.

## Diretriz
O desenvolvimento novo deve partir de `docs/` e da spec
[`card-statement-import`](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/.specs/features/card-statement-import/spec.md).
As seções de Pluggy nos documentos históricos existem apenas para consulta.
