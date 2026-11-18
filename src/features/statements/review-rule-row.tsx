import { SwitchRow } from '@/shared/ui/forms/switch-row';

type ReviewRuleRowProps = {
  canSaveAsRule: boolean;
  saveAsRule: boolean;
  onChange: (value: boolean) => void;
};

export function ReviewRuleRow({ canSaveAsRule, saveAsRule, onChange }: ReviewRuleRowProps) {
  return (
    <SwitchRow
      title="Usar nas próximas faturas"
      description={
        canSaveAsRule
          ? 'Cria uma regra para este estabelecimento.'
          : 'Descrição genérica demais para criar uma regra.'
      }
      value={saveAsRule && canSaveAsRule}
      disabled={!canSaveAsRule}
      onChange={onChange}
    />
  );
}
