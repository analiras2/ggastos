import { z } from 'zod';

// Vocabulary shared by every feature that talks about money: what a movement is, how often it
// repeats, where it stands, and the month and amount formats.

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

export const uuidSchema = z.string().uuid('Identificador inválido.');

export const amountCentsSchema = z
  .number()
  .int('O valor deve ser em centavos, sem casas decimais.')
  .positive('O valor deve ser maior que zero.');
