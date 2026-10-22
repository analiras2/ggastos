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
  const normalizedDescription = description.trim().toLocaleLowerCase("pt-BR");
  if (!normalizedDescription) {
    return null;
  }

  const matchingRule = rules
    .filter((rule) => {
      const normalizedRuleValue = rule.ruleValue.trim().toLocaleLowerCase("pt-BR");
      return (
        rule.ruleType === "DESCRIPTION_CONTAINS" &&
        normalizedRuleValue.length > 0 &&
        normalizedDescription.includes(normalizedRuleValue)
      );
    })
    .sort((left, right) => left.priority - right.priority)[0];

  return matchingRule?.targetCategoryId ?? null;
}
