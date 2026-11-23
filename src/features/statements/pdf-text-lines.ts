// Turns the positioned pieces of text of a PDF page into lines of text, the way they read on the page.
export type PdfTextPiece = { text: string; x: number; y: number };

// Pieces whose heights differ by less than this are on the same line.
const SAME_LINE_TOLERANCE = 3;

export function groupPiecesIntoLines(pieces: PdfTextPiece[]): string[] {
  const rows: { y: number; pieces: PdfTextPiece[] }[] = [];

  // The PDF origin is the bottom-left corner, so a higher y is higher on the page.
  for (const piece of [...pieces].sort((first, second) => second.y - first.y)) {
    if (piece.text.trim() === '') {
      continue;
    }
    const row = rows.find((candidate) => Math.abs(candidate.y - piece.y) <= SAME_LINE_TOLERANCE);
    if (row) {
      row.pieces.push(piece);
    } else {
      rows.push({ y: piece.y, pieces: [piece] });
    }
  }

  return rows.map((row) =>
    row.pieces
      .sort((first, second) => first.x - second.x)
      .map((piece) => piece.text.trim())
      .join(' '),
  );
}
