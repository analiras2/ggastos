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

const FOOD_CATEGORY_ID = "00000000-0000-4000-8000-000000000010";

function containsRule(ruleValue, targetCategoryId = FOOD_CATEGORY_ID) {
  return { ruleType: "DESCRIPTION_CONTAINS", ruleValue, targetCategoryId, priority: 0 };
}

test("matches rules ignoring case and accents", () => {
  assert.equal(resolveStatementCategory("Café da Ana", [containsRule("cafe da ana")]), FOOD_CATEGORY_ID);
  assert.equal(resolveStatementCategory("CAFE DA ANA", [containsRule("Café da Ana")]), FOOD_CATEGORY_ID);
});

test("an old rule saved with an installment suffix matches the next installment", () => {
  assert.equal(resolveStatementCategory("LOJA XYZ 4/10", [containsRule("LOJA XYZ 3/10")]), FOOD_CATEGORY_ID);
  assert.equal(
    resolveStatementCategory("Loja Xyz - Parcela 5/10", [containsRule("Loja Xyz - Parcela 4/10")]),
    FOOD_CATEGORY_ID,
  );
});

test("an old rule saved with a payment intermediary prefix matches the bare merchant", () => {
  assert.equal(resolveStatementCategory("UBER TRIP", [containsRule("MP*UBER")]), FOOD_CATEGORY_ID);
});

test("keeps matching existing generic rules", () => {
  assert.equal(resolveStatementCategory("PIX ENVIADO", [containsRule("PIX")]), FOOD_CATEGORY_ID);
});

test("does not match when the merchant differs", () => {
  assert.equal(resolveStatementCategory("OUTRA LOJA 4/10", [containsRule("LOJA XYZ 3/10")]), null);
});
