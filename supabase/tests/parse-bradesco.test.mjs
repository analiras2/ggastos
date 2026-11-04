import assert from "node:assert/strict";
import test from "node:test";

import { parseBradescoStatement } from "../functions/_shared/statements/parse-bradesco.ts";

function buildStatement(generatedAt, rows) {
  return [
    `Data: ${generatedAt}`,
    "Situação da Fatura: PAGO",
    "TITULAR TESTE ;;; 1234",
    "Data;Histórico;Valor(US$);Valor(R$);",
    ...rows,
  ].join("\n");
}

function parse(contents, invoiceMonth = null) {
  return parseBradescoStatement({ bank: "BRADESCO", contents, invoiceMonth });
}

test("keeps the generation year for purchases made before the generation date", () => {
  const statement = parse(
    buildStatement("22/10/2026 18:07:12", ["17/05;LOJA A;0,00;5,90", "05/01;LOJA B 5/12;0,00;37,80"]),
  );

  assert.deepEqual(
    statement.transactions.map((transaction) => transaction.postedAt),
    ["2026-05-17", "2026-01-05"],
  );
});

test("assigns the previous year to dates that would fall after the generation date", () => {
  const statement = parse(
    buildStatement("22/10/2026 18:07:12", ["10/12;LOJA C 6/10;0,00;160,00", "23/10;LOJA D;0,00;20,00"]),
  );

  assert.deepEqual(
    statement.transactions.map((transaction) => transaction.postedAt),
    ["2025-12-10", "2025-10-23"],
  );
  assert.deepEqual(
    statement.transactions.map((transaction) => transaction.competencyMonth),
    ["2025-12", "2025-10"],
  );
});

test("keeps purchases made on the generation day in the generation year", () => {
  const statement = parse(buildStatement("22/10/2026 18:07:12", ["22/10;LOJA E;0,00;10,00"]));

  assert.equal(statement.transactions[0].postedAt, "2026-10-22");
});

test("resolves the year from the end of the invoice month when the file has no generation date", () => {
  const statement = parse(
    ["Data;Histórico;Valor(US$);Valor(R$);", "15/01;LOJA F;0,00;10,00", "10/12;LOJA G;0,00;10,00"].join("\n"),
    "2026-01",
  );

  assert.deepEqual(
    statement.transactions.map((transaction) => transaction.postedAt),
    ["2026-01-15", "2025-12-10"],
  );
});

test("prefers the invoice month over the generation date of an old invoice", () => {
  const statement = parse(
    buildStatement("22/10/2026 18:07:12", ["10/10;LOJA I 3/10;0,00;10,00", "20/09;LOJA J 2/10;0,00;10,00"]),
    "2026-01",
  );

  assert.deepEqual(
    statement.transactions.map((transaction) => transaction.postedAt),
    ["2025-10-10", "2025-09-20"],
  );
});

test("moves back one year each time the listed dates start over", () => {
  const statement = parse(
    buildStatement("22/10/2026 18:07:12", [
      "10/01;LOJA K;0,00;10,00",
      "28/12;LOJA L;0,00;10,00",
      "10/12;LOJA M 6/10;0,00;10,00",
      "10/10;LOJA N 2/10;0,00;10,00",
      "15/12;LOJA O 1/12;0,00;10,00",
    ]),
  );

  assert.deepEqual(
    statement.transactions.map((transaction) => transaction.postedAt),
    ["2026-01-10", "2025-12-28", "2025-12-10", "2025-10-10", "2024-12-15"],
  );
});

test("keeps scheduled rows in the generation year", () => {
  const statement = parse(
    [
      "Data: 22/10/2026 18:07:12",
      "Data;Histórico;Valor(US$);Valor(R$);",
      "15/09;LOJA P;0,00;10,00",
      "Lançamentos programados;;;",
      "Data;Histórico;Valor(US$);Valor(R$);",
      "15/11;LOJA Q 2/3;0,00;10,00",
    ].join("\n"),
  );

  assert.deepEqual(
    statement.transactions.map((transaction) => [transaction.section, transaction.postedAt]),
    [["CURRENT_INVOICE", "2026-09-15"], ["SCHEDULED", "2026-11-15"]],
  );
});

test("keeps dates that already include the year unchanged", () => {
  const statement = parse(buildStatement("22/10/2026 18:07:12", ["10/12/2025;LOJA H;0,00;10,00"]));

  assert.equal(statement.transactions[0].postedAt, "2025-12-10");
});

test("does not change the fingerprint of a transaction", () => {
  const statement = parse(buildStatement("22/10/2026 18:07:12", ["10/12;LOJA C 6/10;0,00;160,00"]));

  assert.match(statement.transactions[0].fingerprintInput, /^BRADESCO\|CURRENT_INVOICE\|\d+\|10\/12\|/);
});

const SALDO_DECEMBER = "15/12;SALDO ANTERIOR;0,00;6240,05";
const SALDO_SEPTEMBER = "15/09;SALDO ANTERIOR;0,00;6545,71";

