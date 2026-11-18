import { describe, expect, it } from 'vitest';

import { applyToSimilarDescription } from '@/features/dashboard/apply-to-similar-copy';

describe('applyToSimilarDescription', () => {
  it('speaks in general terms until the count is known', () => {
    expect(applyToSimilarDescription(undefined)).toContain('itens iguais');
  });

  it('says there is no other item when only this one matches', () => {
    expect(applyToSimilarDescription(1)).toContain('Não há outro item igual');
    expect(applyToSimilarDescription(0)).toContain('Não há outro item igual');
  });

  it('counts the other items without counting the edited one', () => {
    expect(applyToSimilarDescription(2)).toContain('1 outro item igual');
    expect(applyToSimilarDescription(5)).toContain('4 outros itens iguais');
  });

  it('always says the choice also applies to the next statements', () => {
    expect(applyToSimilarDescription(3)).toContain('próximas faturas');
  });
});
