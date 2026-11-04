// Pure selection helpers. They never mutate their input and import nothing, so they can be
// tested in Node (supabase/tests/bulk-selection.test.mjs).

export type TransactionDirection = 'DEBIT' | 'CREDIT';

export type SelectableAmount = {
  id: string;
  amountCents: number;
  direction: TransactionDirection;
};

export type SelectionSet = ReadonlySet<string>;

export function toggleSelection(selection: SelectionSet, id: string): SelectionSet {
  const next = new Set(selection);
  if (next.has(id)) {
    next.delete(id);
  } else {
    next.add(id);
  }
  return next;
}

export function selectAllIds(ids: readonly string[]): SelectionSet {
  return new Set(ids);
}

// Adds every id between the anchor and the target (inclusive, in list order). Without a usable
// anchor it behaves like a plain toggle of the target.
export function selectRangeIds(
  selection: SelectionSet,
  orderedIds: readonly string[],
  anchorId: string | null,
  targetId: string
): SelectionSet {
  const anchorIndex = anchorId === null ? -1 : orderedIds.indexOf(anchorId);
  const targetIndex = orderedIds.indexOf(targetId);
  if (anchorIndex === -1 || targetIndex === -1) {
    return toggleSelection(selection, targetId);
  }

  const next = new Set(selection);
  const start = Math.min(anchorIndex, targetIndex);
  const end = Math.max(anchorIndex, targetIndex);
  for (const id of orderedIds.slice(start, end + 1)) {
    next.add(id);
  }
  return next;
}

// Keeps only ids that still exist. Returns the same instance when nothing changes, so callers can
// rely on referential equality.
export function pruneSelection(selection: SelectionSet, validIds: readonly string[]): SelectionSet {
  const valid = new Set(validIds);
  const kept = [...selection].filter((id) => valid.has(id));
  return kept.length === selection.size ? selection : new Set(kept);
}

// Credits (refunds) reduce the amount spent.
export function signedAmountCents(item: SelectableAmount): number {
  return item.direction === 'CREDIT' ? -item.amountCents : item.amountCents;
}

export function sumSelectedCents(items: readonly SelectableAmount[], selection: SelectionSet): number {
  return items.reduce((total, item) => (selection.has(item.id) ? total + signedAmountCents(item) : total), 0);
}
