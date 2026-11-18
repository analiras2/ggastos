import { useState } from 'react';

import { centsFromMaskedInput } from '@/shared/lib/form-utils';
import type { PlanningTemplate } from '@/features/templates/contract';
import { useUpdatePlanningTemplate } from '@/features/templates/use-planning-templates';
import { errorMessageOf } from '@/shared/lib/error-message';

type EditTemplateParams = {
  template: PlanningTemplate | null;
  effectiveMonth: string;
  onClose: () => void;
};

export function useEditTemplateViewModel({ template, effectiveMonth, onClose }: EditTemplateParams) {
  const updateTemplate = useUpdatePlanningTemplate();
  const [title, setTitle] = useState(template?.title ?? '');
  const [amountCents, setAmountCents] = useState(template?.defaultAmountCents ?? 0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleChangeAmount = (maskedValue: string) => setAmountCents(centsFromMaskedInput(maskedValue));

  const handleSave = async () => {
    if (!template) return;
    try {
      await updateTemplate.mutateAsync({
        id: template.id,
        title,
        defaultAmountCents: amountCents,
        effectiveMonth,
      });
      onClose();
    } catch (error) {
      setErrorMessage(errorMessageOf(error, 'Não foi possível editar o template.'));
    }
  };

  return {
    title,
    amountCents,
    errorMessage,
    isSaving: updateTemplate.isPending,
    setTitle,
    handleChangeAmount,
    handleSave,
  };
}
