// Imports a Nubank or Bradesco card statement (CSV). This file only handles HTTP, authentication
// and errors; the import itself lives in _shared/statement-import/.
import { getBearerToken, readAuthenticatedUser } from "../_shared/auth.ts";
import { corsHeaders, jsonResponse } from "../_shared/http.ts";
import { parseImportRequest } from "../_shared/statement-import/request.ts";
import { runStatementImport } from "../_shared/statement-import/run-import.ts";
import type { SupabaseRestConfig } from "../_shared/supabase-rest.ts";

declare const Deno: {
  env: {
    get(name: string): string | undefined;
  };
  serve(handler: (request: Request) => Response | Promise<Response>): void;
};

function readRequiredEnv(name: string): string {
  const value = Deno.env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }

  return value;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  if (request.method !== "POST") {
    return jsonResponse(405, {
      error: "method_not_allowed",
      message: "Use POST to import a card statement.",
    });
  }

  try {
    const supabaseUrl = readRequiredEnv("SUPABASE_URL");
    const anonKey = readRequiredEnv("SUPABASE_ANON_KEY");
    const serviceRoleKey = readRequiredEnv("SUPABASE_SERVICE_ROLE_KEY");
    const config: SupabaseRestConfig = { supabaseUrl, serviceRoleKey };

    const accessToken = getBearerToken(request);
    if (!accessToken) {
      return jsonResponse(401, {
        error: "missing_auth",
        message: "Authorization bearer token is required.",
      });
    }

    const user = await readAuthenticatedUser(supabaseUrl, anonKey, accessToken);
    if (!user) {
      return jsonResponse(401, {
        error: "invalid_auth",
        message: "Authorization bearer token is invalid or expired.",
      });
    }

    const importRequest = await parseImportRequest(request);
    const outcome = await runStatementImport(config, user, importRequest);
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
