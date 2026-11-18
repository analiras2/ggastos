import { describe, expect, it, vi } from 'vitest';

import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { formatCategoryDetails } from '@/features/dashboard/format-category-details';
import { UNCATEGORIZED_CATEGORY_ID } from '@/features/dashboard/uncategorized';
import type { CategoryDetails } from '@/features/dashboard/contract';

// The planned-entries index pulls in native UI, which cannot load in Node; the form's editable
// entry is only checked for presence here.
vi.mock('@/features/planned-entries', () => ({
  buildEditablePlannedEntry: (input: { id: string }) => ({ id: input.id }),
}));

type PlannedEntry = CategoryDetails['plannedEntries'][number];
type ImportedTransaction = CategoryDetails['importedTransactions'][number];

const plannedEntry = (overrides: Partial<PlannedEntry>): PlannedEntry => ({
  id: 'entry-1',
  title: 'Aluguel',
  amountCents: 150000,
  status: 'PLANNED',
  dueDate: '2026-11-05',
  installmentIndex: null,
  installmentTotal: null,
  manuallyConfirmedAt: null,
  paymentMethod: null,
  tags: [],
  note: null,
  sourceBatchId: null,
  templateId: null,
  ...overrides,
});

const transaction = (overrides: Partial<ImportedTransaction>): ImportedTransaction => ({
  id: 'tx-1',
  description: 'PAG*MERCADO',
  amountCents: 2500,
  postedAt: '2026-11-03T12:00:00.000Z',
  merchantName: null,
  paymentMethod: null,
  tags: [],
  note: null,
  descriptionRaw: null,
  installmentIndex: null,
  installmentTotal: null,
  sourceBank: null,
  impactType: 'EXPENSE',
  ...overrides,
});

const details = (
  plannedEntries: PlannedEntry[],
  importedTransactions: ImportedTransaction[] = [],
  overrides: Partial<CategoryDetails> = {}
): CategoryDetails => ({
  month: '2026-11',
  categoryId: 'cat-1',
  categoryCode: 'housing',
  name: 'Moradia',
  impactType: 'EXPENSE',
  plannedEntries,
  importedTransactions,
  ...overrides,
});

describe('formatCategoryDetails', () => {
  it('is empty only when there are no entries and no transactions', () => {
    expect(formatCategoryDetails(details([])).isEmpty).toBe(true);
    expect(formatCategoryDetails(details([plannedEntry({})])).isEmpty).toBe(false);
    expect(formatCategoryDetails(details([], [transaction({})])).isEmpty).toBe(false);
  });

  it('formats a planned entry and falls back to the category name when untitled', () => {
    const view = formatCategoryDetails(details([plannedEntry({ title: null })]));

    expect(view.plannedItems[0]).toMatchObject({
      title: 'Moradia',
      amount: formatCurrencyCents(150000),
      kind: 'despesa',
      status: 'PLANEJADO',
    });
  });

  it('describes the competence by installment, by due date or as having none', () => {
    const [installment, dated, undated] = formatCategoryDetails(
      details([
        plannedEntry({ installmentIndex: 2, installmentTotal: 6 }),
        plannedEntry({ id: 'entry-2' }),
        plannedEntry({ id: 'entry-3', dueDate: null }),
      ])
    ).plannedItems;

    expect(installment.competence).toBe('Parcela 2/6');
    expect(dated.competence).toBe('05/11/2026');
    expect(undated.competence).toBe('Sem vencimento');
  });

  it('appends the payment method to the competence', () => {
    const [item] = formatCategoryDetails(details([plannedEntry({ paymentMethod: 'PIX' })])).plannedItems;

    expect(item.competence).toBe('05/11/2026 · Pix');
  });

  it('lets only planned, projected and carried over entries be confirmed', () => {
    const items = formatCategoryDetails(
      details(
        (['PLANNED', 'PROJECTED', 'CARRIED_OVER', 'RECONCILED', 'CANCELLED'] as const).map((status, index) =>
          plannedEntry({ id: `entry-${index}`, status })
        )
      )
    ).plannedItems;

    expect(items.map((item) => item.isConfirmable)).toEqual([true, true, true, false, false]);
  });

  it('lets only a manually confirmed entry be undone', () => {
    const [manual, automatic] = formatCategoryDetails(
      details([
        plannedEntry({ status: 'RECONCILED', manuallyConfirmedAt: '2026-11-06T10:00:00Z' }),
        plannedEntry({ id: 'entry-2', status: 'RECONCILED' }),
      ])
    ).plannedItems;

    expect(manual.isUndoable).toBe(true);
    expect(automatic.isUndoable).toBe(false);
  });

  describe('removal', () => {
    const removalOf = (overrides: Partial<PlannedEntry>) =>
      formatCategoryDetails(details([plannedEntry(overrides)])).plannedItems[0].editTarget.removal;

    it('deletes an entry that was typed in', () => {
      expect(removalOf({})).toBe('DELETE');
    });

    it('cancels an entry that comes from a recurrence', () => {
      expect(removalOf({ templateId: 'template-1' })).toBe('CANCEL');
    });

    it('does not remove an entry that comes from a statement', () => {
      expect(removalOf({ sourceBatchId: 'batch-1' })).toBeNull();
    });
  });

  it('only lets entries that were typed in be edited as a whole', () => {
    const [typed, fromStatement] = formatCategoryDetails(
      details([plannedEntry({}), plannedEntry({ id: 'entry-2', sourceBatchId: 'batch-1' })])
    ).plannedItems;

    expect(typed.editTarget.plannedEntry).not.toBeNull();
    expect(fromStatement.editTarget.plannedEntry).toBeNull();
  });

  it('shows an imported transaction by merchant name, with its date and payment method', () => {
    const [item] = formatCategoryDetails(
      details([], [transaction({ merchantName: 'Mercado Central', paymentMethod: 'CREDIT_CARD' })])
    ).transactionItems;

    expect(item.title).toBe('Mercado Central');
    expect(item.date).toMatch(/^\d{2}\/\d{2}\/\d{4} · Cartão de crédito$/);
    expect(item.editTarget).toMatchObject({ source: 'IMPORTED', removal: null, plannedEntry: null });
  });

  it('gives a purchase without a category no category id to edit', () => {
    const [item] = formatCategoryDetails(
      details([], [transaction({})], { categoryId: UNCATEGORIZED_CATEGORY_ID })
    ).transactionItems;

    expect(item.editTarget.categoryId).toBeNull();
  });
});
