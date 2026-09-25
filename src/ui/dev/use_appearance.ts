import { useLayoutEffect } from 'react';
import { FONTS } from './appearance';
import type { FontChoice, ThemeChoice } from './appearance';

/** Local preview overrides. Removing them restores the site's CSS defaults. */
export function useAppearance(font: FontChoice, theme: ThemeChoice) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.style.getPropertyValue('--sans');
    const family = FONTS[font].family;
    if (family) root.style.setProperty('--sans', family);
    else root.style.removeProperty('--sans');
    return () => {
      if (previous) root.style.setProperty('--sans', previous);
      else root.style.removeProperty('--sans');
    };
  }, [font]);

  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.theme;
    if (theme === 'system') delete root.dataset.theme;
    else root.dataset.theme = theme;
    return () => {
      if (previous == null) delete root.dataset.theme;
      else root.dataset.theme = previous;
    };
  }, [theme]);
}
