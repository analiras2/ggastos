import { PluggyClient } from "../_shared/pluggy-client.ts";
import { normalizeAccount } from "../_shared/normalizers/normalize-account.ts";
import { normalizeTransaction } from "../_shared/normalizers/normalize-transaction.ts";
import { fetchPluggyCategoryMap } from "../_shared/normalizers/pluggy-category-map.ts";
import {
  buildConnectionUpsert,
  markConnectionSyncFailed,
  markMissingTransactionsDeleted,
  upsertFinancialAccount,
  upsertFinancialConnection,
  upsertImportedTransactions,
} from "../_shared/upsert.ts";
import { supabaseRest, type SupabaseRestConfig } from "../_shared/supabase-rest.ts";
import { runAutoMatch } from "../_shared/reconciliation/auto-match.ts";
import { getBearerToken, readAuthenticatedUser, type AuthUser } from "../_shared/auth.ts";
import { sanitizeConnectionSyncError } from "../_shared/sync-error.ts";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

type SyncRequest = {
  connectionId?: string | null;
  mode?: "manual" | "scheduled";
};

type SyncEventInsert = {
  event_id: string;
  user_id?: string | null;
  event_type: string;
  connection_id?: string | null;
  processing_status: "RECEIVED" | "PROCESSED" | "FAILED" | "IGNORED";
  payload: Record<string, JsonValue>;
};

type SyncEventRow = {
  id: string;
  processing_status: SyncEventInsert["processing_status"];
};

type ConnectionRow = {
  id: string;
  pluggy_item_id: string | null;
};

type ScheduledConnectionRow = ConnectionRow & {
  user_id: string;
};

const ACTIONABLE_ERROR_STATUSES = ["LOGIN_ERROR", "WAITING_USER_INPUT", "DELETED"];

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const UUID_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

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

function readOptionalEnv(name: string): string | null {
  const value = Deno.env.get(name);
  return value && value.trim().length > 0 ? value : null;
}

function isUuid(value: string): boolean {
  return UUID_PATTERN.test(value);
}

function asNonEmptyString(value: unknown): string | null {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : null;
}

async function parseSyncRequest(request: Request): Promise<SyncRequest> {
  let body: unknown = {};

  const rawBody = await request.text();
  if (rawBody.trim().length > 0) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      throw new Response(
        JSON.stringify({
          error: "invalid_json",
          message: "Request body must be valid JSON.",
        }),
        { status: 400, headers: corsHeaders },
      );
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw new Response(
      JSON.stringify({
        error: "invalid_body",
        message: "Request body must be a JSON object.",
      }),
      { status: 400, headers: corsHeaders },
    );
  }

  const candidate = body as Record<string, unknown>;
  const mode = candidate.mode ?? "manual";
  const connectionId =
    candidate.connectionId === undefined ? null : candidate.connectionId;

  if (mode !== "manual" && mode !== "scheduled") {
    throw new Response(
      JSON.stringify({
        error: "invalid_mode",
        message: "mode must be either 'manual' or 'scheduled'.",
      }),
      { status: 400, headers: corsHeaders },
    );
  }

  if (
    connectionId !== null &&
    connectionId !== undefined &&
    (typeof connectionId !== "string" || !isUuid(connectionId))
  ) {
    throw new Response(
      JSON.stringify({
        error: "invalid_connection_id",
        message: "connectionId must be a UUID string or null.",
      }),
      { status: 400, headers: corsHeaders },
    );
  }

  return {
    mode,
    connectionId: connectionId ?? null,
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

async function ensureProfile(config: SupabaseRestConfig, user: AuthUser) {
  await supabaseRest<void>(config, "/rest/v1/profiles?on_conflict=id", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Prefer: "resolution=merge-duplicates,return=minimal",
    },
    body: JSON.stringify(buildProfilePayload(user)),
  });
}

