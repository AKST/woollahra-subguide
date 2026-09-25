import { useLayoutEffect, useRef } from 'react';
import type { RefObject } from 'react';

/** About and registration details expand and collapse the desktop heading on scroll. */
export function useContentScroll(
  rootRef: RefObject<HTMLDivElement>,
  frozen: boolean,
  headerResizable: boolean,
) {
  const contentRef = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const root = rootRef.current;
    const content = contentRef.current;
    if (!root || !content) return;
    if (frozen) return freezeHeader(root);
    if (!headerResizable) {
      root.dataset.compact = 'true';
      return;
    }
    const onScroll = () => {
      root.dataset.compact = String(content.scrollTop > 12);
    };
    onScroll();
    content.addEventListener('scroll', onScroll, { passive: true });
    return () => content.removeEventListener('scroll', onScroll);
  }, [rootRef, frozen, headerResizable]);
  return contentRef;
}

/** Capture interpolated values too, so a selection during a transition never snaps. */
function freezeHeader(root: HTMLElement): () => void {
  const snapshots = Array.from(
    root.querySelectorAll<HTMLElement>('[data-header-motion]'),
    element => {
      const computed = getComputedStyle(element);
      return {
        element,
        previousStyle: element.getAttribute('style'),
        values: (element.dataset.headerMotion ?? '')
          .split(' ')
          .map(property => [property, computed.getPropertyValue(property)] as const),
      };
    },
  );
  for (const { element, values } of snapshots) {
    element.style.transition = 'none';
    element.style.animation = 'none';
    for (const [property, value] of values) element.style.setProperty(property, value);
  }
  return () => {
    for (const { element, previousStyle } of snapshots) {
      if (previousStyle == null) element.removeAttribute('style');
      else element.setAttribute('style', previousStyle);
    }
  };
}
