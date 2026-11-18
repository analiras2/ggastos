export type JsonValue =
  | string
  | number
  | boolean
  | null
  | { [key: string]: JsonValue }
  | JsonValue[];

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

export function jsonResponse(status: number, body: Record<string, unknown>) {
  return new Response(JSON.stringify(body), {
    status,
    headers: corsHeaders,
  });
}

// Answer to the browser's preflight request, advertising the one method the function accepts.
export function preflightResponse(allowedMethod: "GET" | "POST" = "POST") {
  return new Response(null, {
    status: 204,
    headers: { ...corsHeaders, "Access-Control-Allow-Methods": `${allowedMethod}, OPTIONS` },
  });
}

export function methodNotAllowedResponse(allowedMethod: string, functionName: string) {
  return jsonResponse(405, {
    error: "method_not_allowed",
    message: `Use ${allowedMethod} for ${functionName}.`,
  });
}

// Either a value or the HTTP response that explains why it could not be produced.
export type Outcome<T> = { ok: true; value: T } | { ok: false; response: Response };

export async function readJsonBody(request: Request): Promise<Outcome<Record<string, unknown>>> {
  try {
    return { ok: true, value: await request.json() };
  } catch {
    return {
      ok: false,
      response: jsonResponse(400, {
        error: "invalid_body",
        message: "Request body must be valid JSON.",
      }),
    };
  }
}