async function listConnectionsToSync(
  config: SupabaseRestConfig,
  userId: string,
  connectionId: string | null,
): Promise<ConnectionRow[]> {
  const params = new URLSearchParams({
    select: "id,pluggy_item_id",
    user_id: `eq.${userId}`,
    pluggy_item_id: "not.is.null",
  });
  if (connectionId) {
    params.set("id", `eq.${connectionId}`);
  }

  const rows = await supabaseRest<ConnectionRow[]>(
    config,
    `/rest/v1/financial_connections?${params.toString()}`,
    { method: "GET" },
  );

  if (connectionId && rows.length === 0) {
    throw new Response(
      JSON.stringify({
        error: "connection_not_found",
        message: "connectionId was not found for the authenticated user, or has no pluggy_item_id yet.",
      }),
      { status: 404, headers: corsHeaders },
    );
  }

  return rows;
}

async function listActiveConnectionsForScheduledSync(
  config: SupabaseRestConfig,
): Promise<ScheduledConnectionRow[]> {
  const params = new URLSearchParams({
    select: "id,pluggy_item_id,user_id",
    pluggy_item_id: "not.is.null",
    status: `not.in.(${ACTIONABLE_ERROR_STATUSES.join(",")})`,
  });

  return await supabaseRest<ScheduledConnectionRow[]>(
    config,
    `/rest/v1/financial_connections?${params.toString()}`,
    { method: "GET" },
  );
}

async function insertSyncEvent(
  config: SupabaseRestConfig,
  event: SyncEventInsert,
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
      body: JSON.stringify(event),
    },
  );

  if (rows.length !== 1) {
    throw new Error("Expected exactly one sync_events row to be created.");
  }

  return rows[0];
}

type ConnectionSyncOutcome = {
  connectionId: string;
  itemStatus: string;
  accountsProcessed: number;
  transactionsProcessed: number;
  matchesCreated: number;
  errorMessage: string | null;
};

async function syncConnection(
  pluggyClient: PluggyClient,
  restConfig: SupabaseRestConfig,
  connection: ConnectionRow,
  userId: string,
): Promise<ConnectionSyncOutcome> {
  const item = await pluggyClient.fetchItem(connection.pluggy_item_id as string);

  await upsertFinancialConnection(
    restConfig,
    buildConnectionUpsert(item, { userId }),
  );

  if (item.status !== "UPDATED") {
    return {
      connectionId: connection.id,
      itemStatus: item.status,
      accountsProcessed: 0,
      transactionsProcessed: 0,
      matchesCreated: 0,
      errorMessage: item.status === "LOGIN_ERROR" || item.status === "OUTDATED"
        ? `Item status is ${item.status}; skipping data fetch until resolved.`
        : null,
    };
  }

  console.log(`[sync-pluggy] Fetching accounts for connection ${connection.id}...`);
  const [accounts, categoryMap] = await Promise.all([
    pluggyClient.fetchAccounts(item.id),
    fetchPluggyCategoryMap(restConfig),
  ]);
  let transactionsProcessed = 0;
  let matchesCreated = 0;

  for (const account of accounts) {
    const accountRow = await upsertFinancialAccount(
      restConfig,
      normalizeAccount(account, { userId, connectionId: connection.id }),
    );

    const transactions = await pluggyClient.fetchTransactions(account.id);
    const normalizedTransactions = transactions.map((transaction) =>
      normalizeTransaction(transaction, {
        userId,
        connectionId: connection.id,
        accountId: accountRow.id,
        categoryMap,
      })
    );

    transactionsProcessed += await upsertImportedTransactions(
      restConfig,
      normalizedTransactions,
    );

    await markMissingTransactionsDeleted(
      restConfig,
      accountRow.id,
      transactions.map((transaction) => transaction.id),
    );

    const autoMatchOutcomes = await runAutoMatch(restConfig, {
      userId,
      accountId: accountRow.id,
    });
    matchesCreated += autoMatchOutcomes.length;
  }

  console.log(
    `[sync-pluggy] Connection ${connection.id}: ${accounts.length} accounts, ${transactionsProcessed} transactions, ${matchesCreated} auto-matches.`,
  );

  return {
    connectionId: connection.id,
    itemStatus: item.status,
    accountsProcessed: accounts.length,
    transactionsProcessed,
    matchesCreated,
    errorMessage: null,
  };
}

