const NUBANK_HEADER = ["date", "title", "amount"];
const FILE_NAME_DUE_DATE_PATTERN = /(\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\d|3[01])/;

export type CsvRow = {
  sourceRowNumber: number;
  fields: string[];
};

function splitCsvLine(line: string): string[] {
  const fields: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let index = 0; index < line.length; index++) {
    const character = line[index];
    const nextCharacter = line[index + 1];

    if (character === '"' && inQuotes && nextCharacter === '"') {
      field += '"';
      index++;
      continue;
    }

    if (character === '"') {
      inQuotes = !inQuotes;
      continue;
    }

    if (character === "," && !inQuotes) {
      fields.push(field);
      field = "";
      continue;
    }

    field += character;
  }

  fields.push(field);
  return fields;
}

export function parseCsvRows(text: string): CsvRow[] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line, index) => ({ sourceRowNumber: index + 1, fields: splitCsvLine(line) }))
    .filter((row) => row.fields.some((field) => field.trim().length > 0));
}

export function headerMatches(fields: string[]): boolean {
  return fields.length === NUBANK_HEADER.length &&
    fields.every((field, index) => field.trim() === NUBANK_HEADER[index]);
}

// Nubank exports are named after the invoice due date (Nubank_2027-01-15.csv).
export function dueDateFromFileName(fileName: string | null | undefined): string | null {
  const match = fileName?.match(FILE_NAME_DUE_DATE_PATTERN);
  return match ? `${match[1]}-${match[2]}-${match[3]}` : null;
}
