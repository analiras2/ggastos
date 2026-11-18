const MONTH_PATTERN = /^[0-9]{4}-(0[1-9]|1[0-2])$/;

// True for a month written as AAAA-MM.
export function isMonthKey(value: unknown): value is string {
  return typeof value === "string" && MONTH_PATTERN.test(value);
}
