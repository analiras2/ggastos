import { describe, expect, it } from 'vitest';

import { groupPiecesIntoLines } from '@/features/statements/pdf-text-lines';

describe('groupPiecesIntoLines', () => {
  it('joins the pieces of a line from left to right and lines from top to bottom', () => {
    const lines = groupPiecesIntoLines([
      { text: 'R$ 102,84', x: 400, y: 500 },
      { text: '06/10', x: 40, y: 501 },
      { text: 'Total', x: 40, y: 300 },
      { text: 'RAIA DROGASIL SA', x: 120, y: 500 },
    ]);

    expect(lines).toEqual(['06/10 RAIA DROGASIL SA R$ 102,84', 'Total']);
  });

  it('ignores empty pieces', () => {
    expect(groupPiecesIntoLines([{ text: ' ', x: 0, y: 10 }])).toEqual([]);
  });
});
