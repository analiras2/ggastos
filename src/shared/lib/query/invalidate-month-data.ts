import type { QueryClient, QueryKey } from '@tanstack/react-query';

// Everything derived from a month's planned entries and transactions. Keys are
// matched by prefix, so every month (and every category) is covered.
const MONTH_DATA_QUERY_KEYS: QueryKey[] = [
  ['month-dashboard'],
  ['category-details'],
  ['planned-entries'],
  ['month-search'],
  ['month-snapshot'],
  ['annual-summary'],
  ['month-opening-balance'],
];

// Call after any change that moves money between months, categories or statuses,
// so the month tab, the category details and the reports never show stale data.
export async function invalidateMonthData(queryClient: QueryClient): Promise<void> {
  await Promise.all(
    MONTH_DATA_QUERY_KEYS.map((queryKey) => queryClient.invalidateQueries({ queryKey }))
  );
}
