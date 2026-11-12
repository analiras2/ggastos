import { describe, expect, it } from 'vitest';

import {
  monthsOfQuarter,
  quarterLabel,
  quarterOfMonth,
  shiftQuarter,
} from '@/features/reports/statistics-period-rules';

describe('statistics period rules', () => {
  it('finds the quarter of a month', () => {
    expect(quarterOfMonth('2026-01')).toEqual({ year: 2026, quarter: 1 });
    expect(quarterOfMonth('2026-11')).toEqual({ year: 2026, quarter: 4 });
  });

  it('lists the three months of a quarter', () => {
    expect(monthsOfQuarter({ year: 2026, quarter: 2 })).toEqual(['2026-04', '2026-05', '2026-06']);
  });

  it('shifts quarters across years in both directions', () => {
    expect(shiftQuarter({ year: 2026, quarter: 4 }, 1)).toEqual({ year: 2027, quarter: 1 });
    expect(shiftQuarter({ year: 2026, quarter: 1 }, -1)).toEqual({ year: 2025, quarter: 4 });
    expect(shiftQuarter({ year: 2026, quarter: 2 }, 5)).toEqual({ year: 2027, quarter: 3 });
  });

  it('labels a quarter', () => {
    expect(quarterLabel({ year: 2026, quarter: 4 })).toBe('4º tri 2026');
  });
});
