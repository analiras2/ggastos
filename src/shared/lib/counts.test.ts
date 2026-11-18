import { describe, expect, it } from 'vitest';

import { countLabel } from '@/shared/lib/counts';

describe('countLabel', () => {
  it('uses the singular for exactly one', () => {
    expect(countLabel(1, 'lançamento', 'lançamentos')).toBe('1 lançamento');
  });

  it('uses the plural for zero and for several', () => {
    expect(countLabel(0, 'lançamento', 'lançamentos')).toBe('0 lançamentos');
    expect(countLabel(3, 'lançamento', 'lançamentos')).toBe('3 lançamentos');
  });
});
