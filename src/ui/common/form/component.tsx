import type { ReactNode } from 'react';
import styles from './styles.module.css';
import { TextInput } from '@ui/common/form/text_input/component';

const NOOP_CHANGE = (_value: string) => {};

export function Field({
  name,
  label,
  message,
  children,
}: {
  name: string;
  label: string;
  message: string | undefined;
  children?: ReactNode;
}) {
  return (
    <div
      className={styles.field}
      data-field={name}
    >
      <label htmlFor={name}>{label}</label>
      {children}
      <div
        id={`${name}Message`}
        className={styles['field-message']}
      >
        {message}
      </div>
    </div>
  );
}

export function TextField({
  name,
  label,
  value,
  type = 'text',
  placeholder,
  message,
  disabled,
  readOnly,
  onChange = NOOP_CHANGE,
}: {
  name: string;
  label: string;
  value: string;
  type: 'text' | 'email' | 'tel' | 'date' | undefined;
  placeholder: string | undefined;
  message: string | undefined;
  disabled: boolean;
  readOnly: boolean;
  onChange: ((value: string) => void) | undefined;
}) {
  return (
    <Field
      name={name}
      label={label}
      message={message}
    >
      <TextInput
        id={name}
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        invalid={Boolean(message)}
        describedBy={message ? `${name}Message` : undefined}
        onChange={value => onChange(value)}
        list={undefined}
        spellCheck={undefined}
      />
    </Field>
  );
}
