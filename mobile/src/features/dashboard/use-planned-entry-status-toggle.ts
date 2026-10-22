import { useCallback, useState } from 'react';

import {
  useConfirmPlannedEntryManually,
  useUndoManualConfirmation,
} from '@/features/planning/use-planned-entries';

interface PlannedEntryStatusToggle {
  togglingEntryId: string | null;
  handleToggleStatus: (entryId: string, isUndo: boolean) => void;
}

export function usePlannedEntryStatusToggle(
  month: string,
  categoryId: string | null
): PlannedEntryStatusToggle {
  const [togglingEntryId, setTogglingEntryId] = useState<string | null>(null);
  const confirmMutation = useConfirmPlannedEntryManually();
  const undoMutation = useUndoManualConfirmation();

  const handleToggleStatus = useCallback(
    (entryId: string, isUndo: boolean) => {
      if (!categoryId) {
        return;
      }

      setTogglingEntryId(entryId);
      const mutation = isUndo ? undoMutation : confirmMutation;

      mutation.mutate(
        { id: entryId, month, categoryId },
        { onSettled: () => setTogglingEntryId(null) }
      );
    },
    [categoryId, month, confirmMutation, undoMutation]
  );

  return { togglingEntryId, handleToggleStatus };
}
