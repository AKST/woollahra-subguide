import { useEffect, useState } from 'react';
import { REDUCED_MOTION_QUERY } from '@common/motion';
import styles from './styles.module.css';

const INITIAL = 'Your Deets';
const FINAL = 'Your Details';
const LETTERS = 'abcdefghijklmnopqrstuvwxyz';
const FRAMES = 24;

export function DeetsLabel({ reducedMotion: forced }: { reducedMotion: boolean }) {
  const [frame, setFrame] = useState(() =>
    forced || window.matchMedia(REDUCED_MOTION_QUERY).matches
      ? { text: FINAL, progress: 1 }
      : { text: INITIAL, progress: 0 },
  );

  useEffect(() => {
    const reducedMotion = window.matchMedia(REDUCED_MOTION_QUERY);
    let delay: number | undefined;
    let interval: number | undefined;
    const stop = () => {
      window.clearTimeout(delay);
      window.clearInterval(interval);
    };
    const finish = () => {
      stop();
      setFrame({ text: FINAL, progress: 1 });
    };
    const onMotionChange = () => {
      if (reducedMotion.matches) finish();
    };
    if (forced || reducedMotion.matches) finish();
    else {
      delay = window.setTimeout(() => {
        let tick = 0;
        interval = window.setInterval(() => {
          const progress = ++tick / FRAMES;
          const settled = Math.floor(progress * FINAL.length);
          const text = Array.from(FINAL, (letter, index) => {
            if (letter === ' ' || index >= FINAL.length - settled) return letter;
            const random = LETTERS[Math.floor(Math.random() * LETTERS.length)];
            return index === 0 ? random.toUpperCase() : random;
          }).join('');
          setFrame({ text, progress });
          if (tick === FRAMES) stop();
        }, 60);
      }, 2000);
    }
    reducedMotion.addEventListener('change', onMotionChange);
    return () => {
      stop();
      reducedMotion.removeEventListener('change', onMotionChange);
    };
  }, [forced]);

  return (
    <span className={styles.label}>
      <span className={styles.accessible}>{FINAL}</span>
      <span
        className={styles.sizer}
        aria-hidden="true"
      >
        {FINAL}
      </span>
      <span
        className={styles.visual}
        aria-hidden="true"
      >
        {frame.text}
        <sup
          className={styles.question}
          style={{ opacity: Math.max(0, 1 - frame.progress * 4) }}
        >
          ?
        </sup>
      </span>
    </span>
  );
}
