// The message of an Error, or the given fallback when something else was thrown.
export function errorMessageOf(error: unknown, fallback: string): string {
  return error instanceof Error ? error.message : fallback;
}
