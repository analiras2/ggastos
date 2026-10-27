import { z } from 'zod';

import { impactTypeSchema, monthSchema } from '@/features/planning/planning-schema';

const centsSchema = z.number().int();

export const monthDashboardSchema = z.object({
  month: monthSchema,
  summary: z.object({
    plannedIncomeCents: centsSchema,
    actualIncomeCents: centsSchema,
    plannedExpenseCents: centsSchema,
    actualExpenseCents: centsSchema,
    plannedInvestmentCents: centsSchema,
    actualInvestmentCents: centsSchema,
    expectedBalanceCents: centsSchema,
    currentBalanceCents: centsSchema,
    committedRemainingCents: centsSchema,
    openExpenseCents: centsSchema.default(0),
  }),
  categories: z.array(
    z.object({
      categoryId: z.string().uuid(),
      categoryCode: z.string(),
      name: z.string(),
      impactType: impactTypeSchema,
      plannedCents: centsSchema,
      actualCents: centsSchema,
      deltaCents: centsSchema,
    })
  ),
});
export type MonthDashboard = z.infer<typeof monthDashboardSchema>;
export type CategoryDashboardEntry = MonthDashboard['categories'][number];

export const PLANNED_ENTRY_STATUSES = [
  'PLANNED',
  'PROJECTED',
  'RECONCILED',
  'CANCELLED',
  'CARRIED_OVER',
] as const;

export const categoryDetailsSchema = z.object({
  month: monthSchema,
  categoryId: z.string().uuid(),
  categoryCode: z.string(),
  name: z.string(),
  impactType: impactTypeSchema,
  plannedEntries: z.array(
    z.object({
      id: z.string().uuid(),
      title: z.string(),
      amountCents: centsSchema,
      status: z.enum(PLANNED_ENTRY_STATUSES),
      dueDate: z.string().nullable(),
      installmentIndex: z.number().int().nullable(),
      installmentTotal: z.number().int().nullable(),
      manuallyConfirmedAt: z.string().nullable(),
    })
  ),
  importedTransactions: z.array(
    z.object({
      id: z.string().uuid(),
      description: z.string(),
      amountCents: centsSchema,
      postedAt: z.string(),
      merchantName: z.string().nullable(),
    })
  ),
});
export type CategoryDetails = z.infer<typeof categoryDetailsSchema>;
