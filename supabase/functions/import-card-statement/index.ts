import { getBearerToken, readAuthenticatedUser, type AuthUser } from "../_shared/auth.ts";
import { parseBradescoStatement } from "../_shared/statements/parse-bradesco.ts";
import { parseNubankStatement } from "../_shared/statements/parse-nubank.ts";
import {
  resolveStatementCategory,
  type StatementCategoryRule,
} from "../_shared/statements/category-rules.ts";
import type {
  ParsedStatement,
  ParsedStatementTransaction,
  StatementBank,
  StatementImportMode,
  StatementSection,
} from "../_shared/statements/types.ts";
import { supabaseRest, type SupabaseRestConfig } from "../_shared/supabase-rest.ts";
import {
  upsertFinancialAccount,
  upsertFinancialConnection,
  type FinancialAccountUpsert,
  type FinancialConnectionUpsert,
} from "../_shared/upsert.ts";
import { runAutoMatch } from "../_shared/reconciliation/auto-match.ts";
import { preserveUserEdits, type ExistingUserEdits } from "../_shared/statements/preserve-user-edits.ts";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

type ImportRequest = {
  bank: StatementBank;
  fileName: string;
  contents: string;
  invoiceMonth: string | null;
  fileHash: string | null;
};

type StatementBatchRow = {
  id: string;
};

type StatementTransactionUpsert = {
  user_id: string;
  connection_id: string;
  account_id: string;
  source_provider: "CARD_STATEMENT";
  source_transaction_id: string;
  provider_created_at: string;
  provider_updated_at: string;
  posted_at: string;
  competency_month: string;
  description: string;
  description_raw: string | null;
  amount_cents: number;
  currency_code: string;
  status: "PENDING" | "POSTED";
  direction: "DEBIT" | "CREDIT";
  merchant_name: string | null;
  merchant_legal_name: string | null;
  merchant_cnpj: string | null;
  internal_category_id: string | null;
  impact_type: "INCOME" | "EXPENSE" | "INVESTMENT" | "TRANSFER";
  is_internal_transfer: boolean;
  is_hidden_from_budget: boolean;
  note: string | null;
  provider_payload: Record<string, unknown>;
  statement_import_batch_id: string;
  statement_source_bank: StatementBank;
  statement_source_fingerprint: string;
  statement_source_section: StatementSection;
  statement_installment_index: number | null;
  statement_installment_total: number | null;
  statement_import_mode: StatementImportMode;
};

type ExistingImportedRow = {
  statement_source_fingerprint: string;
  internal_category_id: string | null;
  note: string | null;
};

type UserCategoryRuleRow = {
  rule_type: string;
  rule_value: string;
  target_category_id: string;
  priority: number;
};

type ActiveCategoryRow = { id: string };

const FINGERPRINT_LOOKUP_CHUNK_SIZE = 50;

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const VALID_BANKS = new Set<StatementBank>(["NUBANK", "BRADESCO"]);
const INVOICE_MONTH_PATTERN = /^[0-9]{4}-(0[1-9]|1[0-2])$/;

function jsonResponse(status: number, body: Record<string, JsonValue>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

function readRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

function isStatementBank(value: unknown): value is StatementBank {
  return typeof value === "string" && VALID_BANKS.has(value as StatementBank);
}

async function parseImportRequest(request: Request): Promise<ImportRequest> {
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

  if (!isStatementBank(candidate.bank)) {
    throw jsonResponse(400, {
      error: "invalid_bank",
      message: "bank must be either NUBANK or BRADESCO.",
    });
  }

  if (!fileName) {
    throw jsonResponse(400, {
      error: "invalid_file_name",
      message: "fileName must be a non-empty string.",
    });
  }

  if (!contents) {
    throw jsonResponse(400, {
      error: "invalid_contents",
      message: "contents must be a non-empty CSV string.",
    });
  }

  if (invoiceMonth !== null && !INVOICE_MONTH_PATTERN.test(invoiceMonth)) {
    throw jsonResponse(400, {
      error: "invalid_invoice_month",
      message: "invoiceMonth must use YYYY-MM format.",
    });
  }

  return {
    bank: candidate.bank,
    fileName,
    contents,
    invoiceMonth,
    fileHash,
  };
}

function buildProfilePayload(user: AuthUser) {
  const displayName =
    asNonEmptyString(user.user_metadata?.display_name) ??
    asNonEmptyString(user.user_metadata?.name) ??
    asNonEmptyString(user.app_metadata?.display_name);
  const locale =
    asNonEmptyString(user.user_metadata?.locale) ??
    asNonEmptyString(user.app_metadata?.locale) ??
    "pt-BR";

  return {
    id: user.id,
    email: asNonEmptyString(user.email) ?? `${user.id}@users.ggastos.local`,
    display_name: displayName,
    locale,
  };
}

async function ensureProfile(config: SupabaseRestConfig, user: AuthUser): Promise<void> {
  await supabaseRest<void>(config, "/rest/v1/profiles?on_conflict=id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(buildProfilePayload(user)),
  });
}

