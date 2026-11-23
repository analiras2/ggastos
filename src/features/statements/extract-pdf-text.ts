import { groupPiecesIntoLines, type PdfTextPiece } from '@/features/statements/pdf-text-lines';

// Reads the text of a PDF in the browser, so the file itself never has to be sent anywhere.
// The reader is loaded only when a PDF is chosen, since it is large.
export async function extractPdfText(bytes: ArrayBuffer): Promise<string> {
  const [pdfjs, worker] = await Promise.all([
    import('pdfjs-dist'),
    import('pdfjs-dist/build/pdf.worker.min.mjs?url'),
  ]);
  pdfjs.GlobalWorkerOptions.workerSrc = worker.default;

  // pdf.js takes over the buffer it is given, so it gets a copy.
  const document = await pdfjs.getDocument({ data: new Uint8Array(bytes.slice(0)) }).promise;
  const lines: string[] = [];

  for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
    const page = await document.getPage(pageNumber);
    const content = await page.getTextContent();
    const pieces: PdfTextPiece[] = [];
    for (const item of content.items) {
      if ('str' in item) {
        pieces.push({ text: item.str, x: item.transform[4], y: item.transform[5] });
      }
    }
    lines.push(...groupPiecesIntoLines(pieces));
  }

  return lines.join('\n');
}
