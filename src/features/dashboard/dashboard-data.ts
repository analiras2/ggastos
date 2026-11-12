import type { ImpactType } from '@/shared/contracts/finance';
import type { CategoryStatus } from '@/features/dashboard/category-status';
import { EntryKind } from '@/shared/theme/ggastos-theme';

export type CategoryBudget = {
  categoryId: string;
  // One row per category and entry type, so a category can show up once per type.
  impactType: ImpactType;
  name: string;
  icon: string;
  color: string;
  // Null when the category has nothing planned for the month.
  planned: string | null;
  // What was actually paid or received so far.
  actual: string;
  // What is left (or how much went past the plan); null when nothing was planned.
  status: CategoryStatus | null;
  progress: number;
};

export type DashboardData = {
  month: string;
  previsto: string;
  commitment: {
    value: string;
  };
  // Unpaid imported statements of the month; null when there are none.
  openInvoices: { value: string } | null;
  categories: CategoryBudget[];
  pendingReviewCount: number;
};

export type { EntryKind };
