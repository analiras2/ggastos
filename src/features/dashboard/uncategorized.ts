// Imported purchases that have no category yet. They belong to no category of the month, so the month tab
// lists them on their own row until they get one.

// A valid UUID that stands for "no category" wherever a category id is expected.
export const UNCATEGORIZED_CATEGORY_ID = '00000000-0000-0000-0000-000000000000';

export type UncategorizedRow = { amountCents: number; direction: 'DEBIT' | 'CREDIT' };

export type UncategorizedSummary = { count: number; totalCents: number };

// Null when every purchase of the month has a category. Refunds (credits) reduce the total.
export function summarizeUncategorized(rows: UncategorizedRow[]): UncategorizedSummary | null {
  if (rows.length === 0) {
    return null;
  }

  const totalCents = rows.reduce(
    (sum, row) => sum + (row.direction === 'CREDIT' ? -row.amountCents : row.amountCents),
    0
  );
  return { count: rows.length, totalCents: Math.max(totalCents, 0) };
}

export function uncategorizedCountLabel(count: number): string {
  return count === 1 ? '1 item' : `${count} itens`;
}
