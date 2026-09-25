import styles from './styles.module.css';
import type { HTMLAttributes } from 'react';

const NOOP_CHANGE = (_value: string) => {};

export function TextInput({
  id,
  type,
  value,
  list,
  placeholder,
  spellCheck,
  describedBy,
  invalid,
  disabled,
  readOnly,
  onChange = NOOP_CHANGE,
  autoComplete,
  inputMode,
}: {
  id: string;
  type: 'text' | 'email' | 'tel' | 'date';
  value: string;
  list: string | undefined;
  placeholder: string | undefined;
  spellCheck: boolean | undefined;
  describedBy: string | undefined;
  invalid: boolean;
  disabled: boolean;
  readOnly: boolean;
  onChange: ((value: string) => void) | undefined;
  autoComplete?: string;
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode'];
}) {
  return (
    <input
      className={styles.input}
      id={id}
      name={id}
      autoComplete={autoComplete}
      inputMode={inputMode}
      type={type}
      value={value}
      list={list}
      placeholder={placeholder}
      spellCheck={spellCheck}
      aria-describedby={describedBy}
      aria-invalid={invalid}
      disabled={disabled}
      readOnly={readOnly}
      onChange={event => onChange(event.target.value)}
    />
  );
}

export function TextArea({
  id,
  value,
  rows,
  describedBy,
  invalid,
  disabled,
  readOnly,
  onChange = NOOP_CHANGE,
}: {
  id: string;
  value: string;
  rows: number;
  describedBy: string | undefined;
  invalid: boolean;
  disabled: boolean;
  readOnly: boolean;
  onChange: ((value: string) => void) | undefined;
}) {
  return (
    <textarea
      className={styles.textarea}
      id={id}
      value={value}
      rows={rows}
      aria-describedby={describedBy}
      aria-invalid={invalid}
      disabled={disabled}
      readOnly={readOnly}
      onChange={event => onChange(event.target.value)}
    />
  );
}
