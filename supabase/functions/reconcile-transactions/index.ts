import { getBearerToken, readAuthenticatedUser } from "../_shared/auth.ts";
import {
  confirmMatch,
  rejectMatch,
  undoMatch,
  ReconciliationDecisionError,
  type ReconciliationAction,
} from "../_shared/reconciliation/decisions.ts";
import type { SupabaseRestConfig } from "../_shared/supabase-rest.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const VALID_ACTIONS: ReconciliationAction[] = ["confirm", "reject", "undo"];

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

function decisionErrorStatus(code: ReconciliationDecisionError["code"]): number {
  if (code === "not_found") {
    return 404;
  }
  return 409;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST for reconcile-transactions.",
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

    let payload: Record<string, unknown>;
    try {
      payload = await request.json();
    } catch {
      return jsonResponse(400, {
        error: "invalid_body",
        message: "Request body must be valid JSON.",
      });
    }

    const action = payload.action;
    const plannedEntryId = payload.plannedEntryId;
    const transactionId = payload.transactionId;

    if (
      typeof action !== "string" ||
      !VALID_ACTIONS.includes(action as ReconciliationAction)
    ) {
      return jsonResponse(400, {
        error: "invalid_action",
        message: `Field 'action' must be one of: ${VALID_ACTIONS.join(", ")}.`,
      });
    }
    if (typeof plannedEntryId !== "string" || plannedEntryId.length === 0) {
      return jsonResponse(400, {
        error: "invalid_planned_entry_id",
        message: "Field 'plannedEntryId' is required.",
      });
    }
    if (typeof transactionId !== "string" || transactionId.length === 0) {
      return jsonResponse(400, {
        error: "invalid_transaction_id",
        message: "Field 'transactionId' is required.",
      });
    }

    const pair = { plannedEntryId, transactionId };

    if (action === "confirm") {
      await confirmMatch(restConfig, user.id, pair);
    } else if (action === "reject") {
      await rejectMatch(restConfig, user.id, pair);
    } else {
      await undoMatch(restConfig, user.id, pair);
    }

    return jsonResponse(200, { action, plannedEntryId, transactionId, status: "ok" });
  } catch (error) {
    if (error instanceof ReconciliationDecisionError) {
      return jsonResponse(decisionErrorStatus(error.code), {
        error: error.code,
        message: error.message,
      });
    }
    console.error("reconcile-transactions failed", error);
    return jsonResponse(500, {
      error: "internal_error",
      message: "Unable to process the reconciliation decision.",
    });
  }
});
