# GGastos Mobile

App Expo/React Native do GGastos. O fluxo principal é a importação de faturas
CSV de cartão Nubank e Bradesco, seguida da conciliação com planejamentos já
registrados.

## Pré-requisitos

- Node.js compatível com a SDK Expo 57.
- Dependências instaladas com `npm install`.
- `mobile/.env` configurado com `EXPO_PUBLIC_SUPABASE_URL`,
  `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `EXPO_PUBLIC_OWNER_EMAIL` e
  `EXPO_PUBLIC_OWNER_PASSWORD`. O app é pessoal e usa essas credenciais para
  criar/restaurar a sessão necessária ao Auth/RLS.

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

## Estrutura

- `src/app/`: rotas Expo Router.
- `src/features/`: telas, view models e hooks por domínio.
- `src/components/ggastos/`: design system.
- `src/lib/`: integração Supabase e utilitários compartilhados.

Consulte a [documentação de importação](/Users/analirascalabrini/Projects/ascal/ggastos/ggastos/docs/card-statement-import.md)
para o contrato de produto e as limitações atuais.
