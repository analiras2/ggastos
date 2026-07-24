import { getBearerToken, readAuthenticatedUser } from "../_shared/auth.ts";
import {
  fetchMonthDashboardAsUser,
  upsertMonthSnapshot,
} from "../_shared/closing/snapshot.ts";
import type { SupabaseRestConfig } from "../_shared/supabase-rest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
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

  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST for recalculate-month-snapshot.",
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

    let body: Record<string, unknown>;
    try {
      body = await request.json();
    } catch {
      return jsonResponse(400, {
        error: "invalid_body",
        message: "Request body must be valid JSON.",
      });
    }

    const month = body.month;
    if (typeof month !== "string" || !MONTH_PATTERN.test(month)) {
      return jsonResponse(400, {
        error: "invalid_month",
        message: "Field 'month' is required in AAAA-MM format.",
      });
    }

    const dashboard = await fetchMonthDashboardAsUser(
      supabaseUrl,
      anonKey,
      accessToken,
      month,
    );
    const snapshot = await upsertMonthSnapshot(restConfig, user.id, dashboard);

    return jsonResponse(200, {
      id: snapshot.id,
      month: snapshot.month,
      status: snapshot.status,
      computedAt: snapshot.computed_at,
    });
  } catch (error) {
    console.error("recalculate-month-snapshot failed", error);
    return jsonResponse(500, {
      error: "internal_error",
      message: "Unable to recalculate the month snapshot.",
    });
  }
});
