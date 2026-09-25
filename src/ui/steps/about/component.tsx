import { STEP } from '@common/form/steps';
import { Popover } from '@ui/common/popover/component';
import { Button } from '@ui/common/button/component';
import styles from './styles.module.css';
import type { ComponentType } from 'react';
import shouldWeImage from '../../../assets/images/should-we.webp';

const links = {
  smh2025JulWoollahraStation:
    'https://www.smh.com.au/national/nsw/no-brainer-architects-developers-ready-to-pounce-on-woollahra-ghost-station-20250714-p5metw.html',
  westmeadSouth: 'https://www.planningportal.nsw.gov.au/ppr/post-exhibition/westmead-south',
  stateAnnouncement:
    'https://www.planning.nsw.gov.au/news/next-stop-woollahra-train-station-delivering-ten-thousand-new-homes-heart-sydney',
  productivityCommission:
    'https://www.nsw.gov.au/departments-and-agencies/nsw-productivity-and-equality-commission/document-library/review-of-housing-supply-challenges-and-policy-options-for-nsw',
  austinHousing:
    'https://www.pew.org/en/research-and-analysis/articles/2026/03/18/austins-surge-of-new-housing-construction-drove-down-rents',
  aucklandHousing: 'https://onefinaleffort.com/auckland',
  statePlan:
    'https://www.planningportal.nsw.gov.au/ppr/under-exhibition/edgecliff-woollahra-precinct',
  councilPlan:
    'https://www.woollahra.nsw.gov.au/Building-and-development/State-Led-Rezoning-Around-Edgecliff-and-proposed-Woollahra-Stations',
  // Item 16.3: motion dated 12 April, adopted 26 April 2021; printed page 194.
  housingTargets2021:
    'https://hdp-au-prod-app-woollahra-yoursay-files.s3.ap-southeast-2.amazonaws.com/7816/6971/6785/Council-Minutes-26-Apr-2021.pdf#page=34',
  housingDemand2026:
    'https://www.woollahra.nsw.gov.au/files/assets/public/v/1/building-and-development/documents/edgecliff-and-woollahra-development-feasibility-assessment-savills.pdf#page=6',
  smh2022SepSewage: 'https://www.smh.com.au/national/nsw/residents-kick-up-a-stink-over-plan-to-end-dumping-their-sewage-in-the-ocean-20220824-p5bcd3.html',
  smh2023OctSewage: 'https://www.smh.com.au/national/nsw/well-connected-residents-in-last-ditch-fight-to-stop-sewage-works-at-harbour-s-hidden-gem-20231004-p5e9nm.html',
  e61WhatDensityDoes: 'https://e61.in/what-local-land-use-reform-does-and-doesnt-do/',
  shitHeritage: 'https://yoursay.woollahra.nsw.gov.au/rosebaysps',
  smh2025OctSpeakmen: 'https://www.smh.com.au/politics/nsw/the-nsw-libs-have-picked-a-side-in-the-housing-war-now-they-face-their-next-fight-20251015-p5n2ok.html',
  smh2025OctCompetitiveYimby: 'https://www.smh.com.au/politics/nsw/coalition-sets-its-sights-on-inner-west-rail-corridor-for-more-housing-20251022-p5n4gh.html',
  smh2025SepLongBay: 'https://www.smh.com.au/politics/nsw/the-jail-the-light-rail-and-the-eastern-suburbs-housing-war-20250916-p5mvdb.html',
} as const;

