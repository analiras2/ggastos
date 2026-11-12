import { useCallback, useState } from 'react';

import { updateDisplayName, useAuth } from '@/features/auth';

const MAX_NAME_LENGTH = 60;

// Edits the name shown in the profile; starts from the current name every time it is opened.
export function useEditNameViewModel(currentName: string, onSaved: () => void) {
  const { session } = useAuth();
  const [name, setName] = useState(currentName);
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSave = useCallback(async () => {
    const trimmedName = name.trim();
    if (!session?.user) {
      return;
    }
    if (trimmedName.length === 0) {
      setErrorMessage('Informe um nome.');
      return;
    }
    if (trimmedName.length > MAX_NAME_LENGTH) {
      setErrorMessage(`Use até ${MAX_NAME_LENGTH} caracteres.`);
      return;
    }

    setErrorMessage(null);
    setIsSaving(true);
    try {
      await updateDisplayName(session.user, trimmedName);
      onSaved();
    } catch {
      setErrorMessage('Não foi possível salvar o nome. Tente de novo.');
    } finally {
      setIsSaving(false);
    }
  }, [name, onSaved, session]);

  return { name, setName, isSaving, errorMessage, handleSave };
}
