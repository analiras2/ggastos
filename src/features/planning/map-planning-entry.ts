import { formatCurrencyCents } from '@/shared/lib/format-currency';
import { formatIsoDateToBrazilian } from '@/shared/lib/form-utils';
import { UNCATEGORIZED_LABEL } from '@/shared/contracts/finance';
import { ENTRY_KIND_BY_IMPACT, type EntryKind } from '@/shared/theme/ggastos-theme';
import type { CategoryName } from '@/features/categories';
import type { PlannedEntry } from '@/features/planned-entries';

export type PlanningEntryView = {
  id: string;
  title: string;
  category: string;
  amount: string;
  kind: EntryKind;
  dueDate: string;
  status: string;
  canConfirm: boolean;
  canCancel: boolean;
};

const UNTITLED_ENTRY_LABEL = 'Aguardando importação';
const NO_DUE_DATE_LABEL = 'Sem vencimento';

function statusLabel(status: PlannedEntry['status']): string {
  if (status === 'RECONCILED') return 'REALIZADO';
  if (status === 'CANCELLED') return 'CANCELADO';
  return 'PLANEJADO';
}

export function mapPlanningEntry(entry: PlannedEntry, categories: CategoryName[]): PlanningEntryView {
  const isPlanned = entry.status === 'PLANNED';

  return {
    id: entry.id,
    title: entry.title || UNTITLED_ENTRY_LABEL,
    category: categories.find((item) => item.id === entry.categoryId)?.name ?? UNCATEGORIZED_LABEL,
    amount: formatCurrencyCents(entry.amountCents),
    kind: ENTRY_KIND_BY_IMPACT[entry.impactType],
    dueDate: entry.dueDate ? formatIsoDateToBrazilian(entry.dueDate) : NO_DUE_DATE_LABEL,
    status: statusLabel(entry.status),
    canConfirm: isPlanned,
    canCancel: isPlanned,
  };
}
