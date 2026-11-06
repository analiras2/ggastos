import { describe, expect, it } from 'vitest';

import { matchesSearch, normalizeSearchText } from '@/shared/lib/search-text';

describe('normalizeSearchText', () => {
  it('lowercases, trims and removes accents', () => {
    expect(normalizeSearchText('  Café São João ')).toBe('cafe sao joao');
  });
});

describe('matchesSearch', () => {
  it('ignores case and accents on both sides', () => {
    expect(matchesSearch('Padaria da Maçã', normalizeSearchText('MACA'))).toBe(true);
  });

  it('never matches an empty query', () => {
    expect(matchesSearch('Mercado', '')).toBe(false);
  });

  it('does not match unrelated text', () => {
    expect(matchesSearch('Mercado', 'farmacia')).toBe(false);
  });
});
