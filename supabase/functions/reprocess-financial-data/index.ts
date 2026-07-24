import { getBearerToken, readAuthenticatedUser } from "../_shared/auth.ts";
import {
  fetchMonthDashboardAsUser,
  upsertMonthSnapshot,
} from "../_shared/closing/snapshot.ts";
import { runAutoMatch } from "../_shared/reconciliation/auto-match.ts";
import { sanitizeConnectionSyncError } from "../_shared/sync-error.ts";
import { supabaseRest, type SupabaseRestConfig } from "../_shared/supabase-rest.ts";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

type ReprocessScope = "SNAPSHOT" | "MATCHING" | "SYNC_EVENT";

/** Exact request contract from `.specs/features/closing-hardening/design.md` — do not deviate. */
type ReprocessRequestBody = {
  month?: string;
  connectionId?: string;
  scope: ReprocessScope;
  syncEventId?: string;
};

type ReprocessErrorCode =
  | "invalid_body"
  | "invalid_scope"
  | "invalid_month"
  | "missing_connection_id"
  | "missing_sync_event_id"
  | "connection_not_found"
  | "sync_event_not_found"
  | "not_reprocessable"
  | "reprocessing_in_progress";

const REPROCESS_ERROR_STATUS: Record<ReprocessErrorCode, number> = {
  invalid_body: 400,
  invalid_scope: 400,
  invalid_month: 400,
  missing_connection_id: 400,
  missing_sync_event_id: 400,
  connection_not_found: 404,
  sync_event_not_found: 404,
  not_reprocessable: 400,
  reprocessing_in_progress: 409,
};

class ReprocessError extends Error {
  constructor(public readonly code: ReprocessErrorCode, message: string) {
    super(message);
  }
}

/** Resolved, scope-specific context after request validation and ownership checks. */
type ScopeContext =
  | { scope: "SNAPSHOT"; resourceKey: string; connectionId: null; month: string }
  | { scope: "MATCHING"; resourceKey: string; connectionId: string }
  | {
      scope: "SYNC_EVENT";
      resourceKey: string;
      connectionId: string;
      syncEventId: string;
    };

type SyncEventRow = {
  id: string;
  processing_status: "RECEIVED" | "PROCESSED" | "FAILED" | "IGNORED";
};

const MONTH_PATTERN = /^[0-9]{4}-(0[1-9]|1[0-2])$/;
const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const REPROCESS_EVENT_TYPE = "REPROCESS_REQUESTED";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

function jsonResponse(status: number, body: Record<string, JsonValue>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function readRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

async function parseReprocessRequestBody(request: Request): Promise<ReprocessRequestBody> {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    throw new ReprocessError("invalid_body", "Request body must be valid JSON.");
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new ReprocessError("invalid_body", "Request body must be a JSON object.");
  }

  const candidate = body as Record<string, unknown>;
  const scope = candidate.scope;

  if (scope !== "SNAPSHOT" && scope !== "MATCHING" && scope !== "SYNC_EVENT") {
    throw new ReprocessError(
      "invalid_scope",
      "Field 'scope' must be one of SNAPSHOT, MATCHING, SYNC_EVENT.",
    );
  }

  const month = isNonEmptyString(candidate.month) ? candidate.month : undefined;
  const connectionId = isNonEmptyString(candidate.connectionId)
    ? candidate.connectionId
    : undefined;
  const syncEventId = isNonEmptyString(candidate.syncEventId)
    ? candidate.syncEventId
    : undefined;

  return { scope, month, connectionId, syncEventId };
}

/**
 * Verifies the request carries the scope's required companion field in the
 * expected format, resolves ownership (financial_connections / sync_events
 * belong to the authenticated user), and derives the stable resourceKey used
 * for both dedupe and the audit payload. Nothing here mutates data — a
 * failure here means no sync_events row is ever created for this attempt.
 */
async function resolveScopeContext(
  config: SupabaseRestConfig,
  userId: string,
  body: ReprocessRequestBody,
): Promise<ScopeContext> {
  if (body.scope === "SNAPSHOT") {
    if (!body.month || !MONTH_PATTERN.test(body.month)) {
      throw new ReprocessError(
        "invalid_month",
        "Field 'month' is required in AAAA-MM format for scope SNAPSHOT.",
      );
    }
    return { scope: "SNAPSHOT", resourceKey: `SNAPSHOT:${body.month}`, connectionId: null, month: body.month };
  }

  if (body.scope === "MATCHING") {
    if (!body.connectionId || !isUuid(body.connectionId)) {
      throw new ReprocessError(
        "missing_connection_id",
        "Field 'connectionId' (UUID) is required for scope MATCHING.",
      );
    }
    await assertConnectionOwnership(config, userId, body.connectionId);
    return {
      scope: "MATCHING",
      resourceKey: `MATCHING:${body.connectionId}`,
      connectionId: body.connectionId,
    };
  }

  // body.scope === "SYNC_EVENT"
  if (!body.syncEventId || !isUuid(body.syncEventId)) {
    throw new ReprocessError(
      "missing_sync_event_id",
      "Field 'syncEventId' (UUID) is required for scope SYNC_EVENT.",
    );
  }
  const resolvedConnectionId = await resolveSyncEventConnectionId(config, userId, body.syncEventId);
  return {
    scope: "SYNC_EVENT",
    resourceKey: `SYNC_EVENT:${body.syncEventId}`,
    connectionId: resolvedConnectionId,
    syncEventId: body.syncEventId,
  };
}

