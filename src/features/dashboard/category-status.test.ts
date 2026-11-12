import { describe, expect, it } from 'vitest';

import { categoryStatus } from '@/features/dashboard/category-status';

describe('categoryStatus', () => {
  it('has no status when nothing was planned', () => {
    expect(categoryStatus('EXPENSE', 0, 5000)).toBeNull();
  });

  it('shows what is left to pay, with the type wording', () => {
    expect(categoryStatus('EXPENSE', 2340, 1000)).toMatchObject({ label: 'Falta pagar', tone: 'neutral' });
    expect(categoryStatus('INCOME', 50000, 0)).toMatchObject({ label: 'Falta receber', tone: 'neutral' });
    expect(categoryStatus('INVESTMENT', 1000, 400)).toMatchObject({ label: 'Falta investir' });
  });

  it('is done when the plan was met exactly', () => {
    expect(categoryStatus('EXPENSE', 1000, 1000)).toEqual({ label: 'Concluído', value: null, tone: 'under' });
  });

  it('flags an expense that went past the plan as over', () => {
    expect(categoryStatus('EXPENSE', 1000, 1500)).toMatchObject({ label: 'Passou', tone: 'over' });
  });

  it('treats extra income as good news', () => {
    expect(categoryStatus('INCOME', 1000, 1500)).toMatchObject({ label: 'Acima do previsto', tone: 'under' });
  });
});
