export const MONTHS = [
  {id: 0, month: 'Janeiro', monthSort: 'Jan'},
  {id: 1, month: 'Fevereiro', monthSort: 'Fev'},
  {id: 2, month: 'Março', monthSort: 'Mar'},
  {id: 3, month: 'Abril', monthSort: 'Abr'},
  {id: 4, month: 'Maio', monthSort: 'Mai'},
  {id: 5, month: 'Junho', monthSort: 'Jun'},
  {id: 6, month: 'Julho', monthSort: 'Jul'},
  {id: 7, month: 'Agosto', monthSort: 'Ago'},
  {id: 8, month: 'Setembro', monthSort: 'Set'},
  {id: 9, month: 'Outubro', monthSort: 'Out'},
  {id: 10, month: 'Novembro', monthSort: 'Nov'},
  {id: 11, month: 'Dezembro', monthSort: 'Dez'},
];

export const getYears = (startYear: number) => {
  const endYear = new Date().getFullYear();
  if (!startYear) {
    return [endYear];
  }

  return Array(endYear - startYear + 1)
    .fill()
    .map((_, index) => startYear + index);
};
