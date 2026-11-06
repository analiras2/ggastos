import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

import { foldText, merchantKey, normalizeMerchantText } from '@/features/statements/merchant-key';
import {
  foldText as sharedFoldText,
  merchantKey as sharedMerchantKey,
  normalizeMerchantText as sharedNormalizeMerchantText,
} from '../../../supabase/functions/_shared/statements/merchant-key';

const APP_PATH = new URL('./merchant-key.ts', import.meta.url);
const SHARED_PATH = new URL('../../../supabase/functions/_shared/statements/merchant-key.ts', import.meta.url);

const KEY_CASES: [string, string | null][] = [
  ['Netflix.com', 'netflix.com'],
  ['  CAFÉ   da  Ana 3/10 ', 'cafe da ana'],
  ['Jim.Com* Enos Massare - Parcela 4/10', 'jim.com* enos massare'],
  ['LOJA XYZ 10/12', 'loja xyz'],
  ['LOJA XYZ10/12', 'loja xyz'],
  ['MP*UBER TRIP', 'uber trip'],
  ['MP *Loja Legal 2/3', 'loja legal'],
  ['IFD*RESTAURANTE X', 'restaurante x'],
  ['PICPAY*Padaria', 'padaria'],
  ['UBER *TRIP', 'uber *trip'],
  ['Compra em 10/12/2025', 'compra em 10/12/2025'],
  ['PIX', null],
  ['  pix  ', null],
  ['Compra', null],
  ['ab', null],
  ['3/10', null],
  ['', null],
];

// The Edge Function (Deno) and the app each carry a copy of this module. Both must behave the same.
describe('merchantKey', () => {
  it.each(KEY_CASES)('%j -> %j in the app and in the shared module', (description, expected) => {
    expect(merchantKey(description)).toBe(expected);
    expect(sharedMerchantKey(description)).toBe(expected);
  });
});

describe('normalizeMerchantText', () => {
  it('keeps generic values so existing rules keep matching', () => {
    expect(normalizeMerchantText('PIX')).toBe('pix');
    expect(normalizeMerchantText('Loja XYZ 3/10')).toBe('loja xyz');
    expect(sharedNormalizeMerchantText('Loja XYZ 3/10')).toBe('loja xyz');
  });
});

describe('foldText', () => {
  it('lowercases, removes accents and collapses spaces without dropping installments', () => {
    expect(foldText('  Café   da Ana 3/10 ')).toBe('cafe da ana 3/10');
    expect(sharedFoldText('  Café   da Ana 3/10 ')).toBe('cafe da ana 3/10');
  });
});

describe('the two copies', () => {
  it('stay identical, byte for byte', () => {
    expect(readFileSync(APP_PATH, 'utf8')).toBe(readFileSync(SHARED_PATH, 'utf8'));
  });
});
