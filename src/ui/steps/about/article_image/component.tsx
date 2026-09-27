import { useState } from 'react';
import originalImage from '../../../../assets/images/should-we.webp';
import p40Image from '../../../../assets/images/peter-bloomfield-32-p40.webp';
import p60Image from '../../../../assets/images/peter-bloomfield-32-p60-sat.webp';
import styles from './styles.module.css';

const variants = {
  original: undefined,
  p40: { image: p40Image, width: 356, height: 323 },
  p60: { image: p60Image, width: 533, height: 484 },
} as const;

export type ArticleImageVariant = keyof typeof variants;

export function ArticleImage({ variant }: { variant: ArticleImageVariant }) {
  const [showDithered, setShowDithered] = useState(true);
  const overlay = variants[variant];
  const Frame = overlay ? 'button' : 'div';

  return (
    <Frame
      className={styles.frame}
      type={overlay ? 'button' : undefined}
      aria-label={overlay ? 'Dithered image' : undefined}
      aria-pressed={overlay ? showDithered : undefined}
      onClick={overlay ? () => setShowDithered((show) => !show) : undefined}
    >
      <img
        className={styles.original}
        src={originalImage}
        width={889}
        height={807}
        alt="Photo caption: Peter Bloomfield staunchly opposes the proposed station. Photograph by Jessica Hromas. Quote: “I don’t see what good it would do to have a station there. I don’t see any benefits.”"
        loading="lazy"
        decoding="async"
      />
      {overlay && (
        <img
          className={styles.overlay}
          src={overlay.image}
          width={overlay.width}
          height={overlay.height}
          alt=""
          aria-hidden="true"
          hidden={!showDithered}
          loading="lazy"
          decoding="async"
        />
      )}
    </Frame>
  );
}
