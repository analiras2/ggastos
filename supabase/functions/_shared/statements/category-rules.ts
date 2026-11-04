import { foldText, normalizeMerchantText } from "./merchant-key.ts";

export type StatementCategoryRule = {
  ruleType: string;
  ruleValue: string;
  targetCategoryId: string;
  priority: number;
};

export function resolveStatementCategory(
  description: string,
  rules: readonly StatementCategoryRule[],
): string | null {
  const foldedDescription = foldText(description);
  if (!foldedDescription) {
    return null;
  }

  const matchingRule = rules
    .filter((rule) => {
      const normalizedRuleValue = normalizeMerchantText(rule.ruleValue);
      return (
        rule.ruleType === "DESCRIPTION_CONTAINS" &&
        normalizedRuleValue.length > 0 &&
        foldedDescription.includes(normalizedRuleValue)
      );
    })
    .sort((left, right) => left.priority - right.priority)[0];

  return matchingRule?.targetCategoryId ?? null;
}
