import type { EntryKind, StatusChipStatus } from '@/constants/ggastos-theme';
import {
  IMPACT_TYPE_TO_KIND,
  PLANNING_STATUS_TO_CHIP,
} from '@/features/dashboard/format-category-details';
import { formatCurrencyCents } from '@/features/dashboard/format-dashboard';
import type { PlannedEntry, PlanningTemplate } from '@/features/planning/planning-schema';

export type PlanningEntryItem = {
  id: string;
  title: string;
  category: string;
  amount: string;
  kind: EntryKind;
  competence: string;
  status: StatusChipStatus;
  isCancellable: boolean;
};

export type PlanningTemplateItem = {
  id: string;
  title: string;
  category: string;
  amount: string;
  kind: EntryKind;
  recurrence: string;
};

const CANCELLABLE_STATUSES = new Set(['PLANNED', 'PROJECTED', 'CARRIED_OVER']);

function formatCompetence(
  installmentIndex: number | null,
  installmentTotal: number | null,
  dueDate: string | null
): string {
  if (installmentIndex != null && installmentTotal != null) {
    return `Parcela ${installmentIndex}/${installmentTotal}`;
  }
  if (dueDate) {
    return new Date(dueDate).toLocaleDateString('pt-BR');
  }
  return 'Sem vencimento';
}

function formatRecurrence(template: PlanningTemplate): string {
  if (template.installmentTotal != null) {
    return `Parcelado em ${template.installmentTotal}x`;
  }
  if (template.recurrenceFrequency === 'MONTHLY') {
    return 'Mensal';
  }
  if (template.recurrenceFrequency === 'YEARLY') {
    return 'Anual';
  }
  return 'Avulso';
}

export function formatPlanningEntries(
  entries: PlannedEntry[],
  categoryNames: Map<string, string>
): PlanningEntryItem[] {
  return entries.map((entry) => ({
    id: entry.id,
    title: entry.title,
    category: categoryNames.get(entry.categoryId) ?? '—',
    amount: formatCurrencyCents(entry.amountCents),
    kind: IMPACT_TYPE_TO_KIND[entry.impactType],
    competence: formatCompetence(entry.installmentIndex, entry.installmentTotal, entry.dueDate),
    status: PLANNING_STATUS_TO_CHIP[entry.status],
    isCancellable: CANCELLABLE_STATUSES.has(entry.status),
  }));
}

export function formatPlanningTemplates(
  templates: PlanningTemplate[],
  categoryNames: Map<string, string>
): PlanningTemplateItem[] {
  return templates.map((template) => ({
    id: template.id,
    title: template.title,
    category: categoryNames.get(template.categoryId) ?? '—',
    amount: formatCurrencyCents(template.installmentAmountCents ?? template.defaultAmountCents),
    kind: IMPACT_TYPE_TO_KIND[template.impactType],
    recurrence: formatRecurrence(template),
  }));
}
