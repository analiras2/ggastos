import { EntryKind } from '@/constants/ggastos-theme';

export type CategoryBudget = {
  categoryId: string;
  name: string;
  icon: string;
  color: string;
  // Null when the category has nothing planned for the month.
  planned: string | null;
  // Null when there is no difference to show.
  delta: string | null;
  deltaTone: 'neutral' | 'over' | 'under';
  progress: number;
};

export type DashboardData = {
  month: string;
  hero: {
    value: string;
    delta: string;
    deltaLabel: string;
    status: 'healthy' | 'tight';
  };
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
