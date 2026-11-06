import { z } from 'zod';

import { monthSchema } from '@/shared/contracts/finance';

// What `get_wallet` / `set_wallet_balance` return. Until the user informs a balance there is no
// wallet yet (`isConfigured` false) and the balance is zero.
export const walletSchema = z.object({
  isConfigured: z.boolean(),
  startsOnMonth: monthSchema.nullable(),
  initialBalanceCents: z.number().int(),
  balanceCents: z.number().int(),
});
export type Wallet = z.infer<typeof walletSchema>;