export function About({
  active,
  onSignUp,
  Calendar,
  enableWhyThisIsImportant,
}: {
  active: boolean;
  onSignUp: () => void;
  Calendar: ComponentType;
  enableWhyThisIsImportant: boolean;
}) {
  return (
    <section
      className={styles.about}
      data-step={STEP.about}
      hidden={!active}
      aria-labelledby="aboutTitle"
    >
      <h2
        id="aboutTitle"
        className={styles.introTitle}
        tabIndex={-1}
      >
        What's this About<span className={styles.question}>?</span>
      </h2>
      <p>
        On the 30th of September 2026, Woollahra Council will be voting on a submission against the
        state government's plan to place over{' '}
        <Popover label="10k homes in their LGA">
          Note, the NSW Government also exhibited plans for up to 13,000 new homes in Westmead South
          from 19 August to 16 September 2026. I think that’s been relatively uncontroversial
          compared with this.{' '}
          <a
            href={links.westmeadSouth}
            target="_blank"
            rel="noopener noreferrer"
          >
            Read the Westmead South proposal.
          </a>
        </Popover>{' '}
        in favour of their own plan for 3.6k homes.
      </p>
      <h2
        id="aboutTitle"
        className={styles.introTitle}
        tabIndex={-1}
      >
        What State plan<span className={styles.question}>?</span>
      </h2>
      <p>
        In 2025 the{' '}
        <a href={links.stateAnnouncement} target="_blank" rel="noopener noreferrer">
          NSW state government announced
        </a>{' '}
        one of the biggest breaks from the status quo in NSW planning, in the form of the Woollahra
        station reopening and rezoning. No longer will the western suburbs carry the responsibility
        for supporting new housing growth, and it shows the state government is serious about making
        places where people want to live more affordable. The implications of this go far beyond
        Woollahra, and will lead to wider affordability effects throughout Sydney.
      </p>
      <h2
        className={styles.introTitle}
        tabIndex={-1}
      >
        Why Woollahra, Specifically<span className={styles.question}>?</span>
      </h2>
      <p>
        The{' '}
        <a href={links.productivityCommission} target="_blank" rel="noopener noreferrer">
          NSW Productivity Commission
        </a>{' '}
        says Woollahra is one of the single most feasible places to build new homes in Sydney. The
        only thing stopping them is planning. As a result, over the last 50 years, Woollahra's
        population has dropped by 11% while the rest of Greater Sydney's population has grown by
        74%.
      </p>
      <p>
        New homes improve affordability. There's plenty of evidence that says this. We're seeing
        this in{' '}
        <a href={links.austinHousing} target="_blank" rel="noopener noreferrer">
          Austin, Texas
        </a>{' '}
        and we saw this in <a href={links.aucklandHousing} target="_blank" rel="noopener noreferrer">Auckland, New Zealand</a>.
        There's no reason we can't see this in Sydney.
      </p>
      <h2
        className={styles.introTitle}
        tabIndex={-1}
      >
        The Plans
      </h2>
      <p>For your convenience, you can view the two plans here:</p>
      <div className={styles.links}>
        <a
          className={styles.plan}
          href={links.statePlan}
          target="_blank"
          rel="noopener noreferrer"
        >
          State Plan
        </a>
        <a
          className={styles.plan}
          href={links.councilPlan}
          target="_blank"
          rel="noopener noreferrer"
        >
          Woollahra Plan
        </a>
      </div>
      <Calendar />
      <h2 className={styles.introTitle}>What to say</h2>
      <p>
        Firstly, you need to write this yourself, and
        its easier than you think. Literally all you
        need to do is about how this affects you.
      </p>
      <ul className={styles.talkingPoints}>
        <li>
          <b>How far do you travel to work or uni</b>, what would change
          {' '}<Popover label="if you could live closer to the city">
            Generally what happens when areas like this
            don't densify is the people that would like
            to live here move further out to their second
            choice.
            <br/><br/>
            As a result of not building enough homes after
            serveral decades, we have this to serveral degrees
            where people are moving to their 4th/5th whatever-th
            preference, and people who would like to live those
            places are moved their nth preference. So this affects
            you even if you don't even care about Woollahra.
            <br/><br/>
            The way we undo this is building a ton of new homes
            everywhere people want to live, including Woollahra.
            <br/><br/>
            If we do that, places closer to the city and higher
            paying jobs becomes more accessible to more people.
          </Popover>?{' '}
          <span className={styles.question}>
            Is it fair that the people who already live here{' '}
            <b>want to make that choice for you</b>?
          </span>
        </li>
        <li>
          <b>How much are your housing costs?</b> How does
          that affect your quality of life?
        </li>
        <li>
          <b>Is changing that less important</b> than
          preserving the village aesthetic of one of the
          most well to do LGAs in all of Sydney?
        </li>
      </ul>
      <p>
        You probably know it's a NIMBY council, but how NIMBY?
      </p>
      <ul className={styles.talkingPoints}>
        <li>
          In 2021, the council council was asked to increase the
          number homes they build to roughly 100 a year, but
          they <a href={links.housingTargets2021} target="_blank" rel="noopener noreferrer">Complaining (item 16.3)</a>
          {' '}this was too many.
        </li>
        <li>
          In an effort to defend its poor housing record, the council
          suggested there was only demand for 100–125 new apartments
          a year based on <a href={links.housingDemand2026} target="_blank" rel="noopener noreferrer">historic
          construction completeions</a> (estimating 200–250 a
          year in the short term).
        </li>
        <li>
          They've gone as far to avoid upgrading sewage
          infrastucture (which was pumping sewage into the ocean,{' '}
          <a href={links.smh2022SepSewage} target="_blank" rel="noopener noreferrer">2022</a>,{' '}
          <a href={links.smh2023OctSewage} target="_blank" rel="noopener noreferrer">2023</a>)
          just so they can continue to claim they lack the
          infrastructure for new housing (Here's a{' '}
          <a href={links.shitHeritage} target="_blank" rel="noopener noreferrer">Local heriage listing as well</a>).
        </li>
      </ul>
      <p>
        More generally:
      </p>
      <ul className={styles.talkingPoints}>
        <li>
          <b>Council says we need more time for
          consultation</b>, is there even any confusion
          what woollahra residents think? And
          is it even relevant?
        </li>
        <li>
          There's a lot of talk around{' '}
          <Popover label="heritage">
            <b>If a heritage items falls over and no on knows
            about it, does it make a sound?</b> The reason
            we're building more homes here is to address
            housing costs.
            <br/><br/>
            To prioritise buildings purely on the
            basis of novelity that no one is familar (besides
            the increasingly small people who can afford to
            live here) over adressing housing costs,
            strikes me as the wrong priority?
          </Popover>, but
          if you look at the state plan, is actually{' '}
          <Popover label="pretty sympathetic">
            The state plan is a bit like swiss cheese
            except the upzoning is the holes<sup>1</sup>, and
            the new heights and floor space limit are only
            available to DAs conditional on some incentive
            they need to provide (which is what the state
            government meant when it said value capture).
            <br/><br/>
            This is by no means bad, but it would great if
            the allowed heights controls were even more
            generous and were available on more sites.
            <br/><br/>
            Woollahra council should consider themselves
            likely the State govt even took area character
            concerns seriously at all.
            <br/><br/>
            <em>
              <sup>[1]</sup> This is mostly in reference to
              the changes to max heights and FSR, there has
              been a blanket change in zone, which should
              allow the LMR to active easier.
            </em>
          </Popover>.
        </li>
      </ul>
      <p>
        You can go on and on about how NIMBY Woollahra is
        the states plan can also be justified on the
        merit and quality life improvements that come
        with density:
      </p>
      <ul className={styles.talkingPoints}>
        <li>
          If you live in an appartment talk about why and
          the benefits, especially when located in a{' '}
          <Popover label="walkable area">
            Woollahra would make a great walkable area
          </Popover>.
        </li>
        <li>
          At least children of the families here will have
          a <Popover label="chance">
            Before their parents pass away
          </Popover> to continue living in the area
          they grew up.
        </li>
      </ul>
      {enableWhyThisIsImportant && (
        <>
          <h2 className={styles.introTitle}>
            Why is this Important<span className={styles.question}>?</span></h2>
          <p>
            The reason we're here today and this is even happening
            to begin with, is because the state government has
            seen people (like you) speak up at councils in favour
            of new homes.
            For the last few decades, this just didn't happen,
            and it was a vote winner to make life hard for{' '}
            <Popover label="anyone looking to build new homes">
              To be fair, developers are also hardly deserving of
              sympathy with their behaviour at times.
              <br/><br/>
              However cutting down on the number of new homes
              in response to that is like cutting off your nose
              to spite your face.
            </Popover>.
          </p>
          <p>
            For a breif moment there was mutual{' '}
            <a href={links.smh2025OctSpeakmen} target="_blank" rel="noopener noreferrer">agreement</a>{' '}
            on boths sides, on what needs to be done about the
            housing crisis, and opposition responded to the suggestion
            of upzoning Woollahra with some of their own proposals to
            {' '}<a href={links.smh2025OctCompetitiveYimby} target="_blank" rel="noopener noreferrer">additional parts
            of Sydney</a> and some{' '}
            <a href={links.smh2025SepLongBay} target="_blank" rel="noopener noreferrer">Labour held parts of
            Sydney</a>. However the LNP has a new state party leader
            and its been a while since we've seen much of that.
          </p>
          <p>
            If you're a young person who feels locked out of the
            housing market or someone whose paying much more rent than
            you were 5 years ago, and you're watching this from the
            sidelines — If you can — I encourage you to play a more
            active role. As it'll help signal to the opposition
            that they're pursuing a dead-end in politics.
          </p>
        </>
      )}
      <h2 className={styles.introTitle} tabIndex={-1}>Should we consider what <i>existing residents</i> want?</h2>
      <p>
        Don't worry they can take care of that, and up to
        this point they were the only people who were ever
        considered.
      </p>
      <figure>
        <img
          className={styles.articleImage}
          src={shouldWeImage}
          width={889}
          height={807}
          alt="Photo caption: Peter Bloomfield staunchly opposes the proposed station. Photograph by Jessica Hromas. Quote: “I don’t see what good it would do to have a station there. I don’t see any benefits.”"
          loading="lazy"
          decoding="async"
        />
        <figcaption className={styles.articleCaption}>
          Read here <a href={links.smh2025JulWoollahraStation} target="_blank" rel="noopener noreferrer">in the SMH (July 2025)</a>.
        </figcaption>
      </figure>
      <div className={styles.actions}>
        <Button
          id={undefined}
          type="button"
          variant="primary"
          disabled={false}
          busy={false}
          onClick={onSignUp}
        >
          I want to sign up to speak
        </Button>
      </div>
    </section>
  );
}
