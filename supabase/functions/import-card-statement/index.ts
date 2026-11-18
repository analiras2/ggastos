// Imports a Nubank or Bradesco card statement (CSV). This file only handles HTTP, authentication
// and errors; the import itself lives in _shared/statement-import/.
import { jsonResponse, methodNotAllowedResponse, preflightResponse } from "../_shared/http.ts";
import { parseImportRequest } from "../_shared/statement-import/request.ts";
import { runStatementImport } from "../_shared/statement-import/run-import.ts";
import { authenticateRequest } from "../_shared/request-context.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return preflightResponse("POST");
  }

  if (request.method !== "POST") {
    return methodNotAllowedResponse("POST", "import-card-statement");
  }

  try {
    const auth = await authenticateRequest(request, Deno.env);
    if (!auth.ok) {
      return auth.response;
    }
    const { user, restConfig } = auth.value;

    const importRequest = await parseImportRequest(request);
    const outcome = await runStatementImport(restConfig, user, importRequest);
    return jsonResponse(outcome.status, outcome.body);
  } catch (error) {
    if (error instanceof Response) {
      return error;
    }

    const message = error instanceof Error ? error.message : "Unexpected import error.";
    return jsonResponse(500, {
      error: "import_failed",
      message,
    });
  }
});
