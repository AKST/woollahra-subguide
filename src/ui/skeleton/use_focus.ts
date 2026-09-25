import { useLayoutEffect, useRef } from 'react';
import type { FieldKey } from '@common/form/types';
import { STEP } from '@common/form/steps';
import { stepFromHash } from '@common/form/routes';

export function useFocus(step: number, focusField: FieldKey | undefined) {
  const rootRef = useRef<HTMLDivElement>(null);
  const initialStep = useRef<number | undefined>(stepFromHash(window.location.hash));
  const previousFocus = useRef<{ step: number; field: FieldKey | undefined }>();

  useLayoutEffect(() => {
    const root = rootRef.current;
    const content = root?.querySelector<HTMLElement>('#formContent');
    if (root && root.dataset.layoutFrozen !== 'true')
      root.dataset.compact = String(step > STEP.details || focusField != null);
    const previous = previousFocus.current;
    previousFocus.current = { step, field: focusField };
    // Route selection can finish after mount, particularly when preparing a PDF.
    // Leave the initial scroll position alone, including StrictMode's effect replay.
    if (initialStep.current === step && focusField == null) {
      initialStep.current = undefined;
      return;
    }
    if (!previous || (previous.step === step && previous.field === focusField)) return;
    initialStep.current = undefined;
    const mobile = window.matchMedia('(max-width: 700px)').matches;
    if (focusField != null) {
      const field = root?.querySelector<HTMLElement>(`[data-field="${focusField}"]`);
      if (!field) return;
      // scrollIntoView also scrolls the document around the desktop pane.
      // Align the field label within the one container that owns scrolling.
      if (mobile) {
        window.scrollTo({
          top: window.scrollY + field.getBoundingClientRect().top - 24,
          behavior: 'instant',
        });
      } else if (content) {
        content.scrollTo({
          top:
            content.scrollTop +
            field.getBoundingClientRect().top -
            content.getBoundingClientRect().top -
            24,
          behavior: 'instant',
        });
      }
      field
        .querySelector<HTMLElement>('input, textarea, canvas, button')
        ?.focus({ preventScroll: true });
      return;
    }
    if (content) content.scrollTop = 0;
    if (mobile)
      root?.querySelector('#progress')?.scrollIntoView({ block: 'start' });
    root
      ?.querySelector<HTMLElement>(`section[data-step="${step}"] h2`)
      ?.focus({ preventScroll: true });
  }, [step, focusField]);

  return rootRef;
}
