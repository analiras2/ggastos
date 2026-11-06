import { describe, expect, it } from 'vitest';

import { buildMonthKey, monthLabel, parseMonthKey, shiftMonthKey } from '@/shared/lib/month';

describe('shiftMonthKey', () => {
  it('moves forward and backward', () => {
    expect(shiftMonthKey('2026-05', 1)).toBe('2026-06');
    expect(shiftMonthKey('2026-05', -1)).toBe('2026-04');
  });

  it('crosses year boundaries', () => {
    expect(shiftMonthKey('2026-12', 1)).toBe('2027-01');
    expect(shiftMonthKey('2026-01', -1)).toBe('2025-12');
  });

  it('shifts by many months at once', () => {
    expect(shiftMonthKey('2026-11', 14)).toBe('2028-01');
  });
});

describe('monthLabel', () => {
  it('writes the month name in Portuguese', () => {
    expect(monthLabel('2026-03')).toBe('Março 2026');
  });

  it('returns the key unchanged when it is not a month', () => {
    expect(monthLabel('2026-13')).toBe('2026-13');
  });
});

describe('parseMonthKey and buildMonthKey', () => {
  it('are inverses of each other', () => {
    const { year, monthIndex } = parseMonthKey('2026-09');
    expect(buildMonthKey(year, monthIndex)).toBe('2026-09');
  });
});