function competencyMonths(statement) {
  return statement.transactions.map((transaction) => transaction.competencyMonth);
}

test("infers the invoice month from the previous balance date and sends installments there", () => {
  const statement = parse(
    buildStatement("22/10/2026 18:07:12", [
      SALDO_DECEMBER,
      "05/01;LOJA A;0,00;10,00",
      "20/12;LOJA C;0,00;20,00",
      "10/12;LOJA B 6/10;0,00;160,00",
    ]),
  );

  assert.equal(statement.metadata.invoiceMonth, "2026-01");
  assert.deepEqual(competencyMonths(statement), ["2026-01", "2025-12", "2026-01"]);
  assert.deepEqual(
    statement.transactions.map((transaction) => transaction.postedAt),
    ["2026-01-05", "2025-12-20", "2025-12-10"],
  );
});

test("keeps single purchases in the month of the purchase", () => {
  const statement = parse(
    buildStatement("22/10/2026 18:07:12", [SALDO_SEPTEMBER, "20/09;LOJA A;0,00;10,00", "15/08;LOJA B;0,00;10,00"]),
  );

  assert.equal(statement.metadata.invoiceMonth, "2026-10");
  assert.deepEqual(competencyMonths(statement), ["2026-09", "2026-08"]);
});

test("moves the invoice month into the next year when the previous balance is in December", () => {
  const statement = parse(buildStatement("20/12/2025 10:00:00", [SALDO_DECEMBER, "10/12;LOJA A 2/3;0,00;10,00"]));

  assert.equal(statement.metadata.invoiceMonth, "2026-01");
  assert.deepEqual(competencyMonths(statement), ["2026-01"]);
});

test("rolls the previous balance back a year when it would be after the generation date", () => {
  const statement = parse(buildStatement("10/01/2026 10:00:00", [SALDO_DECEMBER, "05/01;LOJA A 1/3;0,00;10,00"]));

  assert.equal(statement.metadata.invoiceMonth, "2026-01");
  assert.deepEqual(competencyMonths(statement), ["2026-01"]);
});

test("an explicit invoice month wins over the inferred one", () => {
  const statement = parse(
    buildStatement("22/10/2026 18:07:12", [SALDO_DECEMBER, "10/12;LOJA B 6/10;0,00;160,00"]),
    "2026-03",
  );

  assert.equal(statement.metadata.invoiceMonth, "2026-03");
  assert.deepEqual(competencyMonths(statement), ["2026-03"]);
});

test("without an invoice month installments keep the month of their date", () => {
  const withoutSaldo = parse(buildStatement("22/10/2026 18:07:12", ["10/12;LOJA B 6/10;0,00;160,00"]));
  const withoutGenerationDate = parse(
    ["Data;Histórico;Valor(US$);Valor(R$);", SALDO_DECEMBER, "10/12;LOJA B 6/10;0,00;160,00"].join("\n"),
  );

  assert.equal(withoutSaldo.metadata.invoiceMonth, null);
  assert.deepEqual(competencyMonths(withoutSaldo), ["2025-12"]);
  assert.equal(withoutGenerationDate.metadata.invoiceMonth, null);
});

test("the previous balance row is still skipped and never becomes a transaction", () => {
  const statement = parse(buildStatement("22/10/2026 18:07:12", [SALDO_DECEMBER, "05/01;LOJA A;0,00;10,00"]));

  assert.equal(statement.transactions.length, 1);
  assert.equal(statement.skippedRows.filter((row) => row.reason === "previous_balance").length, 1);
});

function withSituation(situation, lineEnding = "\n") {
  return ["Data: 22/10/2026 18:07:12", `Situação da Fatura: ${situation}`, "TITULAR TESTE ;;; 1234", "Data;Histórico;Valor(US$);Valor(R$);", "05/01;LOJA A;0,00;10,00"].join(lineEnding);
}

test("detects a paid statement from the situation line", () => {
  assert.equal(parse(withSituation("PAGO")).metadata.detectedPaymentStatus, "PAID");
  assert.equal(parse(withSituation("pago")).metadata.detectedPaymentStatus, "PAID");
});

test("detects the situation with every line ending used by the bank", () => {
  for (const lineEnding of ["\r\n", "\r", "\n"]) {
    assert.equal(parse(withSituation("PAGO", lineEnding)).metadata.detectedPaymentStatus, "PAID");
  }
});

test("any other situation means the statement is still open", () => {
  for (const situation of ["ABERTA", "EM ABERTO", "FECHADA"]) {
    assert.equal(parse(withSituation(situation)).metadata.detectedPaymentStatus, "OPEN");
  }
});

test("does not guess the situation when the line is missing or empty", () => {
  assert.equal(parse(buildStatement("22/10/2026 18:07:12", ["05/01;LOJA A;0,00;10,00"]).replace("Situação da Fatura: PAGO\n", "")).metadata.detectedPaymentStatus, null);
  assert.equal(parse(withSituation("")).metadata.detectedPaymentStatus, null);
});
