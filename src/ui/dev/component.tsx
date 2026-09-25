import styles from './styles.module.css';
import { FONTS, THEMES } from './appearance';
import type { FontChoice, ThemeChoice } from './appearance';

export function DemoTools({
  disabled,
  status,
  onFill,
  font,
  theme,
  onFontChange,
  onThemeChange,
}: {
  disabled: boolean;
  status: string;
  onFill: () => void;
  font: FontChoice;
  theme: ThemeChoice;
  onFontChange: (font: FontChoice) => void;
  onThemeChange: (theme: ThemeChoice) => void;
}) {
  return (
    <aside
      className={styles.root}
      aria-label="Local development tools"
    >
      <details>
        <summary>Appearance</summary>
        <div className={styles.panel}>
          <label htmlFor="devFont">Interface font</label>
          <select
            id="devFont"
            value={font}
            onChange={event => onFontChange(event.target.value as FontChoice)}
          >
            {(Object.keys(FONTS) as FontChoice[]).map(value => (
              <option
                key={value}
                value={value}
              >
                {FONTS[value].label}
              </option>
            ))}
          </select>
          <p>Inter is bundled locally and used when Helvetica isn’t installed.</p>
          <label htmlFor="devTheme">Colour scheme</label>
          <select
            id="devTheme"
            disabled
            value={theme}
            onChange={event => onThemeChange(event.target.value as ThemeChoice)}
          >
            {(Object.keys(THEMES) as ThemeChoice[]).map(value => (
              <option
                key={value}
                value={value}
              >
                {THEMES[value]}
              </option>
            ))}
          </select>
          <p>Dark mode is temporarily disabled.</p>
          <p>Preview settings reset on refresh.</p>
          <p
            id="demoStatus"
            role="status"
          >
            {status}
          </p>
        </div>
      </details>
      <button
        type="button"
        onClick={onFill}
        disabled={disabled}
        title={status}
        aria-describedby="demoStatus"
      >
        Prefill demo
      </button>
    </aside>
  );
}
