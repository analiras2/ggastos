import { z } from 'zod';

import { monthSchema } from '@/features/planning/planning-schema';

const centsSchema = z.number().int();

export const reconciliationRationaleSchema = z.object({
  amount: z.number(),
  date: z.number(),
  category: z.number(),
  account: z.number(),
  description: z.number(),
});
export type ReconciliationRationale = z.infer<typeof reconciliationRationaleSchema>;

export const reconciliationSuggestionSchema = z.object({
  transactionId: z.string().uuid(),
  transactionDescription: z.string(),
  transactionAmountCents: centsSchema,
  transactionPostedAt: z.string(),
  plannedEntryId: z.string().uuid(),
  plannedEntryTitle: z.string(),
  plannedEntryAmountCents: centsSchema,
  score: z.number().min(0).max(1),
  rationale: reconciliationRationaleSchema,
});
export type ReconciliationSuggestion = z.infer<typeof reconciliationSuggestionSchema>;

export const reconciliationInboxResponseSchema = z.object({
  month: monthSchema,
  suggestions: z.array(reconciliationSuggestionSchema),
});
export type ReconciliationInboxResponse = z.infer<typeof reconciliationInboxResponseSchema>;
