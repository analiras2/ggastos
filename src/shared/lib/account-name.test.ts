import { describe, expect, it } from 'vitest';

import { accountName, firstName } from '@/shared/lib/account-name';

describe('accountName', () => {
  it('prefers the name saved with the account', () => {
    expect(accountName({ email: 'a@b.com', user_metadata: { display_name: ' Ana Lira ' } })).toBe('Ana Lira');
    expect(accountName({ email: 'a@b.com', user_metadata: { name: 'Ana' } })).toBe('Ana');
  });

  it('falls back to the e-mail before the @', () => {
    expect(accountName({ email: 'ana.lira@example.com', user_metadata: {} })).toBe('ana.lira');
  });

  it('has a last-resort label', () => {
    expect(accountName(null)).toBe('Sem nome');
  });
});

describe('firstName', () => {
  it('keeps only the first word', () => {
    expect(firstName('Ana Lira Scalabrini')).toBe('Ana');
    expect(firstName('  ana ')).toBe('ana');
  });
});
