import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import {
  foldText,
  merchantKey,
  normalizeMerchantText,
} from "../functions/_shared/statements/merchant-key.ts";
import {
  foldText as appFoldText,
  merchantKey as appMerchantKey,
  normalizeMerchantText as appNormalizeMerchantText,
} from "../../mobile/src/features/statements/merchant-key.ts";

const SHARED_PATH = new URL("../functions/_shared/statements/merchant-key.ts", import.meta.url);
const APP_PATH = new URL("../../mobile/src/features/statements/merchant-key.ts", import.meta.url);

const KEY_CASES = [
  ["Netflix.com", "netflix.com"],
  ["  CAFÉ   da  Ana 3/10 ", "cafe da ana"],
  ["Jim.Com* Enos Massare - Parcela 4/10", "jim.com* enos massare"],
  ["LOJA XYZ 10/12", "loja xyz"],
  ["LOJA XYZ10/12", "loja xyz"],
  ["MP*UBER TRIP", "uber trip"],
  ["MP *Loja Legal 2/3", "loja legal"],
  ["IFD*RESTAURANTE X", "restaurante x"],
  ["PICPAY*Padaria", "padaria"],
  ["UBER *TRIP", "uber *trip"],
  ["Compra em 10/12/2025", "compra em 10/12/2025"],
  ["PIX", null],
  ["  pix  ", null],
  ["Compra", null],
  ["ab", null],
  ["3/10", null],
  ["", null],
];

for (const [description, expected] of KEY_CASES) {
  test(`merchantKey(${JSON.stringify(description)}) is ${JSON.stringify(expected)}`, () => {
    assert.equal(merchantKey(description), expected);
    assert.equal(appMerchantKey(description), expected);
  });
}

test("normalizeMerchantText keeps generic values so existing rules keep matching", () => {
  assert.equal(normalizeMerchantText("PIX"), "pix");
  assert.equal(normalizeMerchantText("Loja XYZ 3/10"), "loja xyz");
  assert.equal(appNormalizeMerchantText("Loja XYZ 3/10"), "loja xyz");
});

test("foldText lowercases, removes accents and collapses spaces without dropping installments", () => {
  assert.equal(foldText("  Café   da Ana 3/10 "), "cafe da ana 3/10");
  assert.equal(appFoldText("  Café   da Ana 3/10 "), "cafe da ana 3/10");
});

test("the app copy stays identical to the shared module", () => {
  assert.equal(readFileSync(APP_PATH, "utf8"), readFileSync(SHARED_PATH, "utf8"));
});