function parseStatement(request: ImportRequest): ParsedStatement {
  const input = {
    bank: request.bank,
    contents: request.contents,
    fileName: request.fileName,
    fileHash: request.fileHash,
    invoiceMonth: request.invoiceMonth,
  };

  if (request.bank === "NUBANK") {
    return parseNubankStatement(input);
  }

  return parseBradescoStatement(input);
}

async function sha256Hex(value: string): Promise<string> {
  const digest = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(value),
  );
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

function bankDisplayName(bank: StatementBank): string {
  return bank === "NUBANK" ? "Nubank" : "Bradesco";
}

async function ensureStatementAccount(
  config: SupabaseRestConfig,
  context: { userId: string; bank: StatementBank; now: string },
): Promise<{ connectionId: string; accountId: string }> {
  const bankLabel = bankDisplayName(context.bank);
  const connection: FinancialConnectionUpsert = {
    user_id: context.userId,
    source_provider: "CARD_STATEMENT",
    source_connection_id: context.bank,
    institution_name: `${bankLabel} Card Statement`,
    status: "UPDATED",
    last_synced_at: context.now,
    last_error_code: null,
    last_error_message: null,
  };

  const connectionRow = await upsertFinancialConnection(config, connection);
  const account: FinancialAccountUpsert = {
    user_id: context.userId,
    connection_id: connectionRow.id,
    source_provider: "CARD_STATEMENT",
    source_account_id: `${context.bank}:CREDIT_CARD`,
    type: "CREDIT",
    subtype: "CREDIT_CARD",
    name: `${bankLabel} Credit Card`,
    marketing_name: `${bankLabel} CSV Import`,
    masked_number: null,
    owner_name: null,
    currency_code: "BRL",
    balance_cents: null,
    credit_limit_cents: null,
    due_date: null,
    close_date: null,
    provider_payload: {
      source: "CARD_STATEMENT",
      bank: context.bank,
    },
  };
  const accountRow = await upsertFinancialAccount(config, account);

  return {
    connectionId: connectionRow.id,
    accountId: accountRow.id,
  };
}

async function loadStatementCategoryRules(
  config: SupabaseRestConfig,
  userId: string,
): Promise<StatementCategoryRule[]> {
  const params = new URLSearchParams({
    select: "rule_type,rule_value,target_category_id,priority",
    user_id: `eq.${userId}`,
    is_active: "eq.true",
    order: "priority.asc,created_at.asc",
  });
  const rows = await supabaseRest<UserCategoryRuleRow[]>(
    config,
    `/rest/v1/user_category_rules?${params.toString()}`,
    { method: "GET" },
  );

  if (rows.length === 0) {
    return [];
  }

  const categoryIds = [...new Set(rows.map((rule) => rule.target_category_id))];
  const activeCategoryParams = new URLSearchParams({
    select: "id",
    id: `in.(${categoryIds.join(",")})`,
    is_active: "eq.true",
  });
  const activeCategories = await supabaseRest<ActiveCategoryRow[]>(
    config,
    `/rest/v1/categories?${activeCategoryParams.toString()}`,
    { method: "GET" },
  );
  const activeCategoryIds = new Set(activeCategories.map((category) => category.id));

  return rows
    .filter((rule) => activeCategoryIds.has(rule.target_category_id))
    .map((rule) => ({
      ruleType: rule.rule_type,
      ruleValue: rule.rule_value,
      targetCategoryId: rule.target_category_id,
      priority: rule.priority,
    }));
}

async function createImportBatch(
  config: SupabaseRestConfig,
  batch: {
    userId: string;
    bank: StatementBank;
    fileName: string;
    fileHash: string;
    invoiceMonth: string | null;
    payload: Record<string, unknown>;
  },
): Promise<string> {
  const rows = await supabaseRest<StatementBatchRow[]>(
    config,
    "/rest/v1/statement_import_batches?select=id",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        user_id: batch.userId,
        bank: batch.bank,
        file_name: batch.fileName,
        file_hash: batch.fileHash,
        invoice_month: batch.invoiceMonth,
        status: "RECEIVED",
        payload: batch.payload,
      }),
    },
  );

  if (rows.length !== 1) {
    throw new Error("Expected exactly one statement_import_batches row.");
  }

  return rows[0].id;
}

