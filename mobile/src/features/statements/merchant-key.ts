// Shared by the import Edge Function and the app (mobile/src/features/statements/merchant-key.ts).
// Both files must stay identical; supabase/tests/merchant-key.test.mjs enforces it.

const MIN_MERCHANT_KEY_LENGTH = 3;
const INSTALLMENT_SUFFIX_PATTERN = /(?:\s*-\s*)?(?:parcela\s+)?(?<![\d/])\d{1,2}\/\d{1,2}$/;
const PAYMENT_INTERMEDIARY_PREFIX_PATTERN = /^(?:mp|ifd|picpay|pag)\s*\*\s*/;
const COMBINING_MARKS_PATTERN = /[̀-ͯ]/g;
const WHITESPACE_PATTERN = /\s+/g;

// Too generic to identify a merchant: a rule built from these would match unrelated purchases.
const GENERIC_MERCHANT_KEYS: ReadonlySet<string> = new Set([
  "pix",
  "ted",
  "doc",
  "compra",
  "compras",
  "pagamento",
  "debito",
  "credito",
  "transferencia",
]);

// Lowercases, removes accents and collapses spaces. Used on statement descriptions.
export function foldText(text: string): string {
  return text
    .normalize("NFD")
    .replace(COMBINING_MARKS_PATTERN, "")
    .toLocaleLowerCase("pt-BR")
    .replace(WHITESPACE_PATTERN, " ")
    .trim();
}

// Folds the text and drops the installment suffix and payment intermediary prefix, so every
// installment of the same purchase maps to the same value. Used on rule values.
export function normalizeMerchantText(text: string): string {
  return foldText(text)
    .replace(INSTALLMENT_SUFFIX_PATTERN, "")
    .replace(PAYMENT_INTERMEDIARY_PREFIX_PATTERN, "")
    .trim();
}

// Value to store in a new DESCRIPTION_CONTAINS rule, or null when the description is too
// generic to build a safe rule from.
export function merchantKey(description: string): string | null {
  const key = normalizeMerchantText(description);
  if (key.length < MIN_MERCHANT_KEY_LENGTH || GENERIC_MERCHANT_KEYS.has(key)) {
    return null;
  }
  return key;
}
