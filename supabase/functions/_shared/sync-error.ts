import { PluggyApiError, PluggyAuthError } from "./pluggy-client.ts";

/**
 * Standardizes how a per-connection sync failure is described in
 * sync_events.payload — Pluggy's own rejection message for known Pluggy
 * errors, a generic fallback for anything else. Never includes stack traces,
 * request bodies, or credentials.
 */
export function sanitizeConnectionSyncError(error: unknown): string {
  if (error instanceof PluggyAuthError || error instanceof PluggyApiError) {
    return error.message;
  }
  return "Unexpected error while syncing this connection.";
}
