import { jsonResponse } from "../http.ts";
import { parsePaymentStatus, type PaymentStatus } from "../statements/payment-status.ts";
import { detectBank } from "../statements/detect-bank.ts";
import type { StatementBank } from "../statements/types.ts";
import { asNonEmptyString } from "./text.ts";

export type ImportRequest = {
  bank: StatementBank;
  fileName: string;
  contents: string;
  invoiceMonth: string | null;
  fileHash: string | null;
  paymentStatus: PaymentStatus | null;
};

const VALID_BANKS = new Set<StatementBank>(["NUBANK", "BRADESCO", "MERCADO_PAGO"]);
const INVOICE_MONTH_PATTERN = /^[0-9]{4}-(0[1-9]|1[0-2])$/;

function isStatementBank(value: unknown): value is StatementBank {
  return typeof value === "string" && VALID_BANKS.has(value as StatementBank);
}

// Reads and validates the JSON body. Throws a ready-made 400 Response when it is invalid.
export async function parseImportRequest(request: Request): Promise<ImportRequest> {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    throw jsonResponse(400, {
      error: "invalid_json",
      message: "Request body must be valid JSON.",
    });
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw jsonResponse(400, {
      error: "invalid_body",
      message: "Request body must be a JSON object.",
    });
  }

  const candidate = body as Record<string, unknown>;
  const fileName = asNonEmptyString(candidate.fileName);
  const contents = asNonEmptyString(candidate.contents);
  const invoiceMonth =
    candidate.invoiceMonth === undefined || candidate.invoiceMonth === null
      ? null
      : asNonEmptyString(candidate.invoiceMonth);
  const fileHash =
    candidate.fileHash === undefined || candidate.fileHash === null
      ? null
      : asNonEmptyString(candidate.fileHash);

  if (!fileName) {
    throw jsonResponse(400, {
      error: "invalid_file_name",
      message: "fileName must be a non-empty string.",
    });
  }

  if (!contents) {
    throw jsonResponse(400, {
      error: "invalid_contents",
      message: "contents must be a non-empty string with the text of the statement.",
    });
  }

  // The bank is optional: when it is not sent, the file itself says which bank it is.
  if (candidate.bank !== undefined && candidate.bank !== null && !isStatementBank(candidate.bank)) {
    throw jsonResponse(400, {
      error: "invalid_bank",
      message: "bank must be NUBANK, BRADESCO or MERCADO_PAGO.",
    });
  }
  const bank = isStatementBank(candidate.bank) ? candidate.bank : detectBank(contents);
  if (!bank) {
    throw jsonResponse(422, {
      error: "unknown_bank",
      message: "Não reconheci o banco dessa fatura. Por enquanto: Nubank, Bradesco e Mercado Pago.",
    });
  }

  const paymentStatus = parsePaymentStatus(candidate.paymentStatus);
  if (
    candidate.paymentStatus !== undefined &&
    candidate.paymentStatus !== null &&
    paymentStatus === null
  ) {
    throw jsonResponse(400, {
      error: "invalid_payment_status",
      message: "paymentStatus must be either PAID or OPEN.",
    });
  }

  if (invoiceMonth !== null && !INVOICE_MONTH_PATTERN.test(invoiceMonth)) {
    throw jsonResponse(400, {
      error: "invalid_invoice_month",
      message: "invoiceMonth must use YYYY-MM format.",
    });
  }

  return {
    bank,
    fileName,
    contents,
    invoiceMonth,
    fileHash,
    paymentStatus,
  };
}