async function assertConnectionOwnership(
  config: SupabaseRestConfig,
  userId: string,
  connectionId: string,
): Promise<void> {
  const params = new URLSearchParams({
    select: "id",
    id: `eq.${connectionId}`,
    user_id: `eq.${userId}`,
  });
  const rows = await supabaseRest<Array<{ id: string }>>(
    config,
    `/rest/v1/financial_connections?${params.toString()}`,
    { method: "GET" },
  );
  if (rows.length === 0) {
    throw new ReprocessError(
      "connection_not_found",
      "connectionId was not found for the authenticated user.",
    );
  }
}

async function resolveSyncEventConnectionId(
  config: SupabaseRestConfig,
  userId: string,
  syncEventId: string,
): Promise<string> {
  const params = new URLSearchParams({
    select: "id,connection_id",
    id: `eq.${syncEventId}`,
    user_id: `eq.${userId}`,
  });
  const rows = await supabaseRest<Array<{ id: string; connection_id: string | null }>>(
    config,
    `/rest/v1/sync_events?${params.toString()}`,
    { method: "GET" },
  );
  const row = rows[0];
  if (!row) {
    throw new ReprocessError(
      "sync_event_not_found",
      "syncEventId was not found for the authenticated user.",
    );
  }
  if (!row.connection_id) {
    throw new ReprocessError(
      "not_reprocessable",
      "This event has no connection to reprocess.",
    );
  }
  return row.connection_id;
}

async function findInProgressReprocessEvent(
  config: SupabaseRestConfig,
  userId: string,
  resourceKey: string,
): Promise<{ id: string } | null> {
  const params = new URLSearchParams({
    select: "id",
    user_id: `eq.${userId}`,
    event_type: `eq.${REPROCESS_EVENT_TYPE}`,
    processing_status: "eq.RECEIVED",
    "payload->>resourceKey": `eq.${resourceKey}`,
  });
  const rows = await supabaseRest<Array<{ id: string }>>(
    config,
    `/rest/v1/sync_events?${params.toString()}`,
    { method: "GET" },
  );
  return rows[0] ?? null;
}

function buildBasePayload(
  context: ScopeContext,
  body: ReprocessRequestBody,
): Record<string, JsonValue> {
  return {
    source: "reprocess-financial-data",
    scope: context.scope,
    resourceKey: context.resourceKey,
    month: body.month ?? null,
    connectionId: body.connectionId ?? null,
    syncEventId: body.syncEventId ?? null,
  };
}

async function insertReceivedEvent(
  config: SupabaseRestConfig,
  userId: string,
  context: ScopeContext,
  basePayload: Record<string, JsonValue>,
): Promise<SyncEventRow> {
  const rows = await supabaseRest<SyncEventRow[]>(
    config,
    "/rest/v1/sync_events?select=id,processing_status",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "return=representation",
      },
      body: JSON.stringify({
        event_id: crypto.randomUUID(),
        user_id: userId,
        event_type: REPROCESS_EVENT_TYPE,
        connection_id: context.connectionId,
        processing_status: "RECEIVED",
        payload: basePayload,
      }),
    },
  );

  if (rows.length !== 1) {
    throw new Error("Expected exactly one sync_events row to be created.");
  }
  return rows[0];
}

