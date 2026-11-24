import { describe, expect, it } from 'vitest';

import {
  dampPull,
  isMostlyVertical,
  PULL_MAX_DISTANCE,
  PULL_TRIGGER_DISTANCE,
  shouldRefresh,
} from '@/shared/lib/pull-to-refresh-rules';

describe('dampPull', () => {
  it('follows the finger at half speed', () => {
    expect(dampPull(80)).toBe(40);
  });

  it('ignores upward movement', () => {
    expect(dampPull(-30)).toBe(0);
  });

  it('never drags past the maximum', () => {
    expect(dampPull(10_000)).toBe(PULL_MAX_DISTANCE);
  });
});

describe('shouldRefresh', () => {
  it('needs the trigger distance', () => {
    expect(shouldRefresh(PULL_TRIGGER_DISTANCE - 1)).toBe(false);
    expect(shouldRefresh(PULL_TRIGGER_DISTANCE)).toBe(true);
  });
});

describe('isMostlyVertical', () => {
  it('tells vertical from sideways swipes', () => {
    expect(isMostlyVertical(5, 40)).toBe(true);
    expect(isMostlyVertical(40, 5)).toBe(false);
  });
});
