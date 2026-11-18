import { describe, expect, it } from 'vitest';

import { mapPlanningEntry } from '@/features/planning/map-planning-entry';
import type { PlannedEntry } from '@/features/planned-entries';

const baseEntry = {
  id: 'entry-1',
  title: 'Aluguel',
  categoryId: 'cat-1',
  amountCents: 150000,
  impactType: 'EXPENSE',
  dueDate: '2026-11-05',
  status: 'PLANNED',
} as unknown as PlannedEntry;

const categories = [{ id: 'cat-1', name: 'Moradia' }];

describe('mapPlanningEntry', () => {
  it('formats a planned entry and lets it be confirmed and cancelled', () => {
    expect(mapPlanningEntry(baseEntry, categories)).toMatchObject({
      title: 'Aluguel',
      category: 'Moradia',
      kind: 'despesa',
      dueDate: '05/11/2026',
      status: 'PLANEJADO',
      canConfirm: true,
      canCancel: true,
    });
  });

  it('falls back when the entry has no title, category or due date', () => {
    const entry = { ...baseEntry, title: null, categoryId: null, dueDate: null } as unknown as PlannedEntry;

    expect(mapPlanningEntry(entry, categories)).toMatchObject({
      title: 'Aguardando importação',
      category: 'Sem categoria',
      dueDate: 'Sem vencimento',
    });
  });

  it('shows reconciled and cancelled entries as done and blocks the actions', () => {
    const reconciled = { ...baseEntry, status: 'RECONCILED' } as PlannedEntry;
    const cancelled = { ...baseEntry, status: 'CANCELLED' } as PlannedEntry;

    expect(mapPlanningEntry(reconciled, categories)).toMatchObject({ status: 'REALIZADO', canConfirm: false });
    expect(mapPlanningEntry(cancelled, categories)).toMatchObject({ status: 'CANCELADO', canCancel: false });
  });
});
