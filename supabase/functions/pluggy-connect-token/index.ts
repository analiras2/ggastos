import { PluggyApiError, PluggyAuthError, PluggyClient } from "../_shared/pluggy-client.ts";
import { supabaseRest, type SupabaseRestConfig } from "../_shared/supabase-rest.ts";
import { getBearerToken, readAuthenticatedUser } from "../_shared/auth.ts";

type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

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
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
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

async function parseConnectionId(request: Request): Promise<string | null> {
  const rawBody = await request.text();
  if (rawBody.trim().length === 0) {
    return null;
  }

  let body: unknown;
  try {
    body = JSON.parse(rawBody);
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

  const connectionId = (body as Record<string, unknown>).connectionId;
  if (connectionId === undefined || connectionId === null) {
    return null;
  }

  if (typeof connectionId !== "string" || !isUuid(connectionId)) {
    throw jsonResponse(400, {
      error: "invalid_connection_id",
      message: "connectionId must be a UUID string when provided.",
    });
  }

  return connectionId;
}

async function findOwnedItemId(
  config: SupabaseRestConfig,
  userId: string,
  connectionId: string,
): Promise<string> {
  const params = new URLSearchParams({
    select: "pluggy_item_id",
    id: `eq.${connectionId}`,
    user_id: `eq.${userId}`,
  });

  const rows = await supabaseRest<Array<{ pluggy_item_id: string | null }>>(
    config,
    `/rest/v1/financial_connections?${params.toString()}`,
    { method: "GET" },
  );

  const itemId = rows[0]?.pluggy_item_id;
  if (!itemId) {
    throw jsonResponse(404, {
      error: "connection_not_found",
      message: "connectionId was not found for the authenticated user.",
    });
  }

  return itemId;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST for pluggy-connect-token.",
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

    const user = await readAuthenticatedUser(supabaseUrl, anonKey, accessToken);
    if (!user) {
      return jsonResponse(401, {
        error: "invalid_token",
        message: "Authenticated Supabase user could not be resolved.",
      });
    }

    const connectionId = await parseConnectionId(request);

    if (!pluggyClientId || !pluggyClientSecret) {
      return jsonResponse(424, {
        error: "pluggy_credentials_not_configured",
        message: "PLUGGY_CLIENT_ID/PLUGGY_CLIENT_SECRET are not set as function secrets.",
      });
    }

    const pluggyClient = new PluggyClient({
      clientId: pluggyClientId,
      clientSecret: pluggyClientSecret,
      baseUrl: pluggyBaseUrl,
    });

    const itemId = connectionId
      ? await findOwnedItemId(restConfig, user.id, connectionId)
      : undefined;

    const { accessToken: connectToken } = await pluggyClient.createConnectToken({
      clientUserId: user.id,
      itemId,
    });

    return jsonResponse(200, {
      connectToken,
      ...(itemId ? { itemId } : {}),
    });
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    if (error instanceof PluggyAuthError) {
      return jsonResponse(424, {
        error: "pluggy_auth_error",
        message: error.message,
      });
    }

    if (error instanceof PluggyApiError) {
      return jsonResponse(502, {
        error: "pluggy_api_error",
        message: error.message,
      });
    }

    console.error("pluggy-connect-token failed", error);

    return jsonResponse(500, {
      error: "internal_error",
      message: "Unable to create a connect token.",
    });
  }
});
