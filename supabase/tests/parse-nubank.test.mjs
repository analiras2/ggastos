import assert from "node:assert/strict";
import test from "node:test";

import { parseNubankStatement } from "../functions/_shared/statements/parse-nubank.ts";

const CONTENTS = [
  "date,title,amount",
  '2026-12-26,Loja X - Parcela 4/10,"89,47"',
  '2026-12-10,Mercado,"50,00"',
  '2026-12-05,Loja Y 2/3,"30,00"',
].join("\n");

function parse(options = {}) {
  return parseNubankStatement({ bank: "NUBANK", contents: CONTENTS, ...options });
}

function competencyMonths(statement) {
  return statement.transactions.map((transaction) => transaction.competencyMonth);
}

test("takes the invoice month from the file name and sends installments there", () => {
  const statement = parse({ fileName: "Nubank_2027-01-15.csv" });

  assert.equal(statement.metadata.invoiceMonth, "2027-01");
  assert.deepEqual(competencyMonths(statement), ["2027-01", "2026-12", "2027-01"]);
});

test("keeps the date of every row", () => {
  const statement = parse({ fileName: "Nubank_2027-01-15.csv" });

  assert.deepEqual(
    statement.transactions.map((transaction) => transaction.postedAt),
    ["2026-12-26", "2026-12-10", "2026-12-05"],
  );
});

test("an explicit invoice month wins over the file name", () => {
  const statement = parse({ fileName: "Nubank_2027-01-15.csv", invoiceMonth: "2027-02" });

  assert.equal(statement.metadata.invoiceMonth, "2027-02");
  assert.deepEqual(competencyMonths(statement), ["2027-02", "2026-12", "2027-02"]);
});

test("without any invoice month installments keep the month of their date", () => {
  for (const fileName of [undefined, null, "fatura.csv"]) {
    const statement = parse({ fileName });

    assert.equal(statement.metadata.invoiceMonth, null);
    assert.deepEqual(competencyMonths(statement), ["2026-12", "2026-12", "2026-12"]);
  }
});

test("ignores file names with an impossible month", () => {
  const statement = parse({ fileName: "Nubank_2027-13-15.csv" });

  assert.equal(statement.metadata.invoiceMonth, null);
});
