import type { StatementBank } from '@/features/statements/use-import-card-statement';

export type SelectedStatementFile = {
  name: string;
  bytes: ArrayBuffer;
  fallbackContents: string | null;
};

export const CSV_MIME_TYPES = [
  'text/csv',
  'text/comma-separated-values',
  'application/csv',
  'application/vnd.ms-excel',
  'text/plain',
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

// Bradesco exports Latin-1; Nubank exports UTF-8.
export function decodeBytes(bytes: ArrayBuffer, bank: StatementBank): string | null {
  if (bank === 'BRADESCO') {
    return decodeLatin1(bytes);
  }

  if (typeof TextDecoder === 'undefined') {
    return null;
  }

  return new TextDecoder('utf-8').decode(bytes);
}

// Returns a message for the user when the file cannot be imported, or null when it is fine.
export function validateStatementFile(file: SelectedStatementFile): string | null {
  if (!file.name.toLowerCase().endsWith('.csv')) {
    return 'Selecione um arquivo CSV.';
  }

  if (file.bytes.byteLength === 0) {
    return 'O arquivo CSV está vazio.';
  }

  return null;
}

export async function readPickedFile(file: File): Promise<SelectedStatementFile> {
  const bytes = await file.arrayBuffer();
  return {
    name: file.name,
    bytes,
    fallbackContents: decodeBytes(bytes, 'NUBANK') ?? await file.text(),
  };
}
