import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

import { detectBank } from "./detect-bank.ts";
import { parseMercadoPagoStatement } from "./parse-mercado-pago.ts";

const FIXTURE = new URL(
  "../../../../.specs/features/card-statement-import/fixtures/mercado-pago-statement-sanitized.txt",
  import.meta.url,
);
const CONTENTS = readFileSync(FIXTURE, "utf-8");

function parse(contents = CONTENTS) {
  return parseMercadoPagoStatement({ bank: "MERCADO_PAGO", contents, fileName: "fatura.pdf" });
}

test("reads the purchases, skips the payment and takes the month from the due date", () => {
  const statement = parse();

  assert.deepEqual(statement.errors, []);
  assert.equal(statement.metadata.invoiceMonth, "2026-11");
  assert.equal(statement.metadata.invoiceDueDate, "2026-11-10");
  assert.equal(statement.transactions.length, 11);
  assert.equal(statement.skippedRows.length, 1);
  assert.equal(statement.skippedRows[0].reason, "payment_or_credit");
  assert.equal(
    statement.transactions.reduce((sum, transaction) => sum + transaction.amountCents, 0),
    65056,
  );
});

test("gives each date its year and sends installments to the invoice month", () => {
  const { transactions } = parse();

  assert.equal(transactions[0].postedAt, "2026-10-06");
  assert.equal(transactions[0].competencyMonth, "2026-10");
  const club = transactions.find((transaction) => transaction.description.startsWith("PETSUPERMARK"));
  assert.deepEqual(club.installment, { index: 7, total: 12 });
  assert.equal(club.postedAt, "2026-04-11");
  assert.equal(club.competencyMonth, "2026-11");
});

test("puts a December purchase of a January invoice in the year before", () => {
  const contents = CONTENTS.replace("10/11/2026", "10/01/2027").replace("06/10 FARMACIA UM", "20/12 FARMACIA UM");
  const [first] = parse(contents).transactions;

  assert.equal(first.postedAt, "2026-12-20");
});

test("keeps identical lines apart with different fingerprints", () => {
  const prints = parse().transactions.filter((t) => t.description === "PESSOA DOIS").map((t) => t.fingerprintInput);

  assert.equal(new Set(prints).size, 3);
});

test("fails instead of importing when the total does not match", () => {
  const statement = parse(CONTENTS.replace("Total R$ 650,56", "Total R$ 700,00"));

  assert.equal(statement.errors[0].code, "total_mismatch");
});

test("fails on a text that is not a statement", () => {
  assert.equal(parse("qualquer coisa").errors[0].code, "unsupported_format");
});

test("recognizes the bank of each kind of file", () => {
  assert.equal(detectBank(CONTENTS), "MERCADO_PAGO");
  assert.equal(detectBank("date,title,amount\n2026-12-10,Mercado,50,00"), "NUBANK");
  assert.equal(detectBank("Data;Histórico;Valor(US$);Valor(R$)\n10/12;LOJA;0,00;10,00"), "BRADESCO");
  assert.equal(detectBank("nada a ver"), null);
});
