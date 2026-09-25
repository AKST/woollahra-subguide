import styles from './styles.module.css';

function Title() {
  return (
    <>
      Support <span className={styles.qualifier1}>the real</span>
      <br />
      <span
        className={styles.place}
        data-header-motion="color opacity"
      >
        Woollahra
      </span>{' '}
      <span className={styles.qualifier2}>Rezoning</span>
    </>
  );
}

export function Header({
  downloadHref,
  onSend,
  sendEnabled,
  accentTheme,
  onToggleTheme,
}: {
  downloadHref: string;
  onSend: () => void;
  sendEnabled: boolean;
  accentTheme: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <header
      className={styles['site-header']}
      data-header-motion="padding-top padding-bottom"
    >
      <svg
        className={`${styles.divider} ${styles.top}`}
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
        />
      </svg>
      <h1
        className={styles.title}
        aria-label="Speak on Woollahra Rezoning"
        data-header-motion="font-size"
      >
        <span
          className={styles.black}
          key={String(accentTheme)}
        >
          <Title />
        </span>
        {(['cyan', 'magenta', 'yellow'] as const).map(ink => (
          <span
            key={`${ink}-${accentTheme}`}
            className={`${styles.layer} ${styles[ink]}`}
            aria-hidden="true"
            data-header-motion="transform"
          >
            <span
              className={styles.impression}
              data-header-motion="transform"
            >
              <Title />
            </span>
          </span>
        ))}
        <button
          className={styles.themeToggle}
          type="button"
          aria-label="Toggle accent theme"
          aria-pressed={accentTheme}
          onClick={onToggleTheme}
        />
      </h1>
      <p
        className={styles.lede}
        data-header-motion="font-size transform"
      >
        To speak at Woollahra council, turns out you need to fill out a{' '}
        <strong className={styles.pdf}>PDF</strong>, lol. So this largely exists to make that less
        of a PITA.{' '}
        <a
          href={sendEnabled ? downloadHref : undefined}
          aria-disabled={!sendEnabled || undefined}
          id="sendLink"
          onClick={event => {
            event.preventDefault();
            if (sendEnabled) onSend();
          }}
        >
          Alternatively jump here to just download the PDF with only the agenda item prefilled
        </a>
        .
      </p>
      <svg
        className={`${styles.divider} ${styles.bottom}`}
        aria-hidden="true"
        focusable="false"
      >
        <line
          x1="0"
          y1="50%"
          x2="100%"
          y2="50%"
        />
      </svg>
    </header>
  );
}
