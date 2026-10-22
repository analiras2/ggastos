import { z } from 'zod';

export const IMPACT_TYPES = ['INCOME', 'EXPENSE', 'INVESTMENT', 'TRANSFER'] as const;
export const impactTypeSchema = z.enum(IMPACT_TYPES);
export type ImpactType = z.infer<typeof impactTypeSchema>;

export const RECURRENCE_FREQUENCIES = ['NONE', 'MONTHLY', 'YEARLY'] as const;
export const recurrenceFrequencySchema = z.enum(RECURRENCE_FREQUENCIES);
export type RecurrenceFrequency = z.infer<typeof recurrenceFrequencySchema>;

export const PLANNING_STATUSES = [
  'PLANNED',
  'PROJECTED',
  'RECONCILED',
  'CANCELLED',
  'CARRIED_OVER',
] as const;
export const planningStatusSchema = z.enum(PLANNING_STATUSES);
export type PlanningStatus = z.infer<typeof planningStatusSchema>;

export const monthSchema = z
  .string()
  .regex(/^\d{4}-(0[1-9]|1[0-2])$/, 'Informe o mês no formato AAAA-MM.');

const uuidSchema = z.string().uuid('Identificador inválido.');

const amountCentsSchema = z
  .number()
  .int('O valor deve ser em centavos, sem casas decimais.')
  .positive('O valor deve ser maior que zero.');

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
});
export type CreatePlannedEntryInput = z.infer<typeof createPlannedEntrySchema>;

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
  createdAt: z.string(),
  updatedAt: z.string(),
  cancelledAt: z.string().nullable(),
});
export type PlannedEntry = z.infer<typeof plannedEntrySchema>;

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
