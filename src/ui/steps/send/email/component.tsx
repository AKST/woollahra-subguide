import { EmailLink } from '@ui/common/button/component';
import { CopyButton } from '@ui/common/copy_button/component';
import styles from './styles.module.css';

export function Email({
  address,
  subject,
  body,
  emailUrl,
}: {
  address: string;
  subject: string;
  body: string;
  emailUrl: string;
}) {
  return (
    <div className={styles.root}>
      <p className={styles.copy}>
        <strong>Email it to Woollahra Council</strong> with the PDF attached.
      </p>
      <div>
        <EmailLink url={emailUrl} />
      </div>
      {body && (
        <details className={styles.preview}>
          <summary>Preview email</summary>
          <p>
            <strong>To:</strong> {address}
          </p>
          <p>
            <strong>Subject:</strong> {subject}
          </p>
          <CopyButton
            id="emailBody"
            text={body}
            label="Copy message"
          />
        </details>
      )}
      <CopyButton
        id="emailAddress"
        text={address}
        label="Copy address"
      />
      <CopyButton
        id="emailSubject"
        text={subject}
        label="Copy subject"
        truncate
      />
      <p className={styles.reminder}>
        <strong>Remember to attach the form</strong>
      </p>
      <p className={`${styles.note} ${styles.copy}`}>
        Apparently you can deliver this in person, if you really want. At 536 New South Head Road,
        Double Bay.
      </p>
    </div>
  );
}
