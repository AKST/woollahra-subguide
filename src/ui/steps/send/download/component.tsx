import { Button, DownloadLink } from '@ui/common/button/component';
import styles from './styles.module.css';

export function Download({
  name,
  url,
  byteLength,
  canShare,
  shareError,
  showCompletionNote,
  onShare,
}: {
  name: string;
  url: string | undefined;
  byteLength: number;
  canShare: boolean;
  shareError: string | undefined;
  showCompletionNote: boolean;
  onShare: () => void;
}) {
  return (
    <div className={styles.root}>
      <p className={styles.copy}>
        <strong>Download the PDF</strong> and open it to check it.
      </p>
      {showCompletionNote && (
        <p className={styles.reminder}>
          Remember to fill out the form.
        </p>
      )}
      <div className={styles['copy-row']}>
        {url != null && (
          <DownloadLink
            url={url}
            name={name}
          />
        )}
        {canShare && (
          <Button
            id="shareButton"
            type="button"
            variant="secondary"
            disabled={false}
            busy={false}
            onClick={onShare}
          >
            Share or email…
          </Button>
        )}
        <p
          role="alert"
          hidden={shareError == null}
        >
          {shareError}
        </p>
      </div>
      <p
        className={styles.note}
        id="fileName"
      >
        {name} · {Math.max(1, Math.round(byteLength / 1024))} KB
      </p>
    </div>
  );
}
