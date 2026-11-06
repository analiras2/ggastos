import { requireSupabase } from '@/shared/lib/supabase/require-supabase';
import { createPlanningTemplateSchema, planningTemplateSchema, type CreatePlanningTemplateInput, type PlanningTemplate } from '@/features/templates/contract';

export const planningTemplatesKey = (month?: string) => ['planning-templates', month ?? 'all'];

export type ArchiveTemplateInput = { id: string; archiveFromMonth: string };
export type UpdateTemplateInput = {
  id: string;
  title: string;
  defaultAmountCents: number;
  effectiveMonth: string;
};

function mapPlanningTemplateRow(row: Record<string, unknown>): PlanningTemplate {
  return planningTemplateSchema.parse({
    id: row.id,
    title: row.title,
    impactType: row.impact_type,
    categoryId: row.category_id,
    expectedAccountId: row.expected_account_id,
    recurrenceFrequency: row.recurrence_frequency,
    recurrenceInterval: row.recurrence_interval,
    startMonth: row.start_month,
    endMonth: row.end_month,
    installmentTotal: row.installment_total,
    installmentAmountCents: row.installment_amount_cents,
    defaultAmountCents: row.default_amount_cents,
    isActive: row.is_active,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  });
}

export async function listPlanningTemplates(month?: string): Promise<PlanningTemplate[]> {
  const client = requireSupabase();

  const { data, error } = await client
    .from('planning_templates')
    .select('*')
    .eq('is_active', true)
    .lte('start_month', month ?? '9999-12')
    .order('created_at', { ascending: true });

  if (error) {
    throw error;
  }

  return (data ?? [])
    .map(mapPlanningTemplateRow)
    .filter((template) => !template.endMonth || template.endMonth >= (month ?? template.startMonth));
}

export async function createPlanningTemplate(input: CreatePlanningTemplateInput): Promise<PlanningTemplate> {
  const client = requireSupabase();
  const parsedInput = createPlanningTemplateSchema.parse(input);

  const {
    data: { user },
  } = await client.auth.getUser();

  if (!user) {
    throw new Error('É preciso estar autenticado para criar um template de planejamento.');
  }

  const { data, error } = await client
    .from('planning_templates')
    .insert({
      user_id: user.id,
      title: parsedInput.title,
      impact_type: parsedInput.impactType,
      category_id: parsedInput.categoryId,
      expected_account_id: parsedInput.expectedAccountId ?? null,
      recurrence_frequency: parsedInput.recurrenceFrequency,
      recurrence_interval: parsedInput.recurrenceInterval,
      start_month: parsedInput.startMonth,
      end_month: parsedInput.endMonth ?? null,
      installment_total: parsedInput.installmentTotal ?? null,
      installment_amount_cents: parsedInput.installmentAmountCents ?? null,
      default_amount_cents: parsedInput.defaultAmountCents,
    })
    .select('*')
    .single();

  if (error) {
    throw error;
  }

  return mapPlanningTemplateRow(data);
}

export async function updatePlanningTemplate(input: UpdateTemplateInput): Promise<void> {
  const parsedTitle = input.title.trim();
  if (!parsedTitle || input.defaultAmountCents <= 0) {
    throw new Error('Informe título e valor válidos.');
  }

  const { error } = await requireSupabase().rpc('update_planning_template_future', {
    p_template_id: input.id,
    p_title: parsedTitle,
    p_default_amount_cents: input.defaultAmountCents,
    p_effective_month: input.effectiveMonth,
  });

  if (error) {
    throw error;
  }
}

export async function archivePlanningTemplate({ id, archiveFromMonth }: ArchiveTemplateInput): Promise<void> {
  const { error } = await requireSupabase().rpc('archive_planning_template', {
    p_template_id: id,
    p_archive_from_month: archiveFromMonth,
  });

  if (error) {
    throw error;
  }
}
