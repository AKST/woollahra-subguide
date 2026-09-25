import type { ReactNode } from 'react';
import styles from './styles.module.css';

export function Row({
  columns,
  children,
}: {
  columns: 'two' | 'title-name';
  children?: ReactNode;
}) {
  return <div className={`${styles.row} ${styles[columns]}`}>{children}</div>;
}
