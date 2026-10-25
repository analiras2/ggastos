// Pure orchestration of a bulk categorization. The Supabase call is injected, so the chunking and
// error handling can be tested in Node (supabase/tests/bulk-selection.test.mjs).

// Must match c_max_transaction_ids in the categorize_imported_transactions RPC.
export const MAX_TRANSACTION_IDS_PER_CALL = 500;

export type BulkCategorizeResult = {
  updatedCount: number;
  skippedCount: number;
  rulesUpserted: number;
};

export type BulkCategorizeArgs = {
  transactionIds: string[];
  categoryId: string;
  ruleValues: string[];
};

export type BulkCategorizeCall = (args: BulkCategorizeArgs) => Promise<BulkCategorizeResult>;

export const EMPTY_BULK_RESULT: BulkCategorizeResult = { updatedCount: 0, skippedCount: 0, rulesUpserted: 0 };

// Each chunk is atomic, but chunks are separate calls: when a later one fails, the earlier ones
// stay saved. `partialResult` tells the caller how much was applied.
export class BulkCategorizationError extends Error {
  readonly partialResult: BulkCategorizeResult;

  constructor(message: string, partialResult: BulkCategorizeResult, cause?: unknown) {
    super(message);
    this.name = 'BulkCategorizationError';
    this.partialResult = partialResult;
    this.cause = cause;
  }
}

export function chunkTransactionIds(ids: readonly string[], size = MAX_TRANSACTION_IDS_PER_CALL): string[][] {
  const chunks: string[][] = [];
  for (let start = 0; start < ids.length; start += size) {
    chunks.push(ids.slice(start, start + size));
  }
  return chunks;
}

export function collectRuleValues(
  descriptions: readonly string[],
  toKey: (description: string) => string | null
): string[] {
  const keys = new Set<string>();
  for (const description of descriptions) {
    const key = toKey(description);
    if (key !== null) {
      keys.add(key);
    }
  }
  return [...keys];
}

function addResults(left: BulkCategorizeResult, right: BulkCategorizeResult): BulkCategorizeResult {
  return {
    updatedCount: left.updatedCount + right.updatedCount,
    skippedCount: left.skippedCount + right.skippedCount,
    rulesUpserted: left.rulesUpserted + right.rulesUpserted,
  };
}

export async function runBulkCategorization(
  call: BulkCategorizeCall,
  input: BulkCategorizeArgs
): Promise<BulkCategorizeResult> {
  const chunks = chunkTransactionIds([...new Set(input.transactionIds)]);
  let total = EMPTY_BULK_RESULT;

  for (const [index, transactionIds] of chunks.entries()) {
    try {
      // Rules are idempotent, so they travel with the first chunk only.
      const ruleValues = index === 0 ? input.ruleValues : [];
      total = addResults(total, await call({ transactionIds, categoryId: input.categoryId, ruleValues }));
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error.';
      throw new BulkCategorizationError(message, total, error);
    }
  }

  return total;
}

const NETWORK_ERROR_PATTERN = /failed to fetch|network request failed|fetch failed|networkerror|load failed/i;
const GENERIC_ERROR_MESSAGE = 'Não foi possível categorizar os lançamentos.';

function readMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  if (typeof error === 'object' && error !== null && 'message' in error) {
    return String(error.message);
  }
  return '';
}

function describeCause(error: unknown): string {
  const message = readMessage(error);
  if (NETWORK_ERROR_PATTERN.test(message)) {
    return 'Sem conexão. Verifique a internet e tente novamente.';
  }
  if (message.includes('Authentication required')) {
    return 'Sua sessão expirou. Entre novamente.';
  }
  if (message.includes('category must be')) {
    return 'Escolha uma categoria de despesa ativa.';
  }
  return GENERIC_ERROR_MESSAGE;
}

export function describeBulkCategorizeError(error: unknown): string {
  if (!(error instanceof BulkCategorizationError)) {
    return describeCause(error);
  }

  const description = describeCause(error.cause ?? error);
  const savedCount = error.partialResult.updatedCount;
  return savedCount > 0 ? `${savedCount} lançamentos foram salvos antes do erro. ${description}` : description;
}
