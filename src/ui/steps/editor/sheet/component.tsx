import { useLayoutEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import type { Box } from '@common/form/types';
import { boxStyle } from '../util';
import styles from './styles.module.css';

export function Sheet({
  src,
  page,
  pageCount,
  pageWidth,
  target,
  onDeselect,
  children,
}: {
  src: string;
  page: number;
  pageCount: number;
  pageWidth: number;
  target: Box | undefined;
  onDeselect: () => void;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const sheet = ref.current;
    if (sheet == null) return;
    const resize = () => sheet.style.setProperty('--k', String(sheet.clientWidth / pageWidth));
    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(sheet);
    return () => observer.disconnect();
  }, [pageWidth]);

  return (
    <div
      ref={ref}
      className={styles.sheet}
      style={{ backgroundImage: `url("${src}")` }}
      role="group"
      data-sheet={page}
      aria-label={`Page ${page + 1} of the form with your answers`}
      onPointerDown={event => {
        if (event.target === event.currentTarget) onDeselect();
      }}
    >
      <span className={styles['sheet-label']}>
        Page {page + 1} of {pageCount}
      </span>
      {target != null && (
        <div
          className={styles['target-box']}
          style={boxStyle(target)}
        />
      )}
      {children}
    </div>
  );
}
