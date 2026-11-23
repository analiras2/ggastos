import { useCallback, useMemo, useState } from 'react';

import { pickFile } from '@/shared/lib/pick-file';
import {
  describePaymentStatus,
  isPaymentChoice,
  type PaymentChoice,
  toRequestedStatus,
} from '@/features/statements/payment-status-labels';
import {
  STATEMENT_MIME_TYPES,
  readPickedFile,
  readStatementContents,
  validateStatementFile,
  type SelectedStatementFile,
} from '@/features/statements/statement-file';
import {
  buildImportSummary,
  buildSuccessMessage,
  type StatementImportViewModel,
} from '@/features/statements/statement-import-summary';
import {
  getFormattedImportCardStatementError,
  type ImportCardStatementResult,
  useImportCardStatement,
} from '@/features/statements/use-import-card-statement';
import { errorMessageOf } from '@/shared/lib/error-message';

export function useStatementImportViewModel(onSuccess?: () => void): StatementImportViewModel {
  const importMutation = useImportCardStatement();
  const [paymentChoice, setPaymentChoiceState] = useState<PaymentChoice>('AUTO');
  const [selectedFile, setSelectedFile] = useState<SelectedStatementFile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ImportCardStatementResult | null>(null);
  const [isPickingFile, setIsPickingFile] = useState(false);

  const setPaymentChoice = useCallback((choice: string) => {
    if (isPaymentChoice(choice)) {
      setPaymentChoiceState(choice);
    }
  }, []);

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setLastResult(null);
    setErrorMessage(null);
  }, []);

  const reset = useCallback(() => {
    setPaymentChoiceState('AUTO');
    setSelectedFile(null);
    setErrorMessage(null);
    setLastResult(null);
  }, []);

  const handlePickFile = useCallback(async () => {
    setErrorMessage(null);
    setLastResult(null);
    setIsPickingFile(true);

    try {
      const pickedFile = await pickFile(STATEMENT_MIME_TYPES);
      if (!pickedFile) {
        return;
      }

      const file = await readPickedFile(pickedFile);
      const problem = validateStatementFile(file);
      if (problem) {
        setErrorMessage(problem);
        return;
      }

      setSelectedFile(file);
    } catch (error) {
      setErrorMessage(errorMessageOf(error, 'Não foi possível ler o arquivo.'));
    } finally {
      setIsPickingFile(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrorMessage(null);
    setLastResult(null);

    if (!selectedFile) {
      setErrorMessage('Selecione um arquivo para importar.');
      return;
    }

    try {
      const contents = await readStatementContents(selectedFile);
      if (!contents.trim()) {
        setErrorMessage('Não encontrei texto nesse arquivo. Se for um PDF escaneado, baixe a fatura direto do app do banco.');
        return;
      }

      const result = await importMutation.mutateAsync({
        fileName: selectedFile.name,
        contents,
        paymentStatus: toRequestedStatus(paymentChoice),
      });
      setLastResult(result);
      onSuccess?.();
    } catch (error) {
      setErrorMessage(getFormattedImportCardStatementError(error));
    }
  }, [importMutation, onSuccess, paymentChoice, selectedFile]);

  const importSummary = useMemo(() => buildImportSummary(lastResult), [lastResult]);
  const successMessage = buildSuccessMessage(lastResult);
  const paymentStatusMessage = lastResult
    ? describePaymentStatus(lastResult.paymentStatus, lastResult.paymentStatusSource)
    : null;

  return {
    paymentChoice,
    setPaymentChoice,
    paymentStatusMessage,
    selectedFileName: selectedFile?.name ?? null,
    importBatchId: lastResult?.batchId ?? null,
    errorMessage,
    successMessage,
    importSummary,
    isPickingFile,
    isSubmitting: importMutation.isPending,
    canSubmit: selectedFile !== null && !importMutation.isPending && !isPickingFile,
    handlePickFile,
    clearSelectedFile,
    handleSubmit,
    reset,
  };
}
