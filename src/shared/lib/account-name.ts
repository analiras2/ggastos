type AccountUser = {
  email?: string | null;
  user_metadata?: Record<string, unknown> | null;
};

const NAME_KEYS = ['display_name', 'full_name', 'name'] as const;
const FALLBACK_NAME = 'Sem nome';

// The name saved with the account, or the part of the e-mail before the "@" when there is none.
export function accountName(user: AccountUser | null | undefined): string {
  for (const key of NAME_KEYS) {
    const value = user?.user_metadata?.[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }

  const emailName = user?.email?.split('@')[0]?.trim();
  return emailName ? emailName : FALLBACK_NAME;
}

// "Ana Lira" -> "Ana". Used for greetings.
export function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}
