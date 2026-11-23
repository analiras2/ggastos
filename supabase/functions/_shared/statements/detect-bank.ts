import { isHeader, normalizeToken, parseRows } from "./bradesco-rows.ts";
import { headerMatches, parseCsvRows } from "./nubank-csv.ts";
import type { StatementBank } from "./types.ts";

const MERCADO_PAGO_MARKERS = ["mercado pago", "detalhes de consumo"];

// Each bank is recognized by what its file looks like, so the person never has to say which bank it is.
// Returns null when the file is none of the supported ones.
export function detectBank(contents: string): StatementBank | null {
  const text = contents.replace(/^\uFEFF/, "");

  const normalized = normalizeToken(text);
  if (MERCADO_PAGO_MARKERS.every((marker) => normalized.includes(marker))) {
    return "MERCADO_PAGO";
  }

  const firstCsvRow = parseCsvRows(text)[0];
  if (firstCsvRow && headerMatches(firstCsvRow.fields)) {
    return "NUBANK";
  }

  if (parseRows(text).some((row) => isHeader(row.fields))) {
    return "BRADESCO";
  }

  return null;
}
