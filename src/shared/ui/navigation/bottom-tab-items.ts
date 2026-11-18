export type BottomTabKey = 'mes' | 'plano' | 'estatisticas' | 'ajustes';

export type TabItem = { key: BottomTabKey; label: string; icon: string; edge?: 'start' | 'end' };

export const TABS_BEFORE_ADD: TabItem[] = [
  { key: 'mes', label: 'Mês', icon: 'calendar', edge: 'start' },
  { key: 'plano', label: 'Plano', icon: 'list-checks' },
];

export const TABS_AFTER_ADD: TabItem[] = [
  { key: 'estatisticas', label: 'Estatísticas', icon: 'chart-pie' },
  { key: 'ajustes', label: 'Perfil', icon: 'user', edge: 'end' },
];
