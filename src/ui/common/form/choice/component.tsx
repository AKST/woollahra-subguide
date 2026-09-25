import type { ReactNode } from 'react';
import styles from './styles.module.css';

const NOOP_CHANGE = () => {};

export function ChoiceGroup({ labelId, children }: { labelId: string; children?: ReactNode }) {
  return (
    <div
      className={styles.choices}
      role="radiogroup"
      aria-labelledby={labelId}
    >
      {children}
    </div>
  );
}

export function Choice({
  name,
  value,
  checked,
  invalid,
  disabled,
  onChange = NOOP_CHANGE,
  children,
}: {
  name: string;
  value: string;
  checked: boolean;
  invalid: boolean;
  disabled: boolean;
  onChange: (() => void) | undefined;
  children?: ReactNode;
}) {
  return (
    <label className={styles.choice}>
      <input
        type="radio"
        name={name}
        value={value}
        checked={checked}
        disabled={disabled}
        aria-invalid={invalid}
        onChange={onChange}
      />
      <span>{children}</span>
    </label>
  );
}
