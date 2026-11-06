const DIGITS_PATTERN = /\D/g;
const NEGATIVE_MARK = '-';

// Money typed in a masked field: digits are cents, and a "-" anywhere makes it negative.
export function walletCentsFromInput(text: string): number {
  const digitsOnly = text.replace(DIGITS_PATTERN, '');
  const cents = digitsOnly ? parseInt(digitsOnly, 10) : 0;
  return text.includes(NEGATIVE_MARK) && cents > 0 ? -cents : cents;
}

// Raw text to start the field with: the current value, or empty for zero.
export function walletInputFromCents(cents: number): string {
  return cents === 0 ? '' : String(cents);
}
