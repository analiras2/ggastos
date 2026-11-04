# GGastos Mobile

App Expo/React Native do GGastos. O fluxo principal é a importação de faturas
CSV de cartão Nubank e Bradesco, seguida da conciliação com planejamentos já
registrados.

## Pré-requisitos

- Node.js compatível com a SDK Expo 57.
- Dependências instaladas com `npm install`.
- `mobile/.env` configurado com `EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`. O login é manual (e-mail e senha) e a
  sessão fica persistida. Nunca coloque senhas em variáveis `EXPO_PUBLIC_*`: elas
  são embutidas no bundle.

## Execução

```bash
npm start
npm run ios
npm run android
```

Para validar o bundle JavaScript específico de iOS sem iniciar o simulador:

```bash
npx expo export --platform ios --output-dir /private/tmp/ggastos-ios-export
```

## Qualidade

```bash
npm run lint
npx tsc --noEmit
npx expo install --check
npm audit --audit-level=moderate
```

`npm install` também respeita a aprovação versionada do pós-instalação de
`unrs-resolver`, dependência transitiva usada pelo ESLint.

## Deploy do PWA (Vercel)

O build web é estático (`npm run build:web`, saída em `dist/`) e não precisa de
servidor Node: o app fala direto com o Supabase.

1. Importe o repositório na Vercel com **Root Directory** `mobile` (a branch
   `pwa`). O `vercel.json` já define build, saída, fallback de rotas para
   `index.html` e cabeçalhos de cache.
2. Em *Settings → Environment Variables*, defina `EXPO_PUBLIC_SUPABASE_URL` e
   `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (valores do projeto Supabase remoto).
   Elas são lidas no build; o `.env` local não é enviado.
3. No Supabase, desative o cadastro aberto (Auth → signups) e confirme o RLS.
4. No iPhone, abra a URL no Safari e use *Compartilhar → Adicionar à Tela de
   Início*.

Cloudflare Pages também serve: build `npm run build:web`, saída `dist` e uma
regra `/* /index.html 200` em `public/_redirects`.

## Estrutura

- `src/app/`: rotas Expo Router.
- `src/features/`: telas, view models e hooks por domínio.
- `src/components/ggastos/`: design system.
- `src/lib/`: integração Supabase e utilitários compartilhados.

Consulte a [documentação de importação](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/card-statement-import.md)
para o contrato de produto e as limitações atuais.
