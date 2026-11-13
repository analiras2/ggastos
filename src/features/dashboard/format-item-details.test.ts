import { describe, expect, it } from 'vitest';

import type { CategoryDetails } from '@/features/dashboard/contract';
import { plannedDetailLines, transactionDetailLines } from '@/features/dashboard/format-item-details';

const transaction: CategoryDetails['importedTransactions'][number] = {
  id: '00000000-0000-4000-8000-000000000001',
  description: 'AMAZONMKTPLC*REIPETCOM 1/5',
  amountCents: 8640,
  postedAt: '2026-08-31T12:00:00Z',
  merchantName: null,
  paymentMethod: 'CREDIT_CARD',
  tags: ['#pet'],
  note: null,
  descriptionRaw: 'AMAZONMKTPLC*REIPETCOM 1/5',
  installmentIndex: 1,
  installmentTotal: 5,
  sourceBank: 'BRADESCO',
  impactType: 'EXPENSE',
};

describe('item details', () => {
  it('lists only what the imported transaction has', () => {
    const labels = transactionDetailLines(transaction, 'Compras').map((line) => line.label);

    expect(labels).toEqual(['Categoria', 'Data', 'Parcela', 'Forma de pagamento', 'Origem']);
  });

  it('shows the original description only when it differs', () => {
    const lines = transactionDetailLines({ ...transaction, descriptionRaw: 'RAW TEXT' }, 'Compras');

    expect(lines.find((line) => line.label === 'Descrição original')?.value).toBe('RAW TEXT');
  });

  it('words the installment and the bank', () => {
    const lines = transactionDetailLines(transaction, 'Compras');

    expect(lines.find((line) => line.label === 'Parcela')?.value).toBe('1 de 5');
    expect(lines.find((line) => line.label === 'Origem')?.value).toBe('Fatura Bradesco');
  });

  it('describes a planned entry with its note', () => {
    const lines = plannedDetailLines(
      {
        id: '00000000-0000-4000-8000-000000000002',
        title: 'Aluguel',
        amountCents: 100000,
        status: 'RECONCILED',
        dueDate: '2026-11-05',
        installmentIndex: null,
        installmentTotal: null,
        manuallyConfirmedAt: null,
        paymentMethod: 'PIX',
        tags: [],
        note: 'pago adiantado',
        sourceBatchId: null,
      },
      'Casa'
    );

    expect(lines).toContainEqual({ label: 'Situação', value: 'Realizado' });
    expect(lines).toContainEqual({ label: 'Observação', value: 'pago adiantado' });
  });
});
