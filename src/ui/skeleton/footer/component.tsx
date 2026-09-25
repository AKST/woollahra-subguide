import { Popover } from '@ui/common/popover/component';
import styles from './styles.module.css';

const links = {
  contact: 'mailto:angus@akst.io',
  source: 'https://github.com/AKST/woollahra-subguide',
} as const;

export function Footer() {
  return (
    <footer className={styles['site-footer']}>
      <p>
        <b>Note</b>: This tool doesn't collect or keep your information. The PDF is created on your
        device using JavaScript on your device's browser.{' '}
        <Popover label="NOTHING IS SENT ANYWHERE.">
          <span className={styles.privacyParagraph}>
            Technically, when you put the URL for this website in your browser
            sent a request to load this page. But that happens
            with every webpage you visit.
          </span>
          <span className={styles.privacyParagraph}>
            The important thing is nothing you enter in this site
            is sent anywhere (including the above), including but not
            limited to your signature, your address, any form input or input
            or link you click. More broadly no trackers or analtyics, e.g. if
            the site crashes for you I'll never know.
          </span>
          <span className={styles.privacyParagraph}>
            I would personally be more worried about the council handing
            any records you submit, given how few resources they've spent
            on the process for people making an application to speak at
            their council, than this website.
          </span>
        </Popover>{' '}
        Refreshing or
        closing this page clears everything you entered. This was built by <b>Angus Thomsen</b>.
        Contact him if you have any questions <a href={links.contact}>via email</a>.
        And you can view the{' '}
        <a href={links.source} target="_blank" rel="noopener noreferrer">source here</a>.
        Please start there before emailng me.
      </p>
    </footer>
  );
}
