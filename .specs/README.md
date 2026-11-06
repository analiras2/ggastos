# Especificações

Specs, designs e tasks por funcionalidade (`features/`) e a visão de projeto (`project/`).
São o histórico de como cada parte foi pensada; o estado atual do código está no
[`../CLAUDE.md`](../CLAUDE.md) e em [`../docs/README.md`](../docs/README.md).

## Leia com estas correções

- **Caminhos `mobile/`:** o app vive na raiz do repositório. `mobile/src` é `src`, `mobile/app.json`
  e o Expo não existem mais. O app é web/PWA com Vite.
- **`foundation-supabase-mobile`:** fundação do projeto, escrita para um app nativo. O Supabase,
  a autenticação e a RLS descritos ali continuam valendo; as partes de Expo/React Native não.
- **`pluggy-sync-reconciliation`:** **descontinuada.** A integração com a Pluggy foi retirada;
  ficou só na branch `pluggy-integration-snapshot`. A conciliação vigente roda sobre faturas CSV,
  ver [`../docs/card-statement-import.md`](../docs/card-statement-import.md).
- **Edge Function `reprocess-financial-data`:** removida (não era usada). A parte do
  `closing-hardening` que a descreve é histórica.
- **Estrutura do front:** a organização atual (`src/features`, `src/shared`, `index.ts` por
  feature) está no `CLAUDE.md`, não nas tasks antigas.
