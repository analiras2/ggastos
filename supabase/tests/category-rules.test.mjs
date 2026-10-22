import assert from "node:assert/strict";
import test from "node:test";

import { resolveStatementCategory } from "../functions/_shared/statements/category-rules.ts";

test("uses the lowest-priority DESCRIPTION_CONTAINS rule that matches the statement description", () => {
  const categoryId = resolveStatementCategory("Netflix.com", [
    {
      ruleType: "DESCRIPTION_CONTAINS",
      ruleValue: "netflix",
      targetCategoryId: "00000000-0000-4000-8000-000000000001",
      priority: 20,
    },
    {
      ruleType: "DESCRIPTION_CONTAINS",
      ruleValue: "net",
      targetCategoryId: "00000000-0000-4000-8000-000000000002",
      priority: 10,
    },
  ]);

  assert.equal(categoryId, "00000000-0000-4000-8000-000000000002");
});

test("does not infer a category from unsupported or empty rules", () => {
  const categoryId = resolveStatementCategory("Supermercado", [
    {
      ruleType: "MERCHANT_CNPJ",
      ruleValue: "12345678000100",
      targetCategoryId: "00000000-0000-4000-8000-000000000001",
      priority: 0,
    },
    {
      ruleType: "DESCRIPTION_CONTAINS",
      ruleValue: "   ",
      targetCategoryId: "00000000-0000-4000-8000-000000000002",
      priority: 1,
    },
  ]);

  assert.equal(categoryId, null);
});
