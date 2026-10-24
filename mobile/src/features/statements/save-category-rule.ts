import { merchantKey, normalizeMerchantText } from '@/features/statements/merchant-key';
import { supabase } from '@/lib/supabase/client';

const DESCRIPTION_CONTAINS_RULE_TYPE = 'DESCRIPTION_CONTAINS';

type SaveCategoryRuleInput = {
  description: string;
  categoryId: string;
};

// Stores one DESCRIPTION_CONTAINS rule per merchant. The rule value is the merchant key, so every
// installment of a purchase and accent or case variations match the same rule.
export async function saveCategoryRule({ description, categoryId }: SaveCategoryRuleInput): Promise<void> {
  const ruleValue = merchantKey(description);
  if (!supabase || ruleValue === null) {
    return;
  }

  const { data: existingRules, error: existingRulesError } = await supabase
    .from('user_category_rules')
    .select('id,rule_value')
    .eq('rule_type', DESCRIPTION_CONTAINS_RULE_TYPE);

  if (existingRulesError) {
    throw existingRulesError;
  }

  const existingRule = (existingRules ?? []).find(
    (rule) => normalizeMerchantText(rule.rule_value as string) === ruleValue
  );

  if (existingRule) {
    const { error } = await supabase
      .from('user_category_rules')
      .update({ rule_value: ruleValue, target_category_id: categoryId, is_active: true })
      .eq('id', existingRule.id);

    if (error) {
      throw error;
    }
    return;
  }

  const { data: userData, error: userError } = await supabase.auth.getUser();
  if (userError) {
    throw userError;
  }
  if (!userData.user) {
    throw new Error('É preciso estar autenticado para salvar uma regra de categoria.');
  }

  const { error } = await supabase.from('user_category_rules').insert({
    user_id: userData.user.id,
    rule_type: DESCRIPTION_CONTAINS_RULE_TYPE,
    rule_value: ruleValue,
    target_category_id: categoryId,
    priority: 0,
    is_active: true,
  });

  if (error) {
    throw error;
  }
}
