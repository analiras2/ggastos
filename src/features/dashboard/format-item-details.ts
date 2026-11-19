import { paymentMethodLabel } from '@/shared/lib/payment-method-label';
import { formatIsoDateToBrazilian, formatTimestampToBrazilian } from '@/shared/lib/form-utils';
import type { ImpactType } from '@/shared/contracts/finance';
import type { EditablePlannedEntry } from '@/features/planned-entries';
import type { CategoryDetails } from '@/features/dashboard/contract';
import type { ItemRemoval } from '@/shared/lib/item-removal';

export type DetailLine = { label: string; value: string };

// What the edit sheet needs to change an item's category and tags.
export type EditTarget = {
  source: 'PLANNED' | 'IMPORTED';
  id: string;
  title: string;
  // Null for a purchase that has no category yet.
  categoryId: string | null;
  impactType: ImpactType;
  tags: string[];
  // Set when the entry was typed in, so the whole "Novo lançamento" form can edit it.
  plannedEntry: EditablePlannedEntry | null;
  // How the item can be removed; null when it cannot be.
  removal: ItemRemoval | null;
  // The statement description the category rules match on; null for a planned entry.
  description: string | null;
};

type PlannedEntry = CategoryDetails['plannedEntries'][number];
type ImportedTransaction = CategoryDetails['importedTransactions'][number];

const PLANNED_STATUS_LABELS: Record<PlannedEntry['status'], string> = {
  PLANNED: 'Planejado',
  PROJECTED: 'Planejado',
  RECONCILED: 'Realizado',
  CARRIED_OVER: 'Pendente de um mês anterior',
  CANCELLED: 'Cancelado',
};

const BANK_LABELS: Record<string, string> = { BRADESCO: 'Bradesco', NUBANK: 'Nubank' };

function installmentText(index: number | null, total: number | null): string | null {
  return index !== null && total !== null ? `${index} de ${total}` : null;
}

function toLines(candidates: [string, string | null | undefined][]): DetailLine[] {
  return candidates
    .filter((candidate): candidate is [string, string] => Boolean(candidate[1]?.trim()))
    .map(([label, value]) => ({ label, value }));
}

export function plannedDetailLines(entry: PlannedEntry, categoryName: string): DetailLine[] {
  return toLines([
    ['Situação', PLANNED_STATUS_LABELS[entry.status]],
    ['Categoria', categoryName],
    ['Vencimento', entry.dueDate ? formatIsoDateToBrazilian(entry.dueDate) : null],
    ['Parcela', installmentText(entry.installmentIndex, entry.installmentTotal)],
    ['Forma de pagamento', paymentMethodLabel(entry.paymentMethod)],
    ['Observação', entry.note],
  ]);
}

export function transactionDetailLines(transaction: ImportedTransaction, categoryName: string): DetailLine[] {
  const hasDifferentOriginal = transaction.descriptionRaw && transaction.descriptionRaw !== transaction.description;
  return toLines([
    ['Categoria', categoryName],
    ['Data', formatTimestampToBrazilian(transaction.postedAt)],
    ['Estabelecimento', transaction.merchantName],
    ['Descrição original', hasDifferentOriginal ? transaction.descriptionRaw : null],
    ['Parcela', installmentText(transaction.installmentIndex, transaction.installmentTotal)],
    ['Forma de pagamento', paymentMethodLabel(transaction.paymentMethod)],
    ['Origem', transaction.sourceBank ? `Fatura ${BANK_LABELS[transaction.sourceBank] ?? transaction.sourceBank}` : null],
    ['Observação', transaction.note],
  ]);
}
