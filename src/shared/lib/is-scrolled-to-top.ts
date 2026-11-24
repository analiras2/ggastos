const SCROLLABLE_OVERFLOW = /(auto|scroll)/;
// Browsers report fractional sizes, so a one pixel difference is not real overflow.
const OVERFLOW_TOLERANCE = 1;

// Whether the touched content is at its top: the nearest vertical scroller between the touched
// element and the host must not be scrolled down. With no scroller, the content fits and is at the top.
export function isScrolledToTop(target: EventTarget | null, host: HTMLElement): boolean {
  let element = target instanceof HTMLElement ? target : null;
  while (element && element !== host) {
    const { overflowY } = window.getComputedStyle(element);
    const canScroll =
      SCROLLABLE_OVERFLOW.test(overflowY) && element.scrollHeight > element.clientHeight + OVERFLOW_TOLERANCE;
    if (canScroll) {
      return element.scrollTop <= 0;
    }
    element = element.parentElement;
  }
  return true;
}
