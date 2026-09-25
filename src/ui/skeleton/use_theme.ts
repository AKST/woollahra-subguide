import { useLayoutEffect } from 'react';

export function useTheme(accent: boolean) {
  useLayoutEffect(() => {
    const root = document.documentElement;
    const previous = root.dataset.accentTheme;
    root.dataset.accentTheme = String(accent);
    return () => {
      if (previous == null) delete root.dataset.accentTheme;
      else root.dataset.accentTheme = previous;
    };
  }, [accent]);
}
