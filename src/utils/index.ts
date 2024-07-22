export const capitalize = (text: string) => {
  const newValue = text.toLowerCase();
  return newValue.replace(/(^|\s)\S/g, l => l.toUpperCase());
};

export const toMoney = (value: string | number): string => {
  const valueStr = typeof value === 'number' ? value.toString() : value;
  const toNumber = valueStr.replace(/\D/g, '');
  const formatValue = (parseInt(toNumber, 10) / 100).toFixed(2);

  return `R$ ${formatValue.replace('.', ',')}`;
};

export const formatDate = (date: Date): string => {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
};
