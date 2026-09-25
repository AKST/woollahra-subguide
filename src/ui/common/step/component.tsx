import type { ReactNode } from 'react';
import styles from './styles.module.css';

export function Step({
  number,
  active,
  title,
  intro,
  beforeTitle,
  children,
}: {
  number: number;
  active: boolean;
  title: ReactNode;
  intro: ReactNode;
  beforeTitle?: ReactNode;
  children?: ReactNode;
}) {
  const titleId = `step${number}Title`;

  return (
    <section
      className={styles.step}
      data-step={number}
      aria-labelledby={titleId}
      hidden={!active}
    >
      {beforeTitle}
      <h2
        id={titleId}
        tabIndex={-1}
      >
        {title}
      </h2>
      {intro != null && <p className={styles['step-intro']}>{intro}</p>}
      {children}
    </section>
  );
}
