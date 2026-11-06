export const MONTH_LABELS = [
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
  const [yearPart, monthPart] = monthKey.split('-');
  const index = Number(monthPart) - 1;
  const monthName = MONTH_LABELS[index];
  return monthName ? `${monthName} ${yearPart}` : monthKey;
}

export function shiftMonthKey(monthKey: string, delta: number): string {
  const [yearPart, monthPart] = monthKey.split('-').map(Number);
  const date = new Date(Date.UTC(yearPart, monthPart - 1 + delta, 1));
  return `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, '0')}`;
}

export function parseMonthKey(monthKey: string): { year: number; monthIndex: number } {
  const [yearPart, monthPart] = monthKey.split('-').map(Number);
  return { year: yearPart, monthIndex: monthPart - 1 };
}

export function buildMonthKey(year: number, monthIndex: number): string {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
}
