import { z } from 'zod';

import {
  amountCentsSchema,
  impactTypeSchema,
  monthSchema,
  recurrenceFrequencySchema,
  uuidSchema,
} from '@/shared/contracts/finance';

// What the form sends when the user creates a recurring or installment template.
export const createPlanningTemplateSchema = z
  .object({
    title: z.string().trim().min(1, 'Informe um título.'),
    impactType: impactTypeSchema,
    categoryId: uuidSchema,
    defaultAmountCents: amountCentsSchema,
    expectedAccountId: uuidSchema.nullable().optional(),
    recurrenceFrequency: recurrenceFrequencySchema.default('NONE'),
    recurrenceInterval: z.number().int().positive().default(1),
    startMonth: monthSchema,
    endMonth: monthSchema.nullable().optional(),
    installmentTotal: z.number().int().positive().nullable().optional(),
    installmentAmountCents: amountCentsSchema.nullable().optional(),
  })
  .refine(
    (input) =>
      input.recurrenceFrequency !== 'NONE' ||
      (input.installmentTotal != null && input.installmentAmountCents != null),
    {
      message: 'Escolha uma recorrência ou informe os dados de parcelamento.',
      path: ['recurrenceFrequency'],
    }
  )
  .refine(
    (input) => (input.installmentTotal == null) === (input.installmentAmountCents == null),
    {
      message: 'Parcelamento exige total de parcelas e valor da parcela juntos.',
      path: ['installmentTotal'],
    }
  )
  .refine((input) => input.recurrenceFrequency === 'NONE' || input.installmentTotal == null, {
    message: 'Recorrência e parcelamento não podem ser combinados.',
    path: ['installmentTotal'],
  })
  .refine((input) => !input.endMonth || input.endMonth >= input.startMonth, {
    message: 'O mês final deve ser igual ou posterior ao mês inicial.',
    path: ['endMonth'],
  });
export type CreatePlanningTemplateInput = z.infer<typeof createPlanningTemplateSchema>;

// A template as stored.
export const planningTemplateSchema = z.object({
  id: z.string().uuid(),
  title: z.string(),
  impactType: impactTypeSchema,
  categoryId: z.string().uuid(),
  expectedAccountId: z.string().uuid().nullable(),
  recurrenceFrequency: recurrenceFrequencySchema,
  recurrenceInterval: z.number().int(),
  startMonth: monthSchema,
  endMonth: monthSchema.nullable(),
  installmentTotal: z.number().int().nullable(),
  installmentAmountCents: z.number().int().nullable(),
  defaultAmountCents: z.number().int(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});
export type PlanningTemplate = z.infer<typeof planningTemplateSchema>;
