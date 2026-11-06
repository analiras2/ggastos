import { describe, expect, it } from 'vitest';

import { decodeBytes, validateStatementFile } from '@/features/statements/statement-file';

const bytesOf = (values: number[]) => new Uint8Array(values).buffer;

describe('decodeBytes', () => {
  it('reads a Nubank export as UTF-8', () => {
    const utf8 = new TextEncoder().encode('Padaria São João').buffer;
    expect(decodeBytes(utf8, 'NUBANK')).toBe('Padaria São João');
  });

  it('reads a Bradesco export as Latin-1', () => {
    // 0xE3 is "ã" in Latin-1 and an invalid UTF-8 sequence on its own.
    expect(decodeBytes(bytesOf([0x53, 0xe3, 0x6f]), 'BRADESCO')).toBe('São');
  });

  it('decodes files larger than one Latin-1 chunk', () => {
    const big = new Uint8Array(20_000).fill(0x61).buffer;
    expect(decodeBytes(big, 'BRADESCO')).toHaveLength(20_000);
  });
});

describe('validateStatementFile', () => {
  const file = (name: string, size: number) => ({
    name,
    bytes: new ArrayBuffer(size),
    fallbackContents: null,
  });

  it('accepts a non-empty CSV, in any letter case', () => {
    expect(validateStatementFile(file('fatura.csv', 10))).toBeNull();
    expect(validateStatementFile(file('FATURA.CSV', 10))).toBeNull();
  });

  it('rejects other extensions', () => {
    expect(validateStatementFile(file('fatura.pdf', 10))).toBe('Selecione um arquivo CSV.');
  });

  it('rejects an empty file', () => {
    expect(validateStatementFile(file('fatura.csv', 0))).toBe('O arquivo CSV está vazio.');
  });
});
