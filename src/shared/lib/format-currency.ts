const CENTS_PER_UNIT = 100;
const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

// 12345 -> "R$ 123,45"
export function formatCurrencyCents(cents: number): string {
  return currencyFormatter.format(cents / CENTS_PER_UNIT);
}
