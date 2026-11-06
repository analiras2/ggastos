import { describe, expect, it } from 'vitest';

import {
  pruneSelection,
  selectAllIds,
  selectRangeIds,
  signedAmountCents,
  sumSelectedCents,
  toggleSelection,
} from '@/features/statements/selection-state';

const ORDERED_IDS = ['a', 'b', 'c', 'd', 'e'];
const sorted = (ids: ReadonlySet<string>) => [...ids].sort();

describe('toggleSelection', () => {
  it('adds and removes an id without mutating the input', () => {
    const empty = new Set<string>();
    const withA = toggleSelection(empty, 'a');

    expect([...withA]).toEqual(['a']);
    expect(empty.size).toBe(0);
    expect([...toggleSelection(withA, 'a')]).toEqual([]);
  });
});

describe('selectAllIds', () => {
  it('selects every id once', () => {
    expect(sorted(selectAllIds(['a', 'b', 'a']))).toEqual(['a', 'b']);
  });
});

describe('selectRangeIds', () => {
  it('adds the range between the anchor and the target in either direction', () => {
    expect(sorted(selectRangeIds(new Set(), ORDERED_IDS, 'b', 'd'))).toEqual(['b', 'c', 'd']);
    expect(sorted(selectRangeIds(new Set(), ORDERED_IDS, 'd', 'b'))).toEqual(['b', 'c', 'd']);
    expect(sorted(selectRangeIds(new Set(['a']), ORDERED_IDS, 'c', 'd'))).toEqual(['a', 'c', 'd']);
  });

  it('falls back to a toggle without a usable anchor', () => {
    expect([...selectRangeIds(new Set(), ORDERED_IDS, null, 'c')]).toEqual(['c']);
    expect([...selectRangeIds(new Set(), ORDERED_IDS, 'missing', 'c')]).toEqual(['c']);
    expect([...selectRangeIds(new Set(['c']), ORDERED_IDS, null, 'c')]).toEqual([]);
  });
});

describe('pruneSelection', () => {
  it('drops ids that are no longer pending', () => {
    const selection = new Set(['a', 'b', 'z']);

    expect(sorted(pruneSelection(selection, ['a', 'b', 'c']))).toEqual(['a', 'b']);
    expect(pruneSelection(selection, ['a', 'b', 'z'])).toBe(selection);
  });
});

describe('amounts', () => {
  const items = [
    { id: 'a', amountCents: 1000, direction: 'DEBIT' as const },
    { id: 'b', amountCents: 250, direction: 'CREDIT' as const },
    { id: 'c', amountCents: 500, direction: 'DEBIT' as const },
  ];

  it('counts credits as negative spending', () => {
    expect(signedAmountCents(items[0])).toBe(1000);
    expect(signedAmountCents(items[1])).toBe(-250);
  });

  it('adds only the selected items', () => {
    expect(sumSelectedCents(items, new Set(['a', 'b']))).toBe(750);
    expect(sumSelectedCents(items, new Set())).toBe(0);
  });
});
