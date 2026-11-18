import { describe, expect, it } from 'vitest';

import { errorMessageOf } from '@/shared/lib/error-message';

describe('errorMessageOf', () => {
  it('uses the message of an Error', () => {
    expect(errorMessageOf(new Error('boom'), 'fallback')).toBe('boom');
  });

  it('uses the fallback for anything that is not an Error', () => {
    expect(errorMessageOf('boom', 'fallback')).toBe('fallback');
    expect(errorMessageOf(null, 'fallback')).toBe('fallback');
  });
});
