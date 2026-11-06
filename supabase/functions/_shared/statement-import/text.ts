const STATEMENT_TIME_ZONE = "America/Sao_Paulo";

export function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

export async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

// Today as YYYY-MM-DD in the time zone of the statements, so a due date is compared with the
// local calendar day and not with the UTC one.
export function todayInStatementTimeZone(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: STATEMENT_TIME_ZONE });
}