async function updateImportBatch(
  config: SupabaseRestConfig,
  batchId: string,
  patch: Record<string, unknown>,
): Promise<void> {
  await supabaseRest<void>(
    config,
    `/rest/v1/statement_import_batches?id=eq.${batchId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify(patch),
    },
  );
}

// Rows already stored for these fingerprints, with the columns a user may have edited.
async function findExistingImportedRows(
  config: SupabaseRestConfig,
  context: { userId: string; bank: StatementBank; fingerprints: string[] },
): Promise<Map<string, ExistingUserEdits>> {
  const existing = new Map<string, ExistingUserEdits>();

  // Chunked so the fingerprint list never makes the request URL too long.
  for (let start = 0; start < context.fingerprints.length; start += FINGERPRINT_LOOKUP_CHUNK_SIZE) {
    const chunk = context.fingerprints.slice(start, start + FINGERPRINT_LOOKUP_CHUNK_SIZE);
    const params = new URLSearchParams({
      select: "statement_source_fingerprint,internal_category_id,note",
      user_id: `eq.${context.userId}`,
      statement_source_bank: `eq.${context.bank}`,
      statement_source_fingerprint: `in.(${chunk.join(",")})`,
    });
    const rows = await supabaseRest<ExistingImportedRow[]>(
      config,
      `/rest/v1/imported_transactions?${params.toString()}`,
      { method: "GET" },
    );

    for (const row of rows) {
      existing.set(row.statement_source_fingerprint, {
        internal_category_id: row.internal_category_id,
        note: row.note,
      });
    }
  }

  return existing;
}

function buildImportedTransaction(
  transaction: ParsedStatementTransaction,
  context: {
    userId: string;
    connectionId: string;
    accountId: string;
    batchId: string;
    bank: StatementBank;
    fingerprint: string;
    now: string;
    categoryRules: readonly StatementCategoryRule[];
  },
): StatementTransactionUpsert {
  return {
    user_id: context.userId,
    connection_id: context.connectionId,
    account_id: context.accountId,
    source_provider: "CARD_STATEMENT",
    source_transaction_id: `${context.bank}:${context.fingerprint}`,
    provider_created_at: context.now,
    provider_updated_at: context.now,
    posted_at: transaction.postedAt,
    competency_month: transaction.competencyMonth,
    description: transaction.description,
    description_raw: transaction.descriptionRaw,
    amount_cents: transaction.amountCents,
    currency_code: transaction.currencyCode,
    status: "POSTED",
    direction: transaction.direction,
    merchant_name: null,
    merchant_legal_name: null,
    merchant_cnpj: null,
    internal_category_id: resolveStatementCategory(
      transaction.description,
      context.categoryRules,
    ),
    impact_type: transaction.impactType,
    is_internal_transfer: false,
    is_hidden_from_budget: transaction.defaultImportMode !== "IMPORT",
    note: null,
    provider_payload: {
      source: "CARD_STATEMENT",
      bank: context.bank,
      section: transaction.section,
      importMode: transaction.defaultImportMode,
      row: transaction.raw,
      sourceRowNumber: transaction.sourceRowNumber,
      installment: transaction.installment,
    },
    statement_import_batch_id: context.batchId,
    statement_source_bank: context.bank,
    statement_source_fingerprint: context.fingerprint,
    statement_source_section: transaction.section,
    statement_installment_index: transaction.installment?.index ?? null,
    statement_installment_total: transaction.installment?.total ?? null,
    statement_import_mode: transaction.defaultImportMode,
  };
}

async function buildImportedTransactions(
  parsed: ParsedStatement,
  context: {
    userId: string;
    connectionId: string;
    accountId: string;
    batchId: string;
    bank: StatementBank;
    now: string;
    categoryRules: readonly StatementCategoryRule[];
  },
): Promise<StatementTransactionUpsert[]> {
  const transactions: StatementTransactionUpsert[] = [];

  for (const transaction of parsed.transactions) {
    if (transaction.defaultImportMode === "SKIP") {
      continue;
    }

    const fingerprint = await sha256Hex(transaction.fingerprintInput);
    transactions.push(
      buildImportedTransaction(transaction, {
        ...context,
        fingerprint,
      }),
    );
  }

  return transactions;
}

async function upsertStatementTransactions(
  config: SupabaseRestConfig,
  transactions: StatementTransactionUpsert[],
): Promise<number> {
  if (transactions.length === 0) {
    return 0;
  }

  const rows = await supabaseRest<Array<{ id: string }>>(
    config,
    "/rest/v1/imported_transactions?on_conflict=user_id,source_provider,source_transaction_id&select=id",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify(transactions),
    },
  );

  return rows.length;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST to import a card statement.",
    });
  }

  try {
    const supabaseUrl = readRequiredEnv("SUPABASE_URL");
    const anonKey = readRequiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const config: SupabaseRestConfig = { supabaseUrl, serviceRoleKey };

    const accessToken = getBearerToken(request);
    if (!accessToken) {
      return jsonResponse(401, {
        error: "missing_auth",
        message: "Authorization bearer token is required.",
      });
    }

    const user = await readAuthenticatedUser(supabaseUrl, anonKey, accessToken);
    if (!user) {
      return jsonResponse(401, {
        error: "invalid_auth",
        message: "Authorization bearer token is invalid or expired.",
      });
    }

    const importRequest = await parseImportRequest(request);
    const fileHash = importRequest.fileHash ?? await sha256Hex(importRequest.contents);
    const requestWithHash = { ...importRequest, fileHash };
    const parsed = parseStatement(requestWithHash);
    const now = new Date().toISOString();

    await ensureProfile(config, user);
    const batchId = await createImportBatch(config, {
      userId: user.id,
      bank: importRequest.bank,
      fileName: importRequest.fileName,
      fileHash,
      invoiceMonth: parsed.metadata.invoiceMonth,
      payload: {
        source: "CARD_STATEMENT",
        metadata: parsed.metadata,
      },
    });

    if (parsed.errors.length > 0) {
      const message = parsed.errors.map((error) => error.message).join(" ");
      await updateImportBatch(config, batchId, {
        status: "FAILED",
        rows_read: parsed.rowsRead,
        rows_skipped: parsed.skippedRows.length,
        rows_failed: parsed.errors.length,
        error_message: message,
        payload: {
          source: "CARD_STATEMENT",
          metadata: parsed.metadata,
          errors: parsed.errors,
          skippedRows: parsed.skippedRows,
        },
      });

      return jsonResponse(422, {
        error: "invalid_statement",
        message,
        batchId,
        rowsRead: parsed.rowsRead,
        rowsImported: 0,
        rowsDuplicated: 0,
        rowsSkipped: parsed.skippedRows.length,
        rowsFailed: parsed.errors.length,
      });
    }

    const accountContext = await ensureStatementAccount(config, {
      userId: user.id,
      bank: importRequest.bank,
      now,
    });
    const categoryRules = await loadStatementCategoryRules(config, user.id);
    const transactions = await buildImportedTransactions(parsed, {
      userId: user.id,
      bank: importRequest.bank,
      batchId,
      now,
      categoryRules,
      ...accountContext,
    });
    const existingRows = await findExistingImportedRows(config, {
      userId: user.id,
      bank: importRequest.bank,
      fingerprints: transactions.map((transaction) => transaction.statement_source_fingerprint),
    });
    const rowsDuplicated = existingRows.size;
    // Re-importing must not undo what the user did after the first import.
    await upsertStatementTransactions(config, preserveUserEdits(transactions, existingRows));
    const matchOutcomes = await runAutoMatch(config, {
      userId: user.id,
      accountId: accountContext.accountId,
    });

    const rowsImported = transactions.length - rowsDuplicated;
    await updateImportBatch(config, batchId, {
      status: "PROCESSED",
      rows_read: parsed.rowsRead,
      rows_imported: rowsImported,
      rows_duplicated: rowsDuplicated,
      rows_skipped: parsed.skippedRows.length,
      rows_failed: 0,
      matches_created: matchOutcomes.length,
      payload: {
        source: "CARD_STATEMENT",
        metadata: parsed.metadata,
        skippedRows: parsed.skippedRows,
        matches: matchOutcomes,
      },
    });

    return jsonResponse(202, {
      batchId,
      bank: importRequest.bank,
      accountId: accountContext.accountId,
      rowsRead: parsed.rowsRead,
      rowsImported,
      rowsDuplicated,
      rowsSkipped: parsed.skippedRows.length,
      rowsFailed: 0,
      matchesCreated: matchOutcomes.length,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    const message = error instanceof Error ? error.message : "Unexpected import error.";
    return jsonResponse(500, {
      error: "import_failed",
      message,
    });
  }
});
