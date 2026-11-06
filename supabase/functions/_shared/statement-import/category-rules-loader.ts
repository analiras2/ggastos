import type { StatementCategoryRule } from "../statements/category-rules.ts";
import { supabaseRest, type SupabaseRestConfig } from "../supabase-rest.ts";

type UserCategoryRuleRow = {
  rule_type: string;
  rule_value: string;
  target_category_id: string;
  priority: number;
};

type ActiveCategoryRow = { id: string };

// The user's active category rules, skipping the ones that point at a deactivated category.
export async function loadStatementCategoryRules(
  config: SupabaseRestConfig,
  userId: string,
): Promise<StatementCategoryRule[]> {
  const params = new URLSearchParams({
    select: "rule_type,rule_value,target_category_id,priority",
    user_id: `eq.${userId}`,
    is_active: "eq.true",
    order: "priority.asc,created_at.asc",
  });
  const rows = await supabaseRest<UserCategoryRuleRow[]>(
    config,
    `/rest/v1/user_category_rules?${params.toString()}`,
    { method: "GET" },
  );

  if (rows.length === 0) {
    return [];
  }

  const categoryIds = [...new Set(rows.map((rule) => rule.target_category_id))];
  const activeCategoryParams = new URLSearchParams({
    select: "id",
    id: `in.(${categoryIds.join(",")})`,
    is_active: "eq.true",
  });
  const activeCategories = await supabaseRest<ActiveCategoryRow[]>(
    config,
    `/rest/v1/categories?${activeCategoryParams.toString()}`,
    { method: "GET" },
  );
  const activeCategoryIds = new Set(activeCategories.map((category) => category.id));

  return rows
    .filter((rule) => activeCategoryIds.has(rule.target_category_id))
    .map((rule) => ({
      ruleType: rule.rule_type,
      ruleValue: rule.rule_value,
      targetCategoryId: rule.target_category_id,
      priority: rule.priority,
    }));
}
