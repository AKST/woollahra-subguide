import type { Answers } from '@common/form/types';

/**
 * Site settings. This is the file to edit for each meeting.
 *
 * Edit `prefill` below: it appears at the top of the combined "Your Deets" step.
 * Completed report/date values are shown as an editable summary.
 * Speaking position and both attendance options remain visible.
 * People can still change these answers. Leave a value as '' to have people fill it in.
 * `prefill.stance` also sets the position this tool assists with. Confirm it against
 * the actual Council motion: supporting more homes may mean objecting to that motion.
 * Set stance to '' to allow either position until the wording is confirmed.
 * A link like `?item=…&date=2026-10-14&stance=support&mode=person` overrides these values.
 */
export default {
  enableDeetsAnimation: true, // False keeps plain "Your Deets" without the question mark or scramble.
  enableEmailInitialCopy: false, // Set true to prefill a random email message and show its preview.
  enableWhyThisIsImportant: true, // Show the "Why is this Important?" section on About.
  exhibition: {
    startDate: '2026-09-08',
    endDate: '2026-10-07', // State Plan submissions close at 5pm Sydney time.
  },
  prefill: {
    reportTitle:
      '12.1 – Council Submission to the Edgecliff-Woollahra Precinct State-led Rezoning Proposal',
    meetingDate: '2026-09-30', // 30/09/2026. Edit using YYYY-MM-DD.
    stance: 'objection', // Assisted position: 'support', 'objection', or '' for either.
    mode: '', // No default; people choose 'zoom' or 'person'.
  },
} satisfies {
  enableDeetsAnimation: boolean;
  enableEmailInitialCopy: boolean;
  enableWhyThisIsImportant: boolean;
  exhibition: { startDate: string; endDate: string };
  prefill: Pick<Answers, 'reportTitle' | 'meetingDate' | 'stance' | 'mode'>;
};
