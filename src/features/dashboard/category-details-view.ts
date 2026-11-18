import type { EntryKind, StatusChipStatus } from '@/shared/theme/ggastos-theme';
import type { DetailLine, EditTarget } from '@/features/dashboard/format-item-details';

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
  tags: string[];
  details: DetailLine[];
  editTarget: EditTarget;
};

export type TransactionItem = {
  id: string;
  title: string;
  category: string;
  amount: string;
  kind: EntryKind;
  date: string;
  tags: string[];
  details: DetailLine[];
  editTarget: EditTarget;
};

export type CategoryDetailsView = {
  name: string;
  plannedItems: PlannedEntryItem[];
  transactionItems: TransactionItem[];
  isEmpty: boolean;
};
