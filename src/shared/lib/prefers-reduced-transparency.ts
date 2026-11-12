import { useState } from 'react';

const QUERY = '(prefers-reduced-transparency: reduce)';

// True when the person asked the system for less transparency; read once when the component mounts.
export function useReducedTransparency(): boolean {
  const [isReduced] = useState(() => {
    try {
      return globalThis.matchMedia?.(QUERY).matches ?? false;
    } catch {
      return false;
    }
  });

  return isReduced;
}
