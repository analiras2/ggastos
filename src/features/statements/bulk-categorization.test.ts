import { describe, expect, it } from 'vitest';

import {
  BulkCategorizationError,
  MAX_TRANSACTION_IDS_PER_CALL,
  chunkTransactionIds,
  collectRuleValues,
  describeBulkCategorizeError,
  runBulkCategorization,
} from '@/features/statements/bulk-categorization';

type CallArgs = { transactionIds: string[]; categoryId: string; ruleValues: string[] };

const idsOf = (count: number) => Array.from({ length: count }, (_, index) => `id-${index}`);

function fakeCall(behaviour: (callNumber: number) => void = () => undefined) {
  const calls: CallArgs[] = [];
  const call = async (args: CallArgs) => {
    calls.push(args);
    behaviour(calls.length);
    return { updatedCount: args.transactionIds.length, skippedCount: 0, rulesUpserted: args.ruleValues.length };
  };
  return { call, calls };
}

describe('chunkTransactionIds', () => {
  it('splits at the RPC limit', () => {
    const chunks = chunkTransactionIds(idsOf(1201));

    expect(chunks.map((chunk) => chunk.length)).toEqual([
      MAX_TRANSACTION_IDS_PER_CALL,
      MAX_TRANSACTION_IDS_PER_CALL,
      201,
    ]);
    expect(chunkTransactionIds([])).toEqual([]);
    expect(MAX_TRANSACTION_IDS_PER_CALL).toBe(500);
  });
});

describe('collectRuleValues', () => {
  it('returns unique non-null keys in first-seen order', () => {
    const toKey = (description: string) =>
      description.length < 3 ? null : description.toLowerCase().replace(/ \d+\/\d+$/, '');

    expect(collectRuleValues(['Loja A 1/3', 'LOJA A 2/3', 'ab', 'Padaria'], toKey)).toEqual(['loja a', 'padaria']);
  });
});

describe('runBulkCategorization', () => {
  it('sends the rules only with the first chunk and sums the results', async () => {
    const { call, calls } = fakeCall();

    const result = await runBulkCategorization(call, {
      transactionIds: idsOf(1100),
      categoryId: 'cat',
      ruleValues: ['loja a'],
    });

    expect(result).toEqual({ updatedCount: 1100, skippedCount: 0, rulesUpserted: 1 });
    expect(calls.map((args) => args.ruleValues)).toEqual([['loja a'], [], []]);
    expect(calls.every((args) => args.categoryId === 'cat')).toBe(true);
  });

  it('removes repeated ids and skips the call when there is nothing to do', async () => {
    const { call, calls } = fakeCall();

    const empty = await runBulkCategorization(call, { transactionIds: [], categoryId: 'cat', ruleValues: [] });
    expect(empty).toEqual({ updatedCount: 0, skippedCount: 0, rulesUpserted: 0 });
    expect(calls).toHaveLength(0);

    await runBulkCategorization(call, { transactionIds: ['a', 'a', 'b'], categoryId: 'cat', ruleValues: [] });
    expect(calls[0].transactionIds).toEqual(['a', 'b']);
  });

  it('reports what was already saved when a later chunk fails', async () => {
    const { call } = fakeCall((callNumber) => {
      if (callNumber === 2) {
        throw new Error('network down');
      }
    });

    const failure = await runBulkCategorization(call, {
      transactionIds: idsOf(1100),
      categoryId: 'cat',
      ruleValues: [],
    }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(BulkCategorizationError);
    const error = failure as BulkCategorizationError;
    expect(error.partialResult.updatedCount).toBe(MAX_TRANSACTION_IDS_PER_CALL);
    expect(error.message).toMatch(/network down/);
  });

  it('reports zero saved rows when the first chunk fails', async () => {
    const { call } = fakeCall(() => {
      throw new Error('rejected');
    });

    const failure = await runBulkCategorization(call, {
      transactionIds: ['a'],
      categoryId: 'cat',
      ruleValues: [],
    }).catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(BulkCategorizationError);
    expect((failure as BulkCategorizationError).partialResult.updatedCount).toBe(0);
  });
});

describe('describeBulkCategorizeError', () => {
  const emptyPartial = { updatedCount: 0, skippedCount: 0, rulesUpserted: 0 };

  it('explains network failures in Portuguese', () => {
    for (const message of ['Failed to fetch', 'Network request failed', 'Load failed']) {
      expect(describeBulkCategorizeError(new Error(message))).toMatch(/Sem conexão/);
    }
  });

  it('explains an expired session and an invalid category', () => {
    expect(describeBulkCategorizeError({ message: 'Authentication required.' })).toMatch(/sessão/);
    expect(
      describeBulkCategorizeError({ message: 'The category must be an active expense category available to you.' })
    ).toMatch(/categoria de despesa/);
  });

  it('unwraps the cause of a BulkCategorizationError', () => {
    const error = new BulkCategorizationError('wrapped', emptyPartial, new Error('Failed to fetch'));

    expect(describeBulkCategorizeError(error)).toMatch(/Sem conexão/);
  });

  it('tells how many rows were saved before a partial failure', () => {
    const partial = { updatedCount: 500, skippedCount: 0, rulesUpserted: 1 };
    const message = describeBulkCategorizeError(
      new BulkCategorizationError('boom', partial, new Error('Failed to fetch'))
    );

    expect(message).toMatch(/500 lançamentos foram salvos/);
    expect(message).toMatch(/Sem conexão/);
  });

  it('falls back to a generic message', () => {
    expect(describeBulkCategorizeError(undefined)).toBe('Não foi possível categorizar os lançamentos.');
    expect(describeBulkCategorizeError(new Error('weird'))).toBe('Não foi possível categorizar os lançamentos.');
  });
});
