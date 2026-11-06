import { z } from 'zod';

import { monthSchema } from '@/shared/contracts/finance';

export const monthOpeningBalanceSchema = z.object({
  month: monthSchema,
  openingBalanceCents: z.number().int().nullable(),
  source: z.enum(['CARRIED', 'MANUAL']).nullable(),
  carriedFromMonth: monthSchema.nullable(),
  previousMonth: monthSchema,
  previousMonthClosingCents: z.number().int(),
  isStale: z.boolean(),
});
export type MonthOpeningBalance = z.infer<typeof monthOpeningBalanceSchema>;
