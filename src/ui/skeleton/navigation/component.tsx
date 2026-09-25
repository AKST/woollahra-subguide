import { forwardRef } from 'react';
import type { StepNavigationItem } from '@ui/steps/controller';
import styles from './styles.module.css';
import { Marquee } from './marquee/component';

export const Navigation = forwardRef<
  HTMLElement,
  {
    items: readonly StepNavigationItem[];
    disabled: boolean;
    onGo: (step: number) => void;
  }
>(function Navigation({ items, disabled, onGo }, ref) {
  const renderItem = ({
    href,
    step,
    label,
    Label,
    visible,
    current,
    before,
    currentKind,
  }: StepNavigationItem) => (
    <li
      hidden={!visible}
      key={step}
      className={`${current ? styles.current : ''} ${before ? styles.before : ''}`}
    >
      <a
        className={styles.link}
        href={href}
        aria-label={label}
        aria-disabled={disabled || undefined}
        aria-current={current ? currentKind : undefined}
        onClick={event => {
          if (
            event.metaKey ||
            event.ctrlKey ||
            event.shiftKey ||
            event.altKey ||
            event.button !== 0
          )
            return;
          event.preventDefault();
          if (!disabled) onGo(step);
        }}
      >
        <span
          className={styles.number}
          aria-hidden="true"
        >
          {String(step).padStart(2, '0')}
        </span>
        <span className={styles.label}>{Label ? <Label /> : label}</span>
      </a>
    </li>
  );
  return (
    <nav
      ref={ref}
      className={styles.progress}
      id="progress"
      aria-label="Navigation"
    >
      <ol className={styles.overview}>{items.filter(item => item.step === 0).map(renderItem)}</ol>
      <div
        className={styles.registration}
        role="group"
        aria-label="Speak at council"
      >
        <Marquee />
        <ol>{items.filter(item => item.step > 0).map(renderItem)}</ol>
      </div>
    </nav>
  );
});
