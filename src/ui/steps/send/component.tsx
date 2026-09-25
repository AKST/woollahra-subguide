import type { ComponentType } from 'react';
import type { Answers } from '@common/form/types';
import styles from './styles.module.css';

const links = {
  statePlan:
    'https://www.planningportal.nsw.gov.au/ppr/under-exhibition/edgecliff-woollahra-precinct',
} as const;

export function Send({
  aboutHref,
  Issues,
  Download,
  Email,
  deadline,
  mode,
}: {
  aboutHref: string;
  Issues: ComponentType;
  Download: ComponentType;
  Email: ComponentType;
  deadline: string;
  mode: Answers['mode'];
}) {
  return (
    <div className={styles.root}>
      <Issues />
      <ol className={styles['send-steps']}>
        <li>
          <Download />
        </li>
        <li>
          <Email />
        </li>
        <li>
          <div>
            <p className={styles.copy}>
              <strong>
                Send it before <span id="deadline">{deadline}</span>.
              </strong>{' '}
              Council doesn't accept late forms.
            </p>
          </div>
        </li>
        <li>
          <div>
            <p className={styles.copy}>
              You'll eventually hear back from a council staffer, meanwhile:
            </p>
            <ul className={styles.copy}>
              <li>
                <span className={styles.accent}>
                  Get crackin on what you plan to say at the public forum
                </span>
                .
              </li>
              <li>
                In the mean time:
                <ul>
                  <li>
                    Consider also writing a{' '}
                    <a
                      href={links.statePlan}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      submission in support of the state plan
                    </a>
                  </li>
                  <li>
                    If you need to some tips on what to say{' '}
                    <a href={aboutHref}>you can look here</a>.
                  </li>
                  <li>
                    More than likely writing the sub will help with what you want to say on the 30
                    <sup>th</sup>, and vice versa.
                  </li>
                </ul>
              </li>
            </ul>
          </div>
        </li>
        <li>
          <div>
            <p className={styles.copy}>
              {mode === 'person'
                ? 'Head to Council Chambers, 536 New South Head Road, Double Bay.'
                : mode === 'zoom'
                  ? 'By the 30th a council staffer should have got in touch (a call or an email), and you should have a Zoom link.'
                  : 'Head to Council Chambers, 536 New South Head Road, Double Bay, or use the Zoom link from Council if you registered to speak online.'}
            </p>
          </div>
        </li>
      </ol>
    </div>
  );
}
