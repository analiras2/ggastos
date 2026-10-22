import { getBearerToken, readAuthenticatedUser } from "../_shared/auth.ts";
import { listReconciliationInbox } from "../_shared/reconciliation/inbox.ts";
import type { SupabaseRestConfig } from "../_shared/supabase-rest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Content-Type": "application/json",
};

const MONTH_PATTERN = /^[0-9]{4}-(0[1-9]|1[0-2])$/;

function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), { status, headers: corsHeaders });
}

function readRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "GET") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use GET for reconciliation-inbox.",
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

    const month = new URL(request.url).searchParams.get("month");
    if (!month || !MONTH_PATTERN.test(month)) {
      return jsonResponse(400, {
        error: "invalid_month",
        message: "Query parameter 'month' is required in AAAA-MM format.",
      });
    }

    const suggestions = await listReconciliationInbox(restConfig, {
      userId: user.id,
      month,
    });

    return jsonResponse(200, { month, suggestions });
  } catch (error) {
    console.error("reconciliation-inbox failed", error);
    return jsonResponse(500, {
      error: "internal_error",
      message: "Unable to load the reconciliation inbox.",
    });
  }
});
