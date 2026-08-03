import type { EntryKind, StatusChipStatus } from '@/constants/ggastos-theme';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import type { CategoryDetails } from '@/features/dashboard/dashboard-schema';
import type { ImpactType, PlanningStatus } from '@/features/planning/planning-schema';

export const IMPACT_TYPE_TO_KIND: Record<ImpactType, EntryKind> = {
  INCOME: 'receita',
  EXPENSE: 'despesa',
  INVESTMENT: 'investimento',
  TRANSFER: 'transferencia',
};

export const PLANNING_STATUS_TO_CHIP: Record<PlanningStatus, StatusChipStatus> = {
  PLANNED: 'PLANEJADO',
  PROJECTED: 'PLANEJADO',
  RECONCILED: 'REALIZADO',
  CARRIED_OVER: 'PENDENTE',
  CANCELLED: 'PENDENTE',
};

export type PlannedEntryItem = {
  id: string;
  title: string;
  category: string;
  amount: string;
  kind: EntryKind;
  competence: string;
  status: StatusChipStatus;
  isConfirmable: boolean;
  isUndoable: boolean;
};

export type TransactionItem = {
  id: string;
  title: string;
  category: string;
  amount: string;
  kind: EntryKind;
  date: string;
};

export type CategoryDetailsView = {
  name: string;
  plannedItems: PlannedEntryItem[];
  transactionItems: TransactionItem[];
  isEmpty: boolean;
};

function formatCompetence(installmentIndex: number | null, installmentTotal: number | null, dueDate: string | null) {
  if (installmentIndex != null && installmentTotal != null) {
    return `Parcela ${installmentIndex}/${installmentTotal}`;
  }
  if (dueDate) {
    return new Date(dueDate).toLocaleDateString('pt-BR');
  }
  return 'Sem vencimento';
}

export function formatCategoryDetails(details: CategoryDetails): CategoryDetailsView {
  const kind = IMPACT_TYPE_TO_KIND[details.impactType];

  const plannedItems = details.plannedEntries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    category: details.name,
    amount: formatCurrencyCents(entry.amountCents),
    kind,
    competence: formatCompetence(entry.installmentIndex, entry.installmentTotal, entry.dueDate),
    status: PLANNING_STATUS_TO_CHIP[entry.status],
    isConfirmable: entry.status === 'PLANNED' || entry.status === 'PROJECTED' || entry.status === 'CARRIED_OVER',
    isUndoable: entry.status === 'RECONCILED' && entry.manuallyConfirmedAt !== null,
  }));

  const transactionItems = details.importedTransactions.map((transaction) => ({
    id: transaction.id,
    title: transaction.merchantName ?? transaction.description,
    category: details.name,
    amount: formatCurrencyCents(transaction.amountCents),
    kind,
    date: new Date(transaction.postedAt).toLocaleDateString('pt-BR'),
  }));

  return {
    name: details.name,
    plannedItems,
    transactionItems,
    isEmpty: plannedItems.length === 0 && transactionItems.length === 0,
  };
}
