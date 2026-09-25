import type { ReactNode } from 'react';
import styles from './styles.module.css';

const NOOP_CLICK = () => {};

export function Button({
  id,
  type = 'button',
  variant = 'primary',
  disabled,
  busy,
  onClick = NOOP_CLICK,
  children,
}: {
  id: string | undefined;
  type: 'button' | 'submit' | undefined;
  variant: 'primary' | 'secondary' | 'ghost' | 'small' | undefined;
  disabled: boolean;
  busy: boolean;
  onClick: (() => void) | undefined;
  children?: ReactNode;
}) {
  let className = styles.btn;
  if (variant === 'small') className = styles['small-button'];
  else if (variant !== 'primary') className += ` ${styles[`btn-${variant}`]}`;

  return (
    <button
      id={id}
      type={type}
      className={className}
      disabled={disabled || busy}
      aria-busy={busy || undefined}
      onClick={onClick}
    >
      {children}
    </button>
  );
}

export function DownloadLink({ url, name }: { url: string; name: string }) {
  return (
    <a
      id="downloadLink"
      className={styles.btn}
      href={url}
      download={name}
    >
      Download PDF
    </a>
  );
}

export function EmailLink({ url }: { url: string }) {
  return (
    <a
      id="emailLink"
      className={styles.btn}
      href={url}
    >
      Email Woollahra Council
    </a>
  );
}
