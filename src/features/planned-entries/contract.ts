import { z } from 'zod';

import { SELECTABLE_PAYMENT_METHODS } from '@/features/planned-entries/paid-entry-rules';
import {
  amountCentsSchema,
  impactTypeSchema,
  monthSchema,
  planningStatusSchema,
  uuidSchema,
} from '@/shared/contracts/finance';

// What the form sends when the user creates an entry.
export const createPlannedEntrySchema = z.object({
  month: monthSchema,
  title: z.string().trim().nullable().optional(),
  impactType: impactTypeSchema,
  categoryId: uuidSchema,
  amountCents: amountCentsSchema,
  expectedAccountId: uuidSchema.nullable().optional(),
  dueDate: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'Informe a data no formato AAAA-MM-DD.')
    .nullable()
    .optional(),
  note: z.string().trim().nullable().optional(),
  tags: z.array(z.string()).default([]),
  settlement: z.enum(['PLANNED', 'PAID']).default('PLANNED'),
  paymentMethod: z.enum(SELECTABLE_PAYMENT_METHODS).nullable().optional(),
}).refine((input) => input.settlement === 'PAID' || input.paymentMethod == null, {
  message: 'A forma de pagamento só vale para lançamentos já pagos.',
  path: ['paymentMethod'],
}).refine((input) => input.settlement === 'PLANNED' || Boolean(input.dueDate), {
  message: 'Informe a data em que o lançamento aconteceu.',
  path: ['dueDate'],
});
export type CreatePlannedEntryInput = z.infer<typeof createPlannedEntrySchema>;

// A planned entry as stored. `title` is empty for entries created by hand until an import names them.
export const plannedEntrySchema = z.object({
  id: z.string().uuid(),
  templateId: z.string().uuid().nullable(),
  month: monthSchema,
  title: z.string().nullable(),
  impactType: impactTypeSchema,
  categoryId: z.string().uuid(),
  expectedAccountId: z.string().uuid().nullable(),
  amountCents: z.number().int(),
  dueDate: z.string().nullable(),
  status: planningStatusSchema,
  installmentIndex: z.number().int().nullable(),
  installmentTotal: z.number().int().nullable(),
  note: z.string().nullable(),
  tags: z.array(z.string()),
  paymentMethod: z.string().nullable().default(null),
  createdAt: z.string(),
  updatedAt: z.string(),
  cancelledAt: z.string().nullable(),
});
export type PlannedEntry = z.infer<typeof plannedEntrySchema>;
