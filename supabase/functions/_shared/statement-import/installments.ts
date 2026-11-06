import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";

// Plans the remaining installments of the purchases found in this statement. The import itself
// already succeeded, so a failure here is logged instead of failing the whole request.
export async function planFutureInstallments(
  config: SupabaseRestConfig,
  userId: string,
  batchId: string,
): Promise<number> {
  try {
    const created = await supabaseRest<number>(config, "/rest/v1/rpc/plan_future_installments", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ p_user_id: userId, p_batch_id: batchId }),
    });
    return typeof created === "number" ? created : 0;
  } catch (error) {
    console.error("plan_future_installments failed", error);
    return 0;
  }
}
