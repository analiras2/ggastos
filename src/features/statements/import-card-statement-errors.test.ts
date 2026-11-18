import { FunctionsFetchError, FunctionsHttpError, FunctionsRelayError } from '@supabase/supabase-js';
import { describe, expect, it } from 'vitest';

import { formatImportError, getHttpErrorMessage } from '@/features/statements/import-card-statement-errors';

const httpErrorWithBody = (body: () => Promise<unknown>) => new FunctionsHttpError({ json: body });

describe('getHttpErrorMessage', () => {
  it('reads the message the Edge Function sent', async () => {
    const error = httpErrorWithBody(async () => ({ message: 'Arquivo vazio.' }));

    await expect(getHttpErrorMessage(error)).resolves.toBe('Arquivo vazio.');
  });

  it('has no message when the body has none, or it is blank or not text', async () => {
    await expect(getHttpErrorMessage(httpErrorWithBody(async () => ({})))).resolves.toBeNull();
    await expect(getHttpErrorMessage(httpErrorWithBody(async () => ({ message: '   ' })))).resolves.toBeNull();
    await expect(getHttpErrorMessage(httpErrorWithBody(async () => ({ message: 42 })))).resolves.toBeNull();
    await expect(getHttpErrorMessage(httpErrorWithBody(async () => null))).resolves.toBeNull();
  });

  it('has no message when the body cannot be read', async () => {
    const error = httpErrorWithBody(async () => {
      throw new Error('not json');
    });

    await expect(getHttpErrorMessage(error)).resolves.toBeNull();
  });

  it('has no message when the context is not a response', async () => {
    await expect(getHttpErrorMessage(new FunctionsHttpError('nope'))).resolves.toBeNull();
  });
});

describe('formatImportError', () => {
  it('words each Edge Function failure differently', () => {
    expect(formatImportError(new FunctionsRelayError({}))).toContain('relay');
    expect(formatImportError(new FunctionsFetchError({}))).toContain('alcançar');
    expect(formatImportError(new FunctionsHttpError({}))).toContain('banco selecionado');
  });

  it('keeps the message of an ordinary error', () => {
    expect(formatImportError(new Error('Arquivo inválido'))).toBe('Arquivo inválido');
  });

  it('has a generic message for anything else', () => {
    expect(formatImportError('boom')).toBe('Não foi possível importar a fatura.');
  });
});
