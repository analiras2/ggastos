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

type AuthUser = {
  id: string;
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
  app_metadata?: Record<string, unknown> | null;
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

function getBearerToken(request: Request): string | null {
  const authorization = request.headers.get("Authorization");
  if (!authorization) {
    return null;
  }

  const [scheme, token] = authorization.split(" ");
  if (scheme?.toLowerCase() !== "bearer" || !token) {
    return null;
  }

  return token;
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

async function readAuthenticatedUser(
  supabaseUrl: string,
  anonKey: string,
  accessToken: string,
): Promise<AuthUser | null> {
  const response = await fetch(`${supabaseUrl}/auth/v1/user`, {
    method: "GET",
    headers: {
      apikey: anonKey,
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 401 || response.status === 403) {
    return null;
  }

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Failed to validate authenticated user (${response.status}): ${errorText}`,
    );
  }

  return (await response.json()) as AuthUser;
}

async function restRequest<T>(
  supabaseUrl: string,
  serviceRoleKey: string,
  path: string,
  init: RequestInit,
): Promise<T> {
  const response = await fetch(`${supabaseUrl}${path}`, {
    ...init,
    headers: {
      apikey: serviceRoleKey,
      Authorization: `Bearer ${serviceRoleKey}`,
      ...init.headers,
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `Supabase REST request failed (${response.status}) for ${path}: ${errorText}`,
    );
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const responseText = await response.text();
  if (responseText.trim().length === 0) {
    return undefined as T;
  }

  return JSON.parse(responseText) as T;
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

async function ensureProfile(
  supabaseUrl: string,
  serviceRoleKey: string,
  user: AuthUser,
) {
  await restRequest<void>(
    supabaseUrl,
    serviceRoleKey,
    "/rest/v1/profiles?on_conflict=id",
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify(buildProfilePayload(user)),
    },
  );
}

async function ensureConnectionOwnership(
  supabaseUrl: string,
  serviceRoleKey: string,
  connectionId: string | null,
  userId: string,
) {
  if (!connectionId) {
    return;
  }

  const params = new URLSearchParams({
    select: "id",
    id: `eq.${connectionId}`,
    user_id: `eq.${userId}`,
    limit: "1",
  });
  const rows = await restRequest<Array<{ id: string }>>(
    supabaseUrl,
    serviceRoleKey,
    `/rest/v1/financial_connections?${params.toString()}`,
    { method: "GET" },
  );

  if (rows.length === 0) {
    throw new Response(
      JSON.stringify({
        error: "connection_not_found",
        message: "connectionId was not found for the authenticated user.",
      }),
      { status: 404, headers: corsHeaders },
    );
  }
}

async function insertSyncEvent(
  supabaseUrl: string,
  serviceRoleKey: string,
  event: SyncEventInsert,
) {
  const rows = await restRequest<SyncEventRow[]>(
    supabaseUrl,
    serviceRoleKey,
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
    const pluggyBaseUrl = readOptionalEnv("PLUGGY_BASE_URL");

    const accessToken = getBearerToken(request);
    if (!accessToken) {
      return jsonResponse(401, {
        error: "missing_authorization",
        message: "Authorization bearer token is required.",
      });
    }

    const user = await readAuthenticatedUser(
      supabaseUrl,
      anonKey,
      accessToken,
    );
    if (!user) {
      return jsonResponse(401, {
        error: "invalid_token",
        message: "Authenticated Supabase user could not be resolved.",
      });
    }

    const syncRequest = await parseSyncRequest(request);

    await ensureProfile(supabaseUrl, serviceRoleKey, user);
    await ensureConnectionOwnership(
      supabaseUrl,
      serviceRoleKey,
      syncRequest.connectionId ?? null,
      user.id,
    );

    const createdEvent = await insertSyncEvent(supabaseUrl, serviceRoleKey, {
      event_id: crypto.randomUUID(),
      user_id: user.id,
      event_type: "PLUGGY_SYNC_REQUESTED",
      connection_id: syncRequest.connectionId ?? null,
      processing_status: "RECEIVED",
      payload: {
        source: "sync-pluggy-stub",
        mode: syncRequest.mode ?? "manual",
        requested_by: "authenticated_user",
        requested_by_user_id: user.id,
        pluggy_credentials_present: {
          clientId: Boolean(pluggyClientId),
          clientSecret: Boolean(pluggyClientSecret),
          baseUrl: Boolean(pluggyBaseUrl),
        },
      },
    });

    return jsonResponse(202, {
      syncEventId: createdEvent.id,
      status: createdEvent.processing_status,
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    console.error("sync-pluggy failed", error);

    return jsonResponse(500, {
      error: "internal_error",
      message: "Unable to create the initial sync event.",
    });
  }
});
