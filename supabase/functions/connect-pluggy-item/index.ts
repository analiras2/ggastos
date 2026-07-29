import { PluggyApiError, PluggyAuthError, PluggyClient } from "../_shared/pluggy-client.ts";
import { buildConnectionUpsert, upsertFinancialConnection } from "../_shared/upsert.ts";
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

async function parseItemId(request: Request): Promise<string> {
  const rawBody = await request.text();
  let body: unknown = {};

  if (rawBody.trim().length > 0) {
    try {
      body = JSON.parse(rawBody);
    } catch {
      throw jsonResponse(400, {
        error: "invalid_json",
        message: "Request body must be valid JSON.",
      });
    }
  }

  if (!body || typeof body !== "object" || Array.isArray(body)) {
    throw jsonResponse(400, {
      error: "invalid_body",
      message: "Request body must be a JSON object.",
    });
  }

  const itemId = (body as Record<string, unknown>).itemId;
  if (typeof itemId !== "string" || itemId.trim().length === 0) {
    throw jsonResponse(400, {
      error: "invalid_item_id",
      message: "itemId is required.",
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
      message: "Use POST for connect-pluggy-item.",
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

    const itemId = await parseItemId(request);

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

    // The Connect Widget already created/updated the Item on Pluggy's side
    // (via its own connect token). This just fetches its current state and
    // persists our financial_connections row — same upsert path sync-pluggy
    // uses, keyed on pluggy_item_id, so it's safe to call more than once.
    const item = await pluggyClient.fetchItem(itemId);

    const connection = await upsertFinancialConnection(
      restConfig,
      buildConnectionUpsert(item, { userId: user.id }),
    );

    return jsonResponse(200, {
      connectionId: connection.id,
      itemId: item.id,
      status: item.status,
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

    console.error("connect-pluggy-item failed", error);

    return jsonResponse(500, {
      error: "internal_error",
      message: "Unable to link the connection.",
    });
  }
});
