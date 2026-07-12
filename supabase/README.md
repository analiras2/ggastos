# Supabase

Estrutura base do backend do GGastos v2.

## Diretórios

```text
supabase/
  migrations/
  functions/
```

## Convenções

- `migrations/`: recebe migrations SQL versionadas do domínio.
- Nome de migration: `YYYYMMDDHHMMSS_descricao_em_snake_case.sql`.
- Cada migration deve ser coesa, reversível por nova migration e alinhada ao contrato em `docs/data-contract-schema-spec.md`.
- `functions/`: recebe Edge Functions por pasta, uma função por diretório.
- Cada função deve manter o código sensível server-side e nunca expor segredos ao cliente.
- Integrações e utilitários compartilhados entre funções devem ficar em subpastas internas de `functions/`, como `_shared/`, quando surgirem.
- Leituras agregadas preferem SQL em `migrations/`; comandos sensíveis e integrações externas preferem `functions/`.

## Escopo desta fundação

Esta etapa cria apenas a estrutura inicial do projeto Supabase.
Schema, seed, RLS e funções reais entram nas próximas tarefas da milestone.
