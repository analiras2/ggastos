import { z } from 'zod';

import { impactTypeSchema } from '@/features/planning/planning-schema';

const centsSchema = z.number().int();

export const annualMonthSchema = z.object({
  month: z.string(),
  hasSnapshot: z.boolean(),
  status: z.enum(['OPEN', 'CLOSED']).nullable(),
  plannedIncomeCents: centsSchema,
  actualIncomeCents: centsSchema,
  plannedExpenseCents: centsSchema,
  actualExpenseCents: centsSchema,
  plannedInvestmentCents: centsSchema,
  actualInvestmentCents: centsSchema,
  expectedBalanceCents: centsSchema,
  currentBalanceCents: centsSchema,
  committedRemainingCents: centsSchema,
  computedAt: z.string().nullable(),
});
export type AnnualMonth = z.infer<typeof annualMonthSchema>;

export const annualCategorySchema = z.object({
  categoryId: z.string().uuid(),
  categoryCode: z.string(),
  name: z.string(),
  impactType: impactTypeSchema,
  plannedCents: centsSchema,
  actualCents: centsSchema,
  deltaCents: centsSchema,
});
export type AnnualCategory = z.infer<typeof annualCategorySchema>;

export const annualSummarySchema = z.object({
  year: z.number().int(),
  months: z.array(annualMonthSchema).length(12),
  categories: z.array(annualCategorySchema),
});
export type AnnualSummary = z.infer<typeof annualSummarySchema>;
