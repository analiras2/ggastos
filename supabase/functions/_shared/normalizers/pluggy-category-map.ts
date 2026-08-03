import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";

type CategoryMapRow = {
  pluggy_category_name: string;
  categories: { id: string } | null;
};

/**
 * Maps Pluggy's (always-English) category names to our internal category
 * IDs, via the `pluggy_category_map` reference table (see STATE.md L-003).
 * Names with no mapping row simply don't appear in the returned Map.
 */
export async function fetchPluggyCategoryMap(
  config: SupabaseRestConfig,
): Promise<Map<string, string>> {
  const params = new URLSearchParams({
    select: "pluggy_category_name,categories(id)",
  });
  const rows = await supabaseRest<CategoryMapRow[]>(
    config,
    `/rest/v1/pluggy_category_map?${params.toString()}`,
    { method: "GET" },
  );

  const map = new Map<string, string>();
  for (const row of rows) {
    if (row.categories) {
      map.set(row.pluggy_category_name, row.categories.id);
    }
  }
  return map;
}
