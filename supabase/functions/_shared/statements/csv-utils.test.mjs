import assert from "node:assert/strict";
import test from "node:test";

import {
  decodeContents,
  detectLineEnding,
  parseAmountCents,
  parseDirection,
  parseInstallment,
} from "./csv-utils.ts";

test("decodeContents leaves text alone and decodes bytes with the bank's encoding", () => {
  const latin1 = new Uint8Array([0x43, 0x61, 0x66, 0xe9]); // "Café" in ISO-8859-1

  assert.equal(decodeContents("Café", "utf-8"), "Café");
  assert.equal(decodeContents(latin1, "iso-8859-1"), "Café");
  assert.equal(decodeContents(new TextEncoder().encode("Café"), "utf-8"), "Café");
});

test("detectLineEnding tells CRLF, LF and CR apart", () => {
  assert.equal(detectLineEnding("a\r\nb"), "CRLF");
  assert.equal(detectLineEnding("a\nb"), "LF");
  assert.equal(detectLineEnding("a\rb"), "CR");
  assert.equal(detectLineEnding("a b"), "UNKNOWN");
});

test("parseAmountCents reads Brazilian amounts and ignores the sign", () => {
  assert.equal(parseAmountCents("1.234,56"), 123456);
  assert.equal(parseAmountCents("12,5"), 1250);
  assert.equal(parseAmountCents("-30,00"), 3000);
  assert.equal(parseAmountCents("  7 "), 700);
});

test("parseAmountCents is null when the text is not an amount", () => {
  assert.equal(parseAmountCents("abc"), null);
  assert.equal(parseAmountCents(""), null);
  assert.equal(parseAmountCents("12,345"), null);
});

test("a leading minus is a credit and anything else is a debit", () => {
  assert.equal(parseDirection("-10,00"), "CREDIT");
  assert.equal(parseDirection("  -10,00"), "CREDIT");
  assert.equal(parseDirection("10,00"), "DEBIT");
});

test("parseInstallment reads index and total from the description", () => {
  assert.deepEqual(parseInstallment("LOJA XYZ 3/10"), { index: 3, total: 10 });
  assert.deepEqual(parseInstallment("Parcela 12/12"), { index: 12, total: 12 });
});

test("parseInstallment ignores a description without one or with impossible values", () => {
  assert.equal(parseInstallment("MERCADO"), null);
  assert.equal(parseInstallment("LOJA 0/6"), null);
  assert.equal(parseInstallment("LOJA 7/6"), null);
});