async function patchSyncEventProcessed(
  config: SupabaseRestConfig,
  syncEventId: string,
  basePayload: Record<string, JsonValue>,
  resultSummary: Record<string, JsonValue>,
): Promise<void> {
  await supabaseRest<void>(
    config,
    `/rest/v1/sync_events?id=eq.${syncEventId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        processing_status: "PROCESSED",
        processed_at: new Date().toISOString(),
        payload: { ...basePayload, ...resultSummary },
      }),
    },
  );
}

async function patchSyncEventFailed(
  config: SupabaseRestConfig,
  syncEventId: string,
  existingPayload: Record<string, JsonValue>,
  errorMessage: string,
): Promise<void> {
  await supabaseRest<void>(
    config,
    `/rest/v1/sync_events?id=eq.${syncEventId}`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Prefer: "return=minimal" },
      body: JSON.stringify({
        processing_status: "FAILED",
        processed_at: new Date().toISOString(),
        payload: { ...existingPayload, errorMessage },
      }),
    },
  );
}

/** Same matching logic for both MATCHING and (resolved) SYNC_EVENT scopes. */
async function runMatchingForConnection(
  config: SupabaseRestConfig,
  userId: string,
  connectionId: string,
): Promise<{ matchesCreated: number; accountsProcessed: number }> {
  const params = new URLSearchParams({
    select: "id",
    connection_id: `eq.${connectionId}`,
  });
  const accounts = await supabaseRest<Array<{ id: string }>>(
    config,
    `/rest/v1/financial_accounts?${params.toString()}`,
    { method: "GET" },
  );

  let matchesCreated = 0;
  for (const account of accounts) {
    const outcomes = await runAutoMatch(config, { userId, accountId: account.id });
    matchesCreated += outcomes.length;
  }

  return { matchesCreated, accountsProcessed: accounts.length };
}

async function performReprocess(
  context: ScopeContext,
  restConfig: SupabaseRestConfig,
  supabaseUrl: string,
  anonKey: string,
  accessToken: string,
  userId: string,
): Promise<Record<string, JsonValue>> {
  if (context.scope === "SNAPSHOT") {
    const dashboard = await fetchMonthDashboardAsUser(supabaseUrl, anonKey, accessToken, context.month);
    const snapshot = await upsertMonthSnapshot(restConfig, userId, dashboard);
    return {
      snapshotId: snapshot.id,
      month: snapshot.month,
      snapshotStatus: snapshot.status,
      computedAt: snapshot.computed_at,
    };
  }

  // MATCHING and SYNC_EVENT share the exact same matching work.
  const { matchesCreated, accountsProcessed } = await runMatchingForConnection(
    restConfig,
    userId,
    context.connectionId,
  );
  return {
    connectionId: context.connectionId,
    accountsProcessed,
    matchesCreated,
  };
}

function reprocessErrorResponse(error: ReprocessError): Response {
  return jsonResponse(REPROCESS_ERROR_STATUS[error.code], {
    error: error.code,
    message: error.message,
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST for reprocess-financial-data.",
    });
  }

  try {
    const supabaseUrl = readRequiredEnv("SUPABASE_URL");
    const anonKey = readRequiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const restConfig: SupabaseRestConfig = { supabaseUrl, serviceRoleKey };

    const accessToken = getBearerToken(request);
    if (!accessToken) {
      return jsonResponse(401, {
        error: "missing_authorization",
        message: "Authorization bearer token is required.",
      });
    }

    const user = await readAuthenticatedUser(supabaseUrl, anonKey, accessToken);
    if (!user) {
      return jsonResponse(401, {
        error: "invalid_token",
        message: "Authenticated Supabase user could not be resolved.",
      });
    }

    let body: ReprocessRequestBody;
    let context: ScopeContext;
    try {
      body = await parseReprocessRequestBody(request);
      context = await resolveScopeContext(restConfig, user.id, body);
    } catch (error) {
      if (error instanceof ReprocessError) {
        return reprocessErrorResponse(error);
      }
      throw error;
    }

    const inProgress = await findInProgressReprocessEvent(restConfig, user.id, context.resourceKey);
    if (inProgress) {
      return jsonResponse(409, {
        error: "reprocessing_in_progress",
        message: "A reprocess request for this resource is already in progress.",
      });
    }

    const basePayload = buildBasePayload(context, body);
    const syncEvent = await insertReceivedEvent(restConfig, user.id, context, basePayload);

    try {
      const resultSummary = await performReprocess(
        context,
        restConfig,
        supabaseUrl,
        anonKey,
        accessToken,
        user.id,
      );

      await patchSyncEventProcessed(restConfig, syncEvent.id, basePayload, resultSummary);

      return jsonResponse(200, {
        syncEventId: syncEvent.id,
        scope: context.scope,
        status: "PROCESSED",
        ...resultSummary,
      });
    } catch (workError) {
      const errorMessage = sanitizeConnectionSyncError(workError);
      await patchSyncEventFailed(restConfig, syncEvent.id, basePayload, errorMessage).catch(() => {});

      console.error("reprocess-financial-data work failed", workError);

      return jsonResponse(500, {
        syncEventId: syncEvent.id,
        error: "internal_error",
        message: "Unable to complete the reprocess request.",
      });
    }
  } catch (error) {
    console.error("reprocess-financial-data failed", error);
    return jsonResponse(500, {
      error: "internal_error",
      message: "Unable to process the reprocess request.",
    });
  }
});
