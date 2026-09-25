import { useEffect, useId, useRef, useState } from 'react';
import type { ReactNode } from 'react';
import styles from './styles.module.css';

export function Popover({ label, children }: { label: string; children: ReactNode }) {
  const id = useId();
  const panelRef = useRef<HTMLSpanElement>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const pointerOpened = useRef(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const panel = panelRef.current;
    const trigger = triggerRef.current;
    if (!panel || !trigger) return;
    // React 18 doesn't expose the native popover attributes or toggle event yet.
    panel.setAttribute('popover', 'auto');
    const position = () => {
      if (!panel.matches(':popover-open')) return;
      const anchor = trigger.getBoundingClientRect();
      const { width, height } = panel.getBoundingClientRect();
      const left = Math.max(16, Math.min(anchor.left, window.innerWidth - width - 16));
      const above = anchor.top - height - 8;
      const top = Math.max(
        16,
        Math.min(above >= 16 ? above : anchor.bottom + 8, window.innerHeight - height - 16),
      );
      panel.style.left = `${left}px`;
      panel.style.top = `${top}px`;
    };
    const toggle = () => {
      setOpen(panel.matches(':popover-open'));
      position();
    };
    panel.addEventListener('toggle', toggle);
    window.addEventListener('scroll', position, true);
    window.addEventListener('resize', position);
    return () => {
      panel.removeEventListener('toggle', toggle);
      window.removeEventListener('scroll', position, true);
      window.removeEventListener('resize', position);
    };
  }, [id]);

  return (
    <>
      <span
        ref={triggerRef}
        role="button"
        tabIndex={0}
        className={styles.trigger}
        aria-expanded={open}
        aria-controls={id}
        aria-describedby={open ? id : undefined}
        onPointerDown={() => {
          pointerOpened.current = panelRef.current?.matches(':popover-open') ?? false;
        }}
        onClick={event => {
          // Native light dismissal can close the panel before a pointer click arrives.
          panelRef.current?.togglePopover(event.detail ? !pointerOpened.current : undefined);
        }}
        onKeyDown={event => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            if (!event.repeat) panelRef.current?.togglePopover();
          }
        }}
      >
        {label}
      </span>
      <span
        ref={panelRef}
        id={id}
        role="note"
        className={styles.panel}
      >
        {children}
      </span>
    </>
  );
}
