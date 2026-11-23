import { describe, expect, it } from 'vitest';

import { decodeCsvBytes, validateStatementFile } from '@/features/statements/statement-file';

const bytesOf = (values: number[]) => new Uint8Array(values).buffer;

describe('decodeCsvBytes', () => {
  it('reads UTF-8, as Nubank writes it', () => {
    const utf8 = new TextEncoder().encode('Padaria São João').buffer;
    expect(decodeCsvBytes(utf8)).toBe('Padaria São João');
  });

  it('falls back to Latin-1, as Bradesco writes it', () => {
    // 0xE3 is "ã" in Latin-1 and an invalid UTF-8 sequence on its own.
    expect(decodeCsvBytes(bytesOf([0x53, 0xe3, 0x6f]))).toBe('São');
  });

  it('decodes files larger than one Latin-1 chunk', () => {
    const big = new Uint8Array(20_000).fill(0xe3).buffer;
    expect(decodeCsvBytes(big)).toHaveLength(20_000);
  });
});

describe('validateStatementFile', () => {
  const file = (name: string, size: number) => ({
    name,
    bytes: new ArrayBuffer(size),
  });

  it('accepts a non-empty CSV or PDF, in any letter case', () => {
    expect(validateStatementFile(file('fatura.csv', 10))).toBeNull();
    expect(validateStatementFile(file('FATURA.CSV', 10))).toBeNull();
    expect(validateStatementFile(file('fatura.pdf', 10))).toBeNull();
  });

  it('rejects other extensions', () => {
    expect(validateStatementFile(file('fatura.xlsx', 10))).toBe('Selecione um arquivo CSV ou PDF.');
  });

  it('rejects an empty file', () => {
    expect(validateStatementFile(file('fatura.csv', 0))).toBe('O arquivo está vazio.');
  });
});
