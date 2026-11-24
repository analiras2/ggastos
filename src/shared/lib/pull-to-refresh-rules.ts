// Pure rules of the pull-to-refresh gesture, kept apart from the DOM so they can be tested.

// How far the finger must travel for each pixel the content follows (the pull feels heavier).
export const PULL_RESISTANCE = 0.5;
// The most the content is dragged down, in pixels.
export const PULL_MAX_DISTANCE = 96;
// Dragged distance from which letting go starts a refresh.
export const PULL_TRIGGER_DISTANCE = 56;
// Where the content rests while the refresh runs.
export const PULL_REFRESHING_DISTANCE = 48;

export function dampPull(fingerDistance: number): number {
  if (fingerDistance <= 0) {
    return 0;
  }
  return Math.min(PULL_MAX_DISTANCE, fingerDistance * PULL_RESISTANCE);
}

export function shouldRefresh(draggedDistance: number): boolean {
  return draggedDistance >= PULL_TRIGGER_DISTANCE;
}

// Sideways swipes (the month carousel) must never start a refresh.
export function isMostlyVertical(deltaX: number, deltaY: number): boolean {
  return Math.abs(deltaY) > Math.abs(deltaX);
}
