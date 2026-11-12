import { buildMonthKey, parseMonthKey } from '@/shared/lib/month';

export type StatisticsPeriod = 'year' | 'quarter' | 'month';

export type Quarter = { year: number; quarter: number };

const MONTHS_PER_QUARTER = 3;
const QUARTERS_PER_YEAR = 4;

export function quarterOfMonth(monthKey: string): Quarter {
  const { year, monthIndex } = parseMonthKey(monthKey);
  return { year, quarter: Math.floor(monthIndex / MONTHS_PER_QUARTER) + 1 };
}

export function monthsOfQuarter({ year, quarter }: Quarter): string[] {
  const firstMonthIndex = (quarter - 1) * MONTHS_PER_QUARTER;
  return Array.from({ length: MONTHS_PER_QUARTER }, (_, offset) => buildMonthKey(year, firstMonthIndex + offset));
}

export function shiftQuarter({ year, quarter }: Quarter, delta: number): Quarter {
  const quarterIndex = year * QUARTERS_PER_YEAR + (quarter - 1) + delta;
  return { year: Math.floor(quarterIndex / QUARTERS_PER_YEAR), quarter: (quarterIndex % QUARTERS_PER_YEAR) + 1 };
}

export function quarterLabel({ year, quarter }: Quarter): string {
  return `${quarter}º tri ${year}`;
}
