import { useCallback, useMemo, useState } from 'react';
import * as DocumentPicker from 'expo-document-picker';
import { File as ExpoFile } from 'expo-file-system';

import {
  getFormattedImportCardStatementError,
  type ImportCardStatementResult,
  type StatementBank,
  useImportCardStatement,
} from '@/features/statements/use-import-card-statement';

type SelectedStatementFile = {
  name: string;
  bytes: ArrayBuffer;
  fallbackContents: string | null;
};

type ImportSummaryRow = {
  label: string;
  value: string;
};

interface StatementImportViewModel {
  selectedBank: StatementBank;
  setSelectedBank: (bank: string) => void;
  selectedFileName: string | null;
  importBatchId: string | null;
  errorMessage: string | null;
  successMessage: string | null;
  importSummary: ImportSummaryRow[];
  isPickingFile: boolean;
  isSubmitting: boolean;
  canSubmit: boolean;
  handlePickFile: () => Promise<void>;
  clearSelectedFile: () => void;
  handleSubmit: () => Promise<void>;
  reset: () => void;
}

const CSV_MIME_TYPES = [
  'text/csv',
  'text/comma-separated-values',
  'application/csv',
  'application/vnd.ms-excel',
  'text/plain',
];
const LATIN_1_CHUNK_SIZE = 8_192;

function isStatementBank(value: string): value is StatementBank {
  return value === 'NUBANK' || value === 'BRADESCO';
}

function formatBankName(bank: StatementBank): string {
  return bank === 'NUBANK' ? 'Nubank' : 'Bradesco';
}

function decodeLatin1(bytes: ArrayBuffer): string {
  const characters = new Uint8Array(bytes);
  let contents = '';

  for (let offset = 0; offset < characters.length; offset += LATIN_1_CHUNK_SIZE) {
    const chunk = characters.subarray(offset, offset + LATIN_1_CHUNK_SIZE);
    contents += String.fromCharCode(...chunk);
  }

  return contents;
}

function decodeBytes(bytes: ArrayBuffer, bank: StatementBank): string | null {
  if (bank === 'BRADESCO') {
    return decodeLatin1(bytes);
  }

  if (typeof TextDecoder === 'undefined') {
    return null;
  }

  return new TextDecoder('utf-8').decode(bytes);
}

async function readPickedAsset(
  asset: DocumentPicker.DocumentPickerAsset
): Promise<SelectedStatementFile> {
  if (asset.file) {
    const bytes = await asset.file.arrayBuffer();
    return {
      name: asset.name,
      bytes,
      fallbackContents: decodeBytes(bytes, 'NUBANK') ?? await asset.file.text(),
    };
  }

  const file = new ExpoFile(asset.uri);
  const bytes = await file.arrayBuffer();
  return {
    name: asset.name,
    bytes,
    fallbackContents: decodeBytes(bytes, 'NUBANK') ?? await file.text(),
  };
}

function buildImportSummary(result: ImportCardStatementResult | null): ImportSummaryRow[] {
  if (!result) {
    return [];
  }

  return [
    { label: 'Lidas', value: String(result.rowsRead) },
    { label: 'Importadas', value: String(result.rowsImported) },
    { label: 'Duplicadas', value: String(result.rowsDuplicated) },
    { label: 'Ignoradas', value: String(result.rowsSkipped) },
    { label: 'Falhas', value: String(result.rowsFailed) },
    { label: 'Matches', value: String(result.matchesCreated) },
  ];
}

export function useStatementImportViewModel(onSuccess?: () => void): StatementImportViewModel {
  const importMutation = useImportCardStatement();
  const [selectedBank, setSelectedBankState] = useState<StatementBank>('NUBANK');
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

  const clearSelectedFile = useCallback(() => {
    setSelectedFile(null);
    setLastResult(null);
    setErrorMessage(null);
  }, []);

  const reset = useCallback(() => {
    setSelectedBankState('NUBANK');
    setSelectedFile(null);
    setErrorMessage(null);
    setLastResult(null);
  }, []);

  const handlePickFile = useCallback(async () => {
    setErrorMessage(null);
    setLastResult(null);
    setIsPickingFile(true);

    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: CSV_MIME_TYPES,
        multiple: false,
        copyToCacheDirectory: true,
        base64: false,
      });

      if (result.canceled) {
        return;
      }

      const [asset] = result.assets;
      if (!asset) {
        setErrorMessage('Nenhum arquivo foi selecionado.');
        return;
      }

      const file = await readPickedAsset(asset);
      if (!file.name.toLowerCase().endsWith('.csv')) {
        setErrorMessage('Selecione um arquivo CSV.');
        return;
      }

      if (file.bytes.byteLength === 0) {
        setErrorMessage('O arquivo CSV está vazio.');
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
      });
      setLastResult(result);
      onSuccess?.();
    } catch (error) {
      setErrorMessage(getFormattedImportCardStatementError(error));
    }
  }, [importMutation, onSuccess, selectedBank, selectedFile]);

  const importSummary = useMemo(() => buildImportSummary(lastResult), [lastResult]);
  const successMessage = lastResult
    ? `${formatBankName(lastResult.bank)} importado. ${lastResult.rowsImported} novas linhas e ${lastResult.rowsDuplicated} duplicadas.`
    : null;

  return {
    selectedBank,
    setSelectedBank,
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
