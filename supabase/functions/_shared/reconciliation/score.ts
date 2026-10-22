export type ImpactType = "INCOME" | "EXPENSE" | "INVESTMENT" | "TRANSFER";

export type PlannedEntryForScoring = {
  id: string;
  title: string;
  impactType: ImpactType;
  amountCents: number;
  dueDate: string | null;
  month: string;
  expectedAccountId: string | null;
  categoryName: string;
  installmentIndex?: number | null;
  installmentTotal?: number | null;
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
  pluggyCategoryName: string | null;
  statementInstallmentIndex?: number | null;
  statementInstallmentTotal?: number | null;
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
    installment: number;
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
  installment: 0.15,
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

function stripInstallmentMarkers(text: string): string {
  return text.replace(/\b\d{1,2}\/\d{1,2}\b/g, " ");
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

function descriptionSimilarity(a: string, b: string): number {
  return Math.max(
    jaccardSimilarity(a, b),
    jaccardSimilarity(stripInstallmentMarkers(a), stripInstallmentMarkers(b)),
  );
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
  rationale: { amount: 0, date: 0, category: 0, account: 0, description: 0, installment: 0 },
});

type InstallmentSignal = {
  index: number;
  total: number;
};

function installmentFromText(text: string): InstallmentSignal | null {
  const match = text.match(/\b(\d{1,2})\/(\d{1,2})\b/);
  if (!match) {
    return null;
  }

  const index = Number(match[1]);
  const total = Number(match[2]);
  if (!Number.isInteger(index) || !Number.isInteger(total) || index <= 0 || total <= 0) {
    return null;
  }
  if (index > total) {
    return null;
  }

  return { index, total };
}

function installmentFromFields(
  index: number | null | undefined,
  total: number | null | undefined,
): InstallmentSignal | null {
  if (!index || !total) {
    return null;
  }
  if (index <= 0 || total <= 0 || index > total) {
    return null;
  }

  return { index, total };
}

function installmentScore(
  transaction: TransactionForScoring,
  plannedEntry: PlannedEntryForScoring,
): { available: boolean; value: number } {
  const transactionInstallment =
    installmentFromFields(
      transaction.statementInstallmentIndex,
      transaction.statementInstallmentTotal,
    ) ?? installmentFromText(transaction.description);
  const plannedInstallment =
    installmentFromFields(plannedEntry.installmentIndex, plannedEntry.installmentTotal) ??
      installmentFromText(plannedEntry.title);

  if (!transactionInstallment && !plannedInstallment) {
    return { available: false, value: 0 };
  }

  if (!transactionInstallment || !plannedInstallment) {
    return { available: true, value: 0 };
  }

  if (
    transactionInstallment.index === plannedInstallment.index &&
    transactionInstallment.total === plannedInstallment.total
  ) {
    return { available: true, value: 1 };
  }

  if (transactionInstallment.total === plannedInstallment.total) {
    return { available: true, value: 0.35 };
  }

  return { available: true, value: 0 };
}

/**
 * Deterministic score in [0, 1]. Dimensions with no available signal (e.g. no
 * expected account on the plan, no category from the provider) are excluded
 * from the weighted average instead of penalizing the score, so a perfect
 * amount+date+description match can still reach the auto-match threshold.
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

  const categoryAvailable = transaction.pluggyCategoryName !== null;
  const categoryScore = categoryAvailable
    ? jaccardSimilarity(transaction.pluggyCategoryName as string, plannedEntry.categoryName)
    : 0;

  const accountAvailable = plannedEntry.expectedAccountId !== null;
  const accountScore = accountAvailable
    ? (plannedEntry.expectedAccountId === transaction.accountId ? 1 : 0)
    : 0;

  const descriptionScore = descriptionSimilarity(
    transaction.merchantName ?? transaction.description,
    plannedEntry.title,
  );
  const installment = installmentScore(transaction, plannedEntry);

  const score = weightedAverage([
    { weight: WEIGHTS.amount, value: amountScore, available: true },
    { weight: WEIGHTS.date, value: dateScore, available: true },
    { weight: WEIGHTS.category, value: categoryScore, available: categoryAvailable },
    { weight: WEIGHTS.account, value: accountScore, available: accountAvailable },
    { weight: WEIGHTS.description, value: descriptionScore, available: true },
    { weight: WEIGHTS.installment, value: installment.value, available: installment.available },
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
      installment: installment.value,
    },
  };
}
