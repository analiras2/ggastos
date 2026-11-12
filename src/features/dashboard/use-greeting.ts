import { useAuth } from '@/features/auth';
import { accountName, firstName } from '@/shared/lib/account-name';
import { pickFinanceQuote } from '@/features/dashboard/finance-quotes';

// Chosen once when the app loads, so the message stays the same while it is open and changes on the next opening.
const SESSION_QUOTE = pickFinanceQuote();

export function useGreeting() {
  const { session } = useAuth();

  return { title: `Olá, ${firstName(accountName(session?.user))}`, quote: SESSION_QUOTE };
}
