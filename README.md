# GGastos

App web (PWA) pessoal de finanças centrado em `planejado vs. realizado`. Importa
faturas de cartão em CSV, concilia as linhas com o planejamento e mantém
dashboard, inbox de revisão e fechamento mensal.

## Estrutura
- [`src/`](src): app React (react-native-web), organizado por feature em `src/features/`.
- [`public/`](public): manifest, service worker e ícones do PWA.
- [`supabase/`](supabase): schema, Edge Functions e testes.
- [`docs/`](docs): documentação de produto, arquitetura e operação.
- [`.specs/`](.specs): especificações e histórico de decisões.

Guia para agentes e convenções do projeto: [`CLAUDE.md`](CLAUDE.md).

## Como rodar localmente

### Pré-requisitos

- Node.js 22 ou superior.
- Docker Desktop em execução (necessário para o Supabase local).
- [Supabase CLI](https://supabase.com/docs/guides/local-development/cli/getting-started) instalada.

### 1. Inicie o backend

Na raiz do repositório:

```bash
supabase start
supabase db reset
```

`supabase db reset` executa todas as migrations e carrega `supabase/seed.sql`.
Para consultar a URL e a chave pública usadas pelo app:

```bash
supabase status
```

Mantenha os serviços do Supabase em execução enquanto usa o app.

### 2. Configure e inicie o app

```bash
cp .env.example .env.local
```

Edite `.env.local` e preencha `VITE_SUPABASE_PUBLISHABLE_KEY` com a chave
**Publishable** exibida por `supabase status`. A URL local padrão já é
`http://127.0.0.1:54321`. O login é por e-mail e senha. Variáveis
`VITE_*` vão para o bundle: nunca coloque senhas nelas.

```bash
npm install
npm run web
```

### Verificações úteis

```bash
npm run typecheck
npm run lint
npm test
npm run test:backend   # Node 22+
npm run build:web
```

## Documentos principais
Índice completo, com o que é vigente e o que é histórico: [`docs/README.md`](docs/README.md).

- [Arquitetura e stack](docs/stack-tecnica-supabase-mvp.md)
- [Importação de fatura CSV](docs/card-statement-import.md)
- [PRD](docs/prd-ggastos-v2.md) e [TDD](docs/tdd-ggastos-v2.md) (baselines de produto)
- [Data Contract / Schema Spec](docs/data-contract-schema-spec.md)
- [Specs e roadmap](.specs/README.md)

## Estratégia ativa

- Importação assistida de faturas CSV de **Nubank** e **Bradesco**.
- Idempotência por fingerprint de origem: reimportar um arquivo não duplica
  transações já persistidas.
- Conciliação 1:1 reaproveitada para que parcelas planejadas não sejam somadas
  duas vezes quando chegam na fatura.
- Lançamentos fora dos cartões suportados continuam no fluxo manual.

A integração Pluggy foi preservada apenas como histórico na branch
`pluggy-integration-snapshot`; não é um destino de deploy nem um fluxo ativo.
