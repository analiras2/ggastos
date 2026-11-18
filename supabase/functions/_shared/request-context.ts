import { getBearerToken, readAuthenticatedUser, type AuthUser } from "./auth.ts";
import { jsonResponse, type Outcome } from "./http.ts";
import type { SupabaseRestConfig } from "./supabase-rest.ts";

type EnvReader = { get(name: string): string | undefined };

export type RequestContext = {
  supabaseUrl: string;
  anonKey: string;
  accessToken: string;
  user: AuthUser;
  // For queries that run with the service role, always filtered by the user's id.
  restConfig: SupabaseRestConfig;
};

export function readRequiredEnv(env: EnvReader, name: string): string {
  const value = env.get(name);
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

// Reads the function's settings and resolves the signed-in user from the bearer token.
// The outcome carries the 401 response when the token is missing or invalid.
export async function authenticateRequest(
  request: Request,
  env: EnvReader,
): Promise<Outcome<RequestContext>> {
  const supabaseUrl = readRequiredEnv(env, "SUPABASE_URL");
  const anonKey = readRequiredEnv(env, "SUPABASE_ANON_KEY");
  const serviceRoleKey = readRequiredEnv(env, "SUPABASE_SERVICE_ROLE_KEY");

  const accessToken = getBearerToken(request);
  if (!accessToken) {
    return {
      ok: false,
      response: jsonResponse(401, {
        error: "missing_authorization",
        message: "Authorization bearer token is required.",
      }),
    };
  }

  const user = await readAuthenticatedUser(supabaseUrl, anonKey, accessToken);
  if (!user) {
    return {
      ok: false,
      response: jsonResponse(401, {
        error: "invalid_token",
        message: "Authenticated Supabase user could not be resolved.",
      }),
    };
  }

  return {
    ok: true,
    value: { supabaseUrl, anonKey, accessToken, user, restConfig: { supabaseUrl, serviceRoleKey } },
  };
}
