import { useCallback, useState } from 'react';

export type ChartView = 'donut' | 'bars';

const STORAGE_KEY = 'ggastos.chart-preference';
export const DEFAULT_CHART_VIEW: ChartView = 'bars';

function isChartView(value: unknown): value is ChartView {
  return value === 'donut' || value === 'bars';
}

// Storage can be missing or blocked (private window), so every access is guarded.
export function readChartPreference(): ChartView {
  try {
    const stored = globalThis.localStorage?.getItem(STORAGE_KEY);
    return isChartView(stored) ? stored : DEFAULT_CHART_VIEW;
  } catch {
    return DEFAULT_CHART_VIEW;
  }
}

export function writeChartPreference(value: ChartView): void {
  try {
    globalThis.localStorage?.setItem(STORAGE_KEY, value);
  } catch {
    // The choice still applies until the page is closed.
  }
}

// The chart the statistics open with; kept on this device.
export function useChartPreference(): [ChartView, (value: ChartView) => void] {
  const [preference, setPreference] = useState<ChartView>(readChartPreference);

  const update = useCallback((value: ChartView) => {
    writeChartPreference(value);
    setPreference(value);
  }, []);

  return [preference, update];
}
