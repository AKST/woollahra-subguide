import styles from './styles.module.css';

const links = {
  councilEmail: 'mailto:records@woollahra.nsw.gov.au',
  councilRegistration:
    'https://www.woollahra.nsw.gov.au/Council/Meetings-and-committees/Having-Your-Say-At-Meetings',
} as const;

export function Introduction({
  downloadHref,
  outsideScope,
  onSend,
}: {
  downloadHref: string;
  outsideScope: boolean;
  onSend: () => void;
}) {
  return (
    <div className={styles.introduction}>
      <h2 tabIndex={-1}>
        What's this About<span className={styles.question}>?</span>
      </h2>
      <p>
        If you want to see more homes in Woollahra, consider speaking against the council's
        submission (to the states plan), which seeks to promote their alternative plan which cuts
        the number of homes by more than a half.
      </p>
      <p>
        To speak, you need to <a href={links.councilEmail}>email</a> the council a
        PDF you fill out, which you can find on the councils website{' '}
        <a href={links.councilRegistration} target="_blank" rel="noopener noreferrer">
          here
        </a>
        . Alternatively if that seems like a hassle, this form can cut out a few steps and build the
        PDF in your browser without the info ever leaving your device{' '}
        <i>(turn on airplan mode; it'll still work!)</i>.
      </p>
      <p>
        If at any point you don't want to enter something here, you can jump to the end download the
        PDF and enter it locally (like the signature).{' '}
        <a
          href={outsideScope ? undefined : downloadHref}
          aria-disabled={outsideScope || undefined}
          onClick={event => {
            event.preventDefault();
            if (!outsideScope) onSend();
          }}
        >
          In fact you can do that now
        </a>
        , if you want. You'll find the councils contact details, and a recommended email heading
        towards the end as well.
      </p>
      <p>
        Lastly, <b>Disclaimer</b> I am not Woollahra Council, I am not the state government (nor am
        I affliated with either of them), I am just some dude. But I am a dude who wants to see more
        homes in Woollahra. <i>Also if it needs to be said,
        I'm not a developer or work for one, I don't even own
        land (or a home/appartment), let alone land in the
        proposed upzoned area</i>.
      </p>
    </div>
  );
}
