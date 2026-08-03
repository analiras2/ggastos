export type StatementBank = "NUBANK" | "BRADESCO";

export type StatementSection = "CURRENT_INVOICE" | "SCHEDULED";

export type StatementDirection = "DEBIT" | "CREDIT";

export type StatementImpactType = "INCOME" | "EXPENSE" | "INVESTMENT" | "TRANSFER";

export type StatementImportMode = "IMPORT" | "PREVIEW_ONLY" | "SKIP";

export type StatementSkippedReason =
  | "empty_row"
  | "metadata"
  | "previous_balance"
  | "payment_or_credit"
  | "summary"
  | "total"
  | "fees"
  | "invalid_transaction"
  | "unsupported_section";

export type StatementInstallment = {
  index: number;
  total: number;
};

export type ParsedStatementTransaction = {
  sourceRowNumber: number;
  section: StatementSection;
  postedAt: string;
  competencyMonth: string;
  description: string;
  descriptionRaw: string;
  amountCents: number;
  currencyCode: "BRL";
  direction: StatementDirection;
  impactType: StatementImpactType;
  installment: StatementInstallment | null;
  defaultImportMode: StatementImportMode;
  fingerprintInput: string;
  raw: Record<string, unknown>;
};

export type ParsedStatementSkippedRow = {
  sourceRowNumber: number;
  section: StatementSection | null;
  reason: StatementSkippedReason;
  raw: Record<string, unknown>;
};

export type StatementParserErrorCode =
  | "invalid_encoding"
  | "missing_header"
  | "invalid_date"
  | "invalid_amount"
  | "unsupported_format";

export type StatementParserError = {
  code: StatementParserErrorCode;
  message: string;
  sourceRowNumber: number | null;
};

export type ParsedStatementMetadata = {
  bank: StatementBank;
  sourceEncoding: string;
  sourceLineEnding: "LF" | "CRLF" | "CR" | "UNKNOWN";
  delimiter: "," | ";";
  fileName: string | null;
  fileHash: string | null;
  invoiceMonth: string | null;
  invoiceGeneratedAt: string | null;
};

export type ParsedStatement = {
  metadata: ParsedStatementMetadata;
  rowsRead: number;
  transactions: ParsedStatementTransaction[];
  skippedRows: ParsedStatementSkippedRow[];
  errors: StatementParserError[];
};

export type StatementParserInput = {
  bank: StatementBank;
  contents: string | Uint8Array;
  fileName?: string | null;
  fileHash?: string | null;
  invoiceMonth?: string | null;
};
