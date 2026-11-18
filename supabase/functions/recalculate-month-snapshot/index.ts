// Recalculates a month and closes it. This file only handles HTTP, authentication and errors;
// the work lives in _shared/closing/.
import {
  jsonResponse,
  methodNotAllowedResponse,
  preflightResponse,
  readJsonBody,
} from "../_shared/http.ts";
import {
  closeMonthSnapshot,
  fetchMonthDashboardAsUser,
  upsertMonthSnapshot,
} from "../_shared/closing/snapshot.ts";
import { authenticateRequest } from "../_shared/request-context.ts";
import { isMonthKey } from "../_shared/validation.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return preflightResponse("POST");
  }

  if (request.method !== "POST") {
    return methodNotAllowedResponse("POST", "recalculate-month-snapshot");
  }

  try {
    const auth = await authenticateRequest(request, Deno.env);
    if (!auth.ok) {
      return auth.response;
    }
    const { user, restConfig, supabaseUrl, anonKey, accessToken } = auth.value;

    const body = await readJsonBody(request);
    if (!body.ok) {
      return body.response;
    }

    const month = body.value.month;
    if (!isMonthKey(month)) {
      return jsonResponse(400, {
        error: "invalid_month",
        message: "Field 'month' is required in AAAA-MM format.",
      });
    }

    const dashboard = await fetchMonthDashboardAsUser(supabaseUrl, anonKey, accessToken, month);
    const snapshot = await upsertMonthSnapshot(restConfig, user.id, dashboard);
    const closedSnapshot = await closeMonthSnapshot(restConfig, snapshot.id);

    return jsonResponse(200, {
      id: closedSnapshot.id,
      month: closedSnapshot.month,
      status: closedSnapshot.status,
      computedAt: closedSnapshot.computed_at,
    });
  } catch (error) {
    console.error("recalculate-month-snapshot failed", error);
    return jsonResponse(500, {
      error: "internal_error",
      message: "Unable to recalculate the month snapshot.",
    });
  }
});
