import { afterEach, describe, expect, it, vi } from 'vitest';

import { DEFAULT_CHART_VIEW, readChartPreference, writeChartPreference } from '@/shared/lib/chart-preference';

function stubStorage(initial: Record<string, string> = {}) {
  const data = { ...initial };
  vi.stubGlobal('localStorage', {
    getItem: (key: string) => data[key] ?? null,
    setItem: (key: string, value: string) => {
      data[key] = value;
    },
  });
}

afterEach(() => vi.unstubAllGlobals());

describe('chart preference', () => {
  it('defaults to bars when nothing is stored', () => {
    stubStorage();
    expect(readChartPreference()).toBe(DEFAULT_CHART_VIEW);
    expect(DEFAULT_CHART_VIEW).toBe('bars');
  });

  it('remembers the chosen chart', () => {
    stubStorage();
    writeChartPreference('donut');
    expect(readChartPreference()).toBe('donut');
  });

  it('ignores an unknown stored value', () => {
    stubStorage({ 'ggastos.chart-preference': 'pie' });
    expect(readChartPreference()).toBe(DEFAULT_CHART_VIEW);
  });

  it('falls back to the default when storage throws', () => {
    vi.stubGlobal('localStorage', {
      getItem: () => {
        throw new Error('blocked');
      },
      setItem: () => {
        throw new Error('blocked');
      },
    });
    expect(readChartPreference()).toBe(DEFAULT_CHART_VIEW);
    expect(() => writeChartPreference('bars')).not.toThrow();
  });
});
