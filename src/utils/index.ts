export const capitalize = (text: string) => {
  const newValue = text.toLowerCase();
  return newValue.replace(/(^|\s)\S/g, l => l.toUpperCase());
};

export const toMoney = (value: number) => {
  return `R$ ${value.toFixed(2).replace('.', ',')}`;
};
