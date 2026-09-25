import styles from './styles.module.css';

export function Marquee() {
  return (
    <div
      className={styles.root}
      aria-hidden="true"
    >
      <div className={styles.track}>
        {[0, 1].map(copy => (
          <span
            className={styles.copy}
            key={copy}
          >
            {[0, 1, 2, 3].map(repeat => (
              <span
                className={styles.phrase}
                key={repeat}
              >
                speak at council
              </span>
            ))}
          </span>
        ))}
      </div>
    </div>
  );
}
