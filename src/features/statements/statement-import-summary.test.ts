import { describe, expect, it } from 'vitest';

import {
  buildImportSummary,
  buildSuccessMessage,
  isStatementBank,
} from '@/features/statements/statement-import-summary';
import type { ImportCardStatementResult } from '@/features/statements/use-import-card-statement';

const result = (overrides: Partial<ImportCardStatementResult>): ImportCardStatementResult =>
  ({
    bank: 'NUBANK',
    rowsRead: 10,
    rowsImported: 7,
    rowsDuplicated: 2,
    rowsSkipped: 1,
    rowsFailed: 0,
    matchesCreated: 3,
    ...overrides,
  }) as ImportCardStatementResult;

describe('isStatementBank', () => {
  it('accepts the supported banks only', () => {
    expect(isStatementBank('NUBANK')).toBe(true);
    expect(isStatementBank('BRADESCO')).toBe(true);
    expect(isStatementBank('ITAU')).toBe(false);
    expect(isStatementBank('')).toBe(false);
  });
});

describe('buildImportSummary', () => {
  it('has no rows before an import', () => {
    expect(buildImportSummary(null)).toEqual([]);
  });

  it('lists every counter of the import as text', () => {
    expect(buildImportSummary(result({}))).toEqual([
      { label: 'Lidas', value: '10' },
      { label: 'Importadas', value: '7' },
      { label: 'Duplicadas', value: '2' },
      { label: 'Ignoradas', value: '1' },
      { label: 'Falhas', value: '0' },
      { label: 'Matches', value: '3' },
    ]);
  });
});

describe('buildSuccessMessage', () => {
  it('has no message before an import', () => {
    expect(buildSuccessMessage(null)).toBeNull();
  });

  it('names the bank and the new and duplicated rows', () => {
    expect(buildSuccessMessage(result({}))).toBe('Nubank importado. 7 novas linhas e 2 duplicadas.');
    expect(buildSuccessMessage(result({ bank: 'BRADESCO' }))).toContain('Bradesco importado.');
  });
});