/**
 * Cron-triggered path: authenticated by the service-role key itself (the
 * shared secret pg_cron's net.http_post call is configured with), so there is
 * no end user in context. Syncs every active connection across every user in
 * one batch and records a single sync_events row with user_id null — the
 * sync_events_owner_read RLS policy (`user_id = auth.uid()`) never matches
 * null, so scheduled events stay invisible to every client.
 */
async function runScheduledSync(
  restConfig: SupabaseRestConfig,
  pluggyClientId: string | null,
  pluggyClientSecret: string | null,
  pluggyBaseUrl: string,
): Promise<Response> {
  if (!pluggyClientId || !pluggyClientSecret) {
    const failedEvent = await insertSyncEvent(restConfig, {
      event_id: crypto.randomUUID(),
      user_id: null,
      event_type: "PLUGGY_SYNC_SCHEDULED",
      connection_id: null,
      processing_status: "FAILED",
      payload: {
        source: "sync-pluggy",
        mode: "scheduled",
        reason: "pluggy_credentials_not_configured",
      },
    });

    return jsonResponse(424, {
      syncEventId: failedEvent.id,
      status: failedEvent.processing_status,
      error: "pluggy_credentials_not_configured",
      message: "PLUGGY_CLIENT_ID/PLUGGY_CLIENT_SECRET are not set as function secrets.",
    });
  }

  const connections = await listActiveConnectionsForScheduledSync(restConfig);

  const pluggyClient = new PluggyClient({
    clientId: pluggyClientId,
    clientSecret: pluggyClientSecret,
    baseUrl: pluggyBaseUrl,
  });

  const outcomes: Array<ConnectionSyncOutcome & { userId: string }> = [];
  let hadError = false;

  for (const connection of connections) {
    try {
      outcomes.push({
        ...(await syncConnection(pluggyClient, restConfig, connection, connection.user_id)),
        userId: connection.user_id,
      });
    } catch (error) {
      hadError = true;
      const message = sanitizeConnectionSyncError(error);
      await markConnectionSyncFailed(restConfig, connection.id, message).catch(() => {});
      outcomes.push({
        connectionId: connection.id,
        itemStatus: "SYNC_ERROR",
        accountsProcessed: 0,
        transactionsProcessed: 0,
        matchesCreated: 0,
        errorMessage: message,
        userId: connection.user_id,
      });
    }
  }

  const accountsProcessed = outcomes.reduce((sum, o) => sum + o.accountsProcessed, 0);
  const transactionsProcessed = outcomes.reduce((sum, o) => sum + o.transactionsProcessed, 0);
  const matchesCreated = outcomes.reduce((sum, o) => sum + o.matchesCreated, 0);
  const status = hadError ? "FAILED" : "PROCESSED";

  const syncEvent = await insertSyncEvent(restConfig, {
    event_id: crypto.randomUUID(),
    user_id: null,
    event_type: "PLUGGY_SYNC_SCHEDULED",
    connection_id: null,
    processing_status: status,
    payload: {
      source: "sync-pluggy",
      mode: "scheduled",
      connectionsProcessed: connections.length,
      accountsProcessed,
      transactionsProcessed,
      matchesCreated,
      outcomes: outcomes as unknown as JsonValue,
    },
  });

  return jsonResponse(hadError ? 207 : 202, {
    syncEventId: syncEvent.id,
    status: syncEvent.processing_status,
    connectionsProcessed: connections.length,
    accountsProcessed,
    transactionsProcessed,
    matchesCreated,
  });
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST for sync-pluggy.",
    });
  }

  try {
    const supabaseUrl = readRequiredEnv("SUPABASE_URL");
    const anonKey = readRequiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const pluggyClientId = readOptionalEnv("PLUGGY_CLIENT_ID");
    const pluggyClientSecret = readOptionalEnv("PLUGGY_CLIENT_SECRET");
    const pluggyBaseUrl = readOptionalEnv("PLUGGY_BASE_URL") ?? "https://api.pluggy.ai";

    const restConfig: SupabaseRestConfig = { supabaseUrl, serviceRoleKey };

    const accessToken = getBearerToken(request);
    if (!accessToken) {
      return jsonResponse(401, {
        error: "missing_authorization",
        message: "Authorization bearer token is required.",
      });
    }

    const syncRequest = await parseSyncRequest(request);

    // pg_cron authenticates with the service-role key itself (see the
    // migration that schedules this function) — whoever holds that key
    // already has unrestricted DB access, so trusting it here as an
    // internal/system caller adds no new exposure.
    if (accessToken === serviceRoleKey) {
      if (syncRequest.mode !== "scheduled") {
        return jsonResponse(400, {
          error: "invalid_mode",
          message: "Service-role callers must set mode to 'scheduled'.",
        });
      }

      return await runScheduledSync(restConfig, pluggyClientId, pluggyClientSecret, pluggyBaseUrl);
    }

    const user = await readAuthenticatedUser(supabaseUrl, anonKey, accessToken);
    if (!user) {
      return jsonResponse(401, {
        error: "invalid_token",
        message: "Authenticated Supabase user could not be resolved.",
      });
    }

    await ensureProfile(restConfig, user);

    if (!pluggyClientId || !pluggyClientSecret) {
      const failedEvent = await insertSyncEvent(restConfig, {
        event_id: crypto.randomUUID(),
        user_id: user.id,
        event_type: "PLUGGY_SYNC_REQUESTED",
        connection_id: syncRequest.connectionId ?? null,
        processing_status: "FAILED",
        payload: {
          source: "sync-pluggy",
          mode: syncRequest.mode ?? "manual",
          reason: "pluggy_credentials_not_configured",
        },
      });

      return jsonResponse(424, {
        syncEventId: failedEvent.id,
        status: failedEvent.processing_status,
        error: "pluggy_credentials_not_configured",
        message: "PLUGGY_CLIENT_ID/PLUGGY_CLIENT_SECRET are not set as function secrets.",
      });
    }

    const connections = await listConnectionsToSync(
      restConfig,
      user.id,
      syncRequest.connectionId,
    );

    const pluggyClient = new PluggyClient({
      clientId: pluggyClientId,
      clientSecret: pluggyClientSecret,
      baseUrl: pluggyBaseUrl,
    });

    const outcomes: ConnectionSyncOutcome[] = [];
    let hadError = false;

    for (const connection of connections) {
      try {
        outcomes.push(
          await syncConnection(pluggyClient, restConfig, connection, user.id),
        );
      } catch (error) {
        hadError = true;
        const message = sanitizeConnectionSyncError(error);
        await markConnectionSyncFailed(restConfig, connection.id, message).catch(() => {});
        outcomes.push({
          connectionId: connection.id,
          itemStatus: "SYNC_ERROR",
          accountsProcessed: 0,
          transactionsProcessed: 0,
          matchesCreated: 0,
          errorMessage: message,
        });
      }
    }

    const accountsProcessed = outcomes.reduce((sum, o) => sum + o.accountsProcessed, 0);
    const transactionsProcessed = outcomes.reduce((sum, o) => sum + o.transactionsProcessed, 0);
    const matchesCreated = outcomes.reduce((sum, o) => sum + o.matchesCreated, 0);
    const status = hadError ? "FAILED" : "PROCESSED";

    const syncEvent = await insertSyncEvent(restConfig, {
      event_id: crypto.randomUUID(),
      user_id: user.id,
      event_type: "PLUGGY_SYNC_REQUESTED",
      connection_id: syncRequest.connectionId ?? null,
      processing_status: status,
      payload: {
        source: "sync-pluggy",
        mode: syncRequest.mode ?? "manual",
        connectionsProcessed: connections.length,
        accountsProcessed,
        transactionsProcessed,
        matchesCreated,
        outcomes: outcomes as unknown as JsonValue,
      },
    });

    return jsonResponse(hadError ? 207 : 202, {
      syncEventId: syncEvent.id,
      status: syncEvent.processing_status,
      accountsProcessed,
      transactionsProcessed,
      matchesCreated,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("sync-pluggy failed", error);

    return jsonResponse(500, {
      error: "internal_error",
      message: "Unable to complete the sync.",
    });
  }
});
