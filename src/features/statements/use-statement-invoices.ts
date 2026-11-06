import { useMutation, useQuery, useQueryClient, type UseQueryResult } from '@tanstack/react-query';

import type {
  StatementBank,
  StatementPaymentStatus,
} from '@/features/statements/use-import-card-statement';
import { missingSupabaseEnv, supabase } from '@/lib/supabase/client';

export type StatementInvoice = {
  id: string;
  bank: StatementBank;
  invoiceMonth: string | null;
  fileName: string;
  paymentStatus: StatementPaymentStatus;
  paidAt: string | null;
  totalCents: number;
};

type InvoiceRow = {
  id: string;
  bank: string;
  invoice_month: string | null;
  file_name: string;
  payment_status: string;
  paid_at: string | null;
  imported_transactions: { amount_cents: number; direction: string }[];
};

export const STATEMENT_INVOICES_KEY = ['statement-invoices'] as const;

function toInvoice(row: InvoiceRow): StatementInvoice {
  const totalCents = row.imported_transactions.reduce(
    (total, transaction) =>
      total + (transaction.direction === 'CREDIT' ? -transaction.amount_cents : transaction.amount_cents),
    0
  );

  return {
    id: row.id,
    bank: row.bank === 'BRADESCO' ? 'BRADESCO' : 'NUBANK',
    invoiceMonth: row.invoice_month,
    fileName: row.file_name,
    paymentStatus: row.payment_status === 'OPEN' ? 'OPEN' : 'PAID',
    paidAt: row.paid_at,
    totalCents,
  };
}

// Importing a statement again creates a new batch and moves its rows to it, so older batches end
// up without rows. Only batches that still own rows are invoices.
async function listStatementInvoices(): Promise<StatementInvoice[]> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { data, error } = await supabase
    .from('statement_import_batches')
    .select('id,bank,invoice_month,file_name,payment_status,paid_at,imported_transactions(amount_cents,direction)')
    .order('invoice_month', { ascending: false, nullsFirst: false });

  if (error) {
    throw error;
  }

  return ((data ?? []) as InvoiceRow[])
    .filter((row) => row.imported_transactions.length > 0)
    .map(toInvoice);
}

export type SetInvoicePaymentStatusInput = {
  batchId: string;
  paymentStatus: StatementPaymentStatus;
};

async function setInvoicePaymentStatus(input: SetInvoicePaymentStatusInput): Promise<void> {
  if (!supabase) {
    throw new Error(`Missing Expo env vars: ${missingSupabaseEnv.join(', ')}`);
  }

  const { error } = await supabase.rpc('set_statement_payment_status', {
    p_batch_id: input.batchId,
    p_payment_status: input.paymentStatus,
  });

  if (error) {
    throw error;
  }
}

export function useStatementInvoices(): UseQueryResult<StatementInvoice[], Error> {
  return useQuery({ queryKey: STATEMENT_INVOICES_KEY, queryFn: listStatementInvoices });
}

export function useSetInvoicePaymentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: setInvoicePaymentStatus,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: STATEMENT_INVOICES_KEY }),
        // The dashboard screen is not mounted while Pendências is open and the app disables
        // refetch on mount, so inactive queries must be refetched now.
        queryClient.invalidateQueries({ queryKey: ['month-dashboard'], refetchType: 'all' }),
        queryClient.invalidateQueries({ queryKey: ['annual-summary'], refetchType: 'all' }),
      ]);
    },
  });
}
