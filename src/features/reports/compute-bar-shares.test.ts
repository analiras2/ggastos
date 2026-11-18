import { describe, expect, it } from 'vitest';

import { computeBarShares } from '@/features/reports/compute-bar-shares';

const category = (id: string, actualCents: number) => ({
  categoryId: id,
  name: id,
  color: '#000000',
  actualCents,
});

describe('computeBarShares', () => {
  it('sums the total and sizes bars against the largest category', () => {
    const { totalCents, bars } = computeBarShares([category('a', 300), category('b', 100)]);

    expect(totalCents).toBe(400);
    expect(bars.map((bar) => bar.barPercent)).toEqual([100, expect.closeTo(33.33, 1)]);
    expect(bars.map((bar) => bar.sharePercent)).toEqual([75, 25]);
  });

  it('never draws a bar thinner than the minimum', () => {
    const { bars } = computeBarShares([category('big', 100000), category('tiny', 1)]);

    expect(bars[1].barPercent).toBe(2);
  });

  it('does not divide by zero when nothing was spent', () => {
    const { totalCents, bars } = computeBarShares([category('a', 0)]);

    expect(totalCents).toBe(0);
    expect(bars[0]).toMatchObject({ sharePercent: 0, barPercent: 0 });
  });

  it('returns no bars for no categories', () => {
    expect(computeBarShares([])).toEqual({ totalCents: 0, bars: [] });
  });
});
