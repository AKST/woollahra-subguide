import type { ReactNode } from 'react';
import styles from './styles.module.css';

const NOOP_CHANGE = (_checked: boolean) => {};

export function Checkbox({
  id,
  checked,
  invalid,
  disabled,
  onChange = NOOP_CHANGE,
  children,
}: {
  id: string;
  checked: boolean;
  invalid: boolean;
  disabled: boolean;
  onChange: ((checked: boolean) => void) | undefined;
  children?: ReactNode;
}) {
  return (
    <label className={styles.checkbox}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={event => onChange(event.target.checked)}
      />
      <span>{children}</span>
    </label>
  );
}
