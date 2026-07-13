const MONTH_LABELS = [
  'Janeiro',
  'Fevereiro',
  'Março',
  'Abril',
  'Maio',
  'Junho',
  'Julho',
  'Agosto',
  'Setembro',
  'Outubro',
  'Novembro',
  'Dezembro',
];

export function currentMonthKey(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function monthLabel(monthKey: string): string {
  const [, monthPart] = monthKey.split('-');
  const index = Number(monthPart) - 1;
  return MONTH_LABELS[index] ?? monthKey;
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [yearPart, monthPart] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(yearPart, monthPart - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}
