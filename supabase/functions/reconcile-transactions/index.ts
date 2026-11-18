// Records a reconciliation decision (confirm, reject or undo). This file only handles HTTP,
// authentication and errors; the rules live in _shared/reconciliation/.
import {
  jsonResponse,
  methodNotAllowedResponse,
  preflightResponse,
  readJsonBody,
} from "../_shared/http.ts";
import {
  confirmMatch,
  rejectMatch,
  undoMatch,
  ReconciliationDecisionError,
} from "../_shared/reconciliation/decisions.ts";
import { parseDecisionRequest } from "../_shared/reconciliation/request.ts";
import { authenticateRequest } from "../_shared/request-context.ts";

const HTTP_NOT_FOUND = 404;
const HTTP_CONFLICT = 409;

function decisionErrorStatus(code: ReconciliationDecisionError["code"]): number {
  return code === "not_found" ? HTTP_NOT_FOUND : HTTP_CONFLICT;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return preflightResponse("POST");
  }

  if (request.method !== "POST") {
    return methodNotAllowedResponse("POST", "reconcile-transactions");
  }

  try {
    const auth = await authenticateRequest(request, Deno.env);
    if (!auth.ok) {
      return auth.response;
    }
    const { user, restConfig } = auth.value;

    const body = await readJsonBody(request);
    if (!body.ok) {
      return body.response;
    }

    const decision = parseDecisionRequest(body.value);
    if (!decision.ok) {
      return jsonResponse(400, { error: decision.error, message: decision.message });
    }

    const { action, plannedEntryId, transactionId } = decision.value;
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
