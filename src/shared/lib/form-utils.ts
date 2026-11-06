export function formatDateToIso(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function formatDateToBrazilian(date: Date): string {
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

export function monthKeyFromIsoDate(isoDate: string): string {
  return isoDate.slice(0, 7);
}

export function centsFromMaskedInput(text: string): number {
  const digitsOnly = text.replace(/\D/g, '');
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}

export function installmentAmountCents(totalCents: number, installmentTotal: number): number {
  return Math.round(totalCents / installmentTotal);
}

export function installmentCountFromInput(text: string): number {
  const digitsOnly = text.replace(/\D/g, '');
  return digitsOnly ? parseInt(digitsOnly, 10) : 0;
}

// Formats a YYYY-MM-DD date without going through Date, which would read it as UTC midnight and
// show the previous day in time zones behind UTC.
export function formatIsoDateToBrazilian(isoDate: string): string {
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  return `${day}/${month}/${year}`;
}
