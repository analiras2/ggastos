import { EntryKind } from '@/constants/ggastos-theme';

export type CategoryBudget = {
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
    value: string;
    level: 'normal' | 'high';
  };
  categories: CategoryBudget[];
  pendingReviewCount: number;
};

export const MOCK_DASHBOARD_DATA: DashboardData = {
  month: 'Julho',
  hero: {
    value: 'R$ 3.240,00',
    delta: '+R$ 180',
    deltaLabel: 'vs. realizado até agora',
    status: 'healthy',
  },
  previsto: 'R$ 6.400,00',
  atual: 'R$ 4.120,00',
  commitment: {
    value: 'R$ 1.860,00',
    level: 'high',
  },
  categories: [
    { name: 'Moradia', icon: 'home', planned: 'R$ 1.200', actual: 'R$ 1.200', delta: 'No previsto', deltaTone: 'neutral', progress: 100 },
    { name: 'Mercado', icon: 'shopping-cart', planned: 'R$ 700', actual: 'R$ 812', delta: '+R$ 112', deltaTone: 'over', progress: 116 },
    { name: 'Transporte', icon: 'car', planned: 'R$ 350', actual: 'R$ 240', delta: '-R$ 110', deltaTone: 'under', progress: 69 },
    { name: 'Saúde', icon: 'heart-pulse', planned: 'R$ 300', actual: 'R$ 0', delta: 'Ainda não começou', deltaTone: 'neutral', progress: 0 },
    { name: 'Lazer', icon: 'popcorn', planned: 'R$ 250', actual: 'R$ 190', delta: '-R$ 60', deltaTone: 'under', progress: 76 },
  ],
  pendingReviewCount: 3,
};

export type { EntryKind };
