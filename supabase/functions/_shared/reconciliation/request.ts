import type { ReconciliationAction } from "./decisions.ts";

export const RECONCILIATION_ACTIONS: readonly ReconciliationAction[] = ["confirm", "reject", "undo"];

export type DecisionRequest = {
  action: ReconciliationAction;
  plannedEntryId: string;
  transactionId: string;
};

export type DecisionRequestResult =
  | { ok: true; value: DecisionRequest }
  | { ok: false; error: string; message: string };

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.length > 0;
}

// Checks the body of a reconciliation decision: which action, on which planned entry and transaction.
export function parseDecisionRequest(payload: Record<string, unknown>): DecisionRequestResult {
  const { action, plannedEntryId, transactionId } = payload;

  if (typeof action !== "string" || !RECONCILIATION_ACTIONS.includes(action as ReconciliationAction)) {
    return {
      ok: false,
      error: "invalid_action",
      message: `Field 'action' must be one of: ${RECONCILIATION_ACTIONS.join(", ")}.`,
    };
  }
  if (!isNonEmptyString(plannedEntryId)) {
    return { ok: false, error: "invalid_planned_entry_id", message: "Field 'plannedEntryId' is required." };
  }
  if (!isNonEmptyString(transactionId)) {
    return { ok: false, error: "invalid_transaction_id", message: "Field 'transactionId' is required." };
  }

  return { ok: true, value: { action: action as ReconciliationAction, plannedEntryId, transactionId } };
}
