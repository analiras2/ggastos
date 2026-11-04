import { useCallback, useMemo } from 'react';

import {
  type StatementInvoice,
  useSetInvoicePaymentStatus,
  useStatementInvoices,
} from '@/features/statements/use-statement-invoices';

interface InvoicesViewModel {
  invoices: StatementInvoice[];
  openCount: number;
  updatingInvoiceId: string | null;
  errorMessage: string | null;
  handleTogglePayment: (invoice: StatementInvoice) => void;
}

export function useInvoicesViewModel(): InvoicesViewModel {
  const invoicesQuery = useStatementInvoices();
  const { mutate, isPending, variables, error } = useSetInvoicePaymentStatus();
  const invoices = useMemo(() => invoicesQuery.data ?? [], [invoicesQuery.data]);
  const openCount = useMemo(
    () => invoices.filter((invoice) => invoice.paymentStatus === 'OPEN').length,
    [invoices]
  );

  const handleTogglePayment = useCallback(
    (invoice: StatementInvoice) => {
      mutate({
        batchId: invoice.id,
        paymentStatus: invoice.paymentStatus === 'OPEN' ? 'PAID' : 'OPEN',
      });
    },
    [mutate]
  );

  return {
    invoices,
    openCount,
    updatingInvoiceId: isPending ? (variables?.batchId ?? null) : null,
    errorMessage: error ? 'Não foi possível atualizar a fatura. Tente novamente.' : null,
    handleTogglePayment,
  };
}
