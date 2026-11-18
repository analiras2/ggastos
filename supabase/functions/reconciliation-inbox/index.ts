// Lists the reconciliation suggestions of a month. This file only handles HTTP, authentication
// and errors; the rules live in _shared/reconciliation/.
import { jsonResponse, methodNotAllowedResponse, preflightResponse } from "../_shared/http.ts";
import { listReconciliationInbox } from "../_shared/reconciliation/inbox.ts";
import { authenticateRequest } from "../_shared/request-context.ts";
import { isMonthKey } from "../_shared/validation.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return preflightResponse("GET");
  }

  if (request.method !== "GET") {
    return methodNotAllowedResponse("GET", "reconciliation-inbox");
  }

  try {
    const auth = await authenticateRequest(request, Deno.env);
    if (!auth.ok) {
      return auth.response;
    }
    const { user, restConfig } = auth.value;

    const month = new URL(request.url).searchParams.get("month");
    if (!isMonthKey(month)) {
      return jsonResponse(400, {
        error: "invalid_month",
        message: "Query parameter 'month' is required in AAAA-MM format.",
      });
    }

    const suggestions = await listReconciliationInbox(restConfig, { userId: user.id, month });

    return jsonResponse(200, { month, suggestions });
  } catch (error) {
    console.error("reconciliation-inbox failed", error);
    return jsonResponse(500, {
      error: "internal_error",
      message: "Unable to load the reconciliation inbox.",
    });
  }
});
