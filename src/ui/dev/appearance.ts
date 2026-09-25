export const FONTS = {
  default: { label: 'Default — Helvetica → Inter', family: undefined },
  inter: { label: 'Inter', family: "'Inter', Arial, sans-serif" },
  arial: { label: 'Arial', family: 'Arial, sans-serif' },
  publicSans: { label: 'Public Sans', family: "'Public Sans', Arial, sans-serif" },
} as const;

export const THEMES = {
  system: 'System',
  light: 'Light',
  dark: 'Dark',
} as const;

export type FontChoice = keyof typeof FONTS;
export type ThemeChoice = keyof typeof THEMES;
