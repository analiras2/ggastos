export const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
};

export const parseCurrency = (currencyString: string): number => {
  const cleanedString = currencyString
    .replace(/R\$\s*/, '')
    .replace('.', '')
    .replace(',', '.');
  return parseFloat(cleanedString);
};