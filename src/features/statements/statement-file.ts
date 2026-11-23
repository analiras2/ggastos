import { extractPdfText } from '@/features/statements/extract-pdf-text';

export type SelectedStatementFile = {
  name: string;
  bytes: ArrayBuffer;
};

export const STATEMENT_MIME_TYPES = [
  'text/csv',
  'text/comma-separated-values',
  'application/csv',
  'application/vnd.ms-excel',
  'text/plain',
  'application/pdf',
  '.csv',
  '.pdf',
];

const LATIN_1_CHUNK_SIZE = 8_192;

function decodeLatin1(bytes: ArrayBuffer): string {
  const characters = new Uint8Array(bytes);
  let contents = '';

  for (let offset = 0; offset < characters.length; offset += LATIN_1_CHUNK_SIZE) {
    const chunk = characters.subarray(offset, offset + LATIN_1_CHUNK_SIZE);
    contents += String.fromCharCode(...chunk);
  }

  return contents;
}

// Nubank writes UTF-8 and Bradesco writes Latin-1. Accents are invalid UTF-8 in a Latin-1 file, so a
// file that is not valid UTF-8 is read as Latin-1, without the person saying which bank it is.
export function decodeCsvBytes(bytes: ArrayBuffer): string {
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    return decodeLatin1(bytes);
  }
}

export function isPdfFile(file: SelectedStatementFile): boolean {
  return file.name.toLowerCase().endsWith('.pdf');
}

// The text that goes to the import: the lines of a PDF, or the decoded content of a CSV.
export async function readStatementContents(file: SelectedStatementFile): Promise<string> {
  return isPdfFile(file) ? extractPdfText(file.bytes) : decodeCsvBytes(file.bytes);
}

// Returns a message for the user when the file cannot be imported, or null when it is fine.
export function validateStatementFile(file: SelectedStatementFile): string | null {
  const name = file.name.toLowerCase();
  if (!name.endsWith('.csv') && !name.endsWith('.pdf')) {
    return 'Selecione um arquivo CSV ou PDF.';
  }

  if (file.bytes.byteLength === 0) {
    return 'O arquivo está vazio.';
  }

  return null;
}

export async function readPickedFile(file: File): Promise<SelectedStatementFile> {
  return { name: file.name, bytes: await file.arrayBuffer() };
}
