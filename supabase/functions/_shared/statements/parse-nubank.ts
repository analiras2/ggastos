import type {
  ParsedStatement,
  ParsedStatementTransaction,
  StatementInstallment,
  StatementParserError,
  StatementParserInput,
} from "./types.ts";

const NUBANK_HEADER = ["date", "title", "amount"];
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const INSTALLMENT_PATTERN = /\b(\d{1,2})\/(\d{1,2})\b/;

type CsvRow = {
  sourceRowNumber: number;
  fields: string[];
};

function decodeContents(contents: string | Uint8Array): string {
  if (typeof contents === "string") {
    return contents;
  }

  return new TextDecoder("utf-8").decode(contents);
}

function detectLineEnding(text: string): "LF" | "CRLF" | "CR" | "UNKNOWN" {
  if (text.includes("\r\n")) {
    return "CRLF";
  }
  if (text.includes("\n")) {
    return "LF";
  }
  if (text.includes("\r")) {
    return "CR";
  }
  return "UNKNOWN";
}

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

function parseCsvRows(text: string): CsvRow[] {
  return text
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .split("\n")
    .map((line, index) => ({ sourceRowNumber: index + 1, fields: splitCsvLine(line) }))
    .filter((row) => row.fields.some((field) => field.trim().length > 0));
}

function normalizeAmount(rawAmount: string): string {
  return rawAmount.trim().replace(/^-\s+/, "-");
}

function parseAmountCents(rawAmount: string): number | null {
  const normalized = normalizeAmount(rawAmount).replace(/\./g, "").replace(",", ".");
  if (!/^-?\d+(\.\d{1,2})?$/.test(normalized)) {
    return null;
  }

  return Math.round(Math.abs(Number(normalized)) * 100);
}

function parseDirection(rawAmount: string): "DEBIT" | "CREDIT" {
  return normalizeAmount(rawAmount).startsWith("-") ? "CREDIT" : "DEBIT";
}

function parseInstallment(description: string): StatementInstallment | null {
  const match = description.match(INSTALLMENT_PATTERN);
  if (!match) {
    return null;
  }

  const index = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isInteger(index) || !Number.isInteger(total) || index <= 0 || total <= 0) {
    return null;
  }
  if (index > total) {
    return null;
  }

  return { index, total };
}

function buildFingerprintInput(row: CsvRow): string {
  return ["NUBANK", row.sourceRowNumber.toString(), ...row.fields].join("|");
}

function toTransaction(row: CsvRow): {
  transaction: ParsedStatementTransaction | null;
  error: StatementParserError | null;
} {
  const [postedAt, rawDescription, rawAmount] = row.fields.map((field) => field.trim());

  if (!ISO_DATE_PATTERN.test(postedAt)) {
    return {
      transaction: null,
      error: {
        code: "invalid_date",
        message: `Invalid Nubank transaction date at row ${row.sourceRowNumber}.`,
        sourceRowNumber: row.sourceRowNumber,
      },
    };
  }

  const amountCents = parseAmountCents(rawAmount);
  if (amountCents === null) {
    return {
      transaction: null,
      error: {
        code: "invalid_amount",
        message: `Invalid Nubank transaction amount at row ${row.sourceRowNumber}.`,
        sourceRowNumber: row.sourceRowNumber,
      },
    };
  }

  return {
    transaction: {
      sourceRowNumber: row.sourceRowNumber,
      section: "CURRENT_INVOICE",
      postedAt,
      competencyMonth: postedAt.slice(0, 7),
      description: rawDescription,
      descriptionRaw: rawDescription,
      amountCents,
      currencyCode: "BRL",
      direction: parseDirection(rawAmount),
      impactType: "EXPENSE",
      installment: parseInstallment(rawDescription),
      defaultImportMode: "IMPORT",
      fingerprintInput: buildFingerprintInput(row),
      raw: {
        date: row.fields[0],
        title: row.fields[1],
        amount: row.fields[2],
      },
    },
    error: null,
  };
}

function headerMatches(fields: string[]): boolean {
  return fields.length === NUBANK_HEADER.length &&
    fields.every((field, index) => field.trim() === NUBANK_HEADER[index]);
}

export function parseNubankStatement(input: StatementParserInput): ParsedStatement {
  const text = decodeContents(input.contents).replace(/^\uFEFF/, "");
  const rows = parseCsvRows(text);
  const header = rows[0];
  const errors: StatementParserError[] = [];

  if (!header || !headerMatches(header.fields)) {
    return {
      metadata: {
        bank: "NUBANK",
        sourceEncoding: "utf-8",
        sourceLineEnding: detectLineEnding(text),
        delimiter: ",",
        fileName: input.fileName ?? null,
        fileHash: input.fileHash ?? null,
        invoiceMonth: input.invoiceMonth ?? null,
        invoiceGeneratedAt: null,
      },
      rowsRead: 0,
      transactions: [],
      skippedRows: [],
      errors: [
        {
          code: "missing_header",
          message: "Nubank CSV must start with header: date,title,amount.",
          sourceRowNumber: header?.sourceRowNumber ?? null,
        },
      ],
    };
  }

  const transactions: ParsedStatementTransaction[] = [];

  for (const row of rows.slice(1)) {
    const parsed = toTransaction(row);
    if (parsed.transaction) {
      transactions.push(parsed.transaction);
    }
    if (parsed.error) {
      errors.push(parsed.error);
    }
  }

  return {
    metadata: {
      bank: "NUBANK",
      sourceEncoding: "utf-8",
      sourceLineEnding: detectLineEnding(text),
      delimiter: ",",
      fileName: input.fileName ?? null,
      fileHash: input.fileHash ?? null,
      invoiceMonth: input.invoiceMonth ?? null,
      invoiceGeneratedAt: null,
    },
    rowsRead: rows.length - 1,
    transactions,
    skippedRows: [],
    errors,
  };
}
