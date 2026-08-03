export type ImpactType = "INCOME" | "EXPENSE" | "INVESTMENT" | "TRANSFER";

export type PlannedEntryForScoring = {
  id: string;
  title: string;
  impactType: ImpactType;
  amountCents: number;
  dueDate: string | null;
  month: string;
  expectedAccountId: string | null;
  categoryId: string;
};

export type TransactionForScoring = {
  id: string;
  description: string;
  merchantName: string | null;
  impactType: ImpactType;
  amountCents: number;
  postedAt: string;
  competencyMonth: string;
  accountId: string;
  internalCategoryId: string | null;
};

export type MatchScore = {
  score: number;
  amountDeltaCents: number;
  dateDeltaDays: number;
  rationale: {
    amount: number;
    date: number;
    category: number;
    account: number;
    description: number;
  };
};

// Conservative profile: strong matches auto-conciliate, everything else waits for review.
export const AUTO_MATCH_THRESHOLD = 0.9;
export const SUGGESTION_THRESHOLD = 0.7;

const WEIGHTS = {
  amount: 0.4,
  date: 0.25,
  category: 0.15,
  account: 0.1,
  description: 0.1,
};

const AMOUNT_TOLERANCE_RATIO = 0.2; // 20% off the planned amount zeroes the amount score.
const DATE_TOLERANCE_DAYS = 10; // 10+ days off the due date zeroes the date score.

function clamp01(value: number): number {
  return Math.max(0, Math.min(1, value));
}

function tokenize(text: string): Set<string> {
  return new Set(
    text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[̀-ͯ]/g, "")
      .split(/[^a-z0-9]+/)
      .filter((token) => token.length > 1),
  );
}

function jaccardSimilarity(a: string, b: string): number {
  const setA = tokenize(a);
  const setB = tokenize(b);
  if (setA.size === 0 || setB.size === 0) {
    return 0;
  }

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) {
      intersection++;
    }
  }

  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function daysBetween(isoA: string, isoB: string): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  return Math.abs(new Date(isoA).getTime() - new Date(isoB).getTime()) / msPerDay;
}

type ScoreComponent = { weight: number; value: number; available: boolean };

function weightedAverage(components: ScoreComponent[]): number {
  const applicable = components.filter((component) => component.available);
  const totalWeight = applicable.reduce((sum, component) => sum + component.weight, 0);
  if (totalWeight === 0) {
    return 0;
  }
  const weightedSum = applicable.reduce(
    (sum, component) => sum + component.weight * component.value,
    0,
  );
  return weightedSum / totalWeight;
}

const zeroScore = (amountDeltaCents: number): MatchScore => ({
  score: 0,
  amountDeltaCents,
  dateDeltaDays: 0,
  rationale: { amount: 0, date: 0, category: 0, account: 0, description: 0 },
});

/**
 * Deterministic score in [0, 1]. Dimensions with no available signal (e.g. no
 * expected account on the plan, no mapped internal category for the
 * transaction) are excluded from the weighted average instead of penalizing
 * the score, so a perfect amount+date+description match can still reach the
 * auto-match threshold.
 */
export function scoreMatch(
  transaction: TransactionForScoring,
  plannedEntry: PlannedEntryForScoring,
): MatchScore {
  const amountDeltaCents = Math.abs(transaction.amountCents - plannedEntry.amountCents);

  if (transaction.impactType !== plannedEntry.impactType) {
    return zeroScore(amountDeltaCents);
  }

  const amountScore = clamp01(
    1 - amountDeltaCents / Math.max(plannedEntry.amountCents, 1) / AMOUNT_TOLERANCE_RATIO,
  );

  const dateDeltaDays = plannedEntry.dueDate
    ? daysBetween(transaction.postedAt, plannedEntry.dueDate)
    : transaction.competencyMonth === plannedEntry.month
      ? 0
      : DATE_TOLERANCE_DAYS;
  const dateScore = clamp01(1 - dateDeltaDays / DATE_TOLERANCE_DAYS);

  const categoryAvailable = transaction.internalCategoryId !== null;
  const categoryScore = categoryAvailable
    ? (transaction.internalCategoryId === plannedEntry.categoryId ? 1 : 0)
    : 0;

  const accountAvailable = plannedEntry.expectedAccountId !== null;
  const accountScore = accountAvailable
    ? (plannedEntry.expectedAccountId === transaction.accountId ? 1 : 0)
    : 0;

  const descriptionScore = jaccardSimilarity(
    transaction.merchantName ?? transaction.description,
    plannedEntry.title,
  );

  const score = weightedAverage([
    { weight: WEIGHTS.amount, value: amountScore, available: true },
    { weight: WEIGHTS.date, value: dateScore, available: true },
    { weight: WEIGHTS.category, value: categoryScore, available: categoryAvailable },
    { weight: WEIGHTS.account, value: accountScore, available: accountAvailable },
    { weight: WEIGHTS.description, value: descriptionScore, available: true },
  ]);

  return {
    score,
    amountDeltaCents,
    dateDeltaDays,
    rationale: {
      amount: amountScore,
      date: dateScore,
      category: categoryScore,
      account: accountScore,
      description: descriptionScore,
    },
  };
}
