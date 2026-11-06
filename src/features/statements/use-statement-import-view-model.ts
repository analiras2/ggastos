import { useCallback, useMemo, useState } from 'react';

import { pickFile } from '@/shared/lib/pick-file';
import {
  describePaymentStatus,
  isPaymentChoice,
  type PaymentChoice,
  toRequestedStatus,
} from '@/features/statements/payment-status-labels';
import {
  CSV_MIME_TYPES,
  decodeBytes,
  readPickedFile,
  validateStatementFile,
  type SelectedStatementFile,
} from '@/features/statements/statement-file';
import {
  buildImportSummary,
  buildSuccessMessage,
  isStatementBank,
  type StatementImportViewModel,
} from '@/features/statements/statement-import-summary';
import {
  getFormattedImportCardStatementError,
  type ImportCardStatementResult,
  type StatementBank,
  useImportCardStatement,
} from '@/features/statements/use-import-card-statement';

export function useStatementImportViewModel(onSuccess?: () => void): StatementImportViewModel {
  const importMutation = useImportCardStatement();
  const [selectedBank, setSelectedBankState] = useState<StatementBank>('NUBANK');
  const [paymentChoice, setPaymentChoiceState] = useState<PaymentChoice>('AUTO');
  const [selectedFile, setSelectedFile] = useState<SelectedStatementFile | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<ImportCardStatementResult | null>(null);
  const [isPickingFile, setIsPickingFile] = useState(false);

  const setSelectedBank = useCallback((bank: string) => {
    if (!isStatementBank(bank)) {
      return;
    }

    setSelectedBankState(bank);
    setLastResult(null);
    setErrorMessage(null);
  }, []);

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
    setSelectedBankState('NUBANK');
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
      const pickedFile = await pickFile(CSV_MIME_TYPES);
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
      const message = error instanceof Error ? error.message : 'Não foi possível ler o arquivo.';
      setErrorMessage(message);
    } finally {
      setIsPickingFile(false);
    }
  }, []);

  const handleSubmit = useCallback(async () => {
    setErrorMessage(null);
    setLastResult(null);

    if (!selectedFile) {
      setErrorMessage('Selecione um CSV para importar.');
      return;
    }

    const contents = decodeBytes(selectedFile.bytes, selectedBank) ?? selectedFile.fallbackContents;
    if (!contents) {
      setErrorMessage('Não foi possível ler o conteúdo do CSV.');
      return;
    }

    try {
      const result = await importMutation.mutateAsync({
        bank: selectedBank,
        fileName: selectedFile.name,
        contents,
        paymentStatus: toRequestedStatus(paymentChoice),
      });
      setLastResult(result);
      onSuccess?.();
    } catch (error) {
      setErrorMessage(getFormattedImportCardStatementError(error));
    }
  }, [importMutation, onSuccess, paymentChoice, selectedBank, selectedFile]);

  const importSummary = useMemo(() => buildImportSummary(lastResult), [lastResult]);
  const successMessage = buildSuccessMessage(lastResult);
  const paymentStatusMessage = lastResult
    ? describePaymentStatus(lastResult.paymentStatus, lastResult.paymentStatusSource)
    : null;

  return {
    selectedBank,
    setSelectedBank,
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
