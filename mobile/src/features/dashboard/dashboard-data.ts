import { EntryKind } from '@/constants/ggastos-theme';

export type CategoryBudget = {
  categoryId: string;
  name: string;
  icon: string;
  planned: string;
  actual: string;
  delta: string;
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
  atual: string;
  commitment: {
    remainingIncome: string;
    remainingExpenses: string;
    level: 'normal' | 'high';
  };
  categories: CategoryBudget[];
  pendingReviewCount: number;
};

export type { EntryKind };
