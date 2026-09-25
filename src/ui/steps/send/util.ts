import { formatShortDate, stripAccents } from '@common/format';
import type { Answers } from '@common/form/types';

/** Edit the greetings, message patterns and sign-offs here to change the email copy. */
export const EMAIL_OPENINGS = [
  'hi,',
  'Hi,',
  'hello,',
  'Hello,',
  'Hey,',
  'hey,',
  'Hey.',
  'Hey there,',
  'Council,',
  'council,',
  'To Council,',
  'To the Council,',
  'To the council,',
  'To Woollahra Council,',
  'To Woollahra council,',
  'woollahra council,',
  '',
] as const;

// Combine short sentence patterns and form descriptions into distinct messages.
// Keeping the meeting date in the subject lets the body stay brief.
const FORM_DESCRIPTIONS = [
  'my public forum registration form',
  'my registration form for the public forum',
  'my form to register for the public forum',
  'my public forum registration',
  'my registration for the public forum',
  'my registration for the Public Forum',
  'my public forum speaker registration',
  'my registration form to speak at the public forum',
  'my speaker registration form for the public forum',
  'my form for speaking at the public forum',
  'my registration to speak at the public forum',
] as const;

const MESSAGE_TEMPLATES = [
  'Please find {form} attached.',
  'Please see {form} attached.',
  'Attached is {form}.',
  'I’ve attached {form}.',
  'I’m sending through {form}.',
  'Here is {form}.',
  'I’ve included {form} as an attachment.',
  'I’ve attached {form} for your records.',
  'I’m submitting {form}.',
  'I’m emailing {form}.',
] as const;

export const EMAIL_MESSAGES = MESSAGE_TEMPLATES.flatMap(template =>
  FORM_DESCRIPTIONS.map(form => template.replace('{form}', form)),
);

export const EMAIL_SIGNOFFS = [
  'Thanks,',
  'Many thanks,',
  'Thank you,',
  'Kind regards,',
  'Regards,',
  'Best,',
  'Best regards,',
  'With thanks,',
  'Cheers,',
  'All the best,',
] as const;

export const EMAIL_SEPARATORS = [' ', '\n', '\n\n'] as const;
export const EMAIL_SIGNOFF_SEPARATORS = ['\n', '\n\n'] as const;

export interface EmailSpacing {
  afterOpening: (typeof EMAIL_SEPARATORS)[number];
  beforeSignoff: (typeof EMAIL_SIGNOFF_SEPARATORS)[number];
}

const SUBJECT_LAYOUTS = [
  'Public Forum Registration - {date}',
  'Public Forum Registration: {date}',
  'Public Forum Registration ({date})',
  '{date} - Public Forum Registration',
  '{date}: Public Forum Registration',
  '({date}) Public Forum Registration',
] as const;

const SUBJECT_DATE_FORMATS = [
  'YYYY-MM-DD',
  'DD-MM-YYYY',
  'DD/MM/YYYY',
  'DDMM',
  'D MMM YYYY',
  'D MMM',
] as const;

export const EMAIL_SUBJECT_FORMATS = SUBJECT_LAYOUTS.flatMap(template =>
  SUBJECT_DATE_FORMATS.map(dateFormat => ({ template, dateFormat })),
);

function subjectDate(iso: string, format: (typeof SUBJECT_DATE_FORMATS)[number]): string {
  if (!iso) return '';
  const [year, month, day] = iso.split('-');
  const monthName =
    ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][
      Number(month) - 1
    ] ?? month;
  return {
    'YYYY-MM-DD': iso,
    DDMMYYYY: `${day}${month}${year}`,
    'DD-MM-YYYY': `${day}-${month}-${year}`,
    'DD-MM-YY': `${day}-${month}-${year.slice(-2)}`,
    'DD/MM/YYYY': formatShortDate(iso),
    'DD/MM/YY': `${day}/${month}/${year.slice(-2)}`,
    DDMM: `${day}${month}`,
    'D MMM YYYY': `${Number(day)} ${monthName} ${year}`,
    'D MMM': `${Number(day)} ${monthName}`,
  }[format];
}

export function fileNameFor(answers: Answers) {
  const surname = stripAccents(answers.fullName.split(' ').pop() ?? '').replace(/[^\w-]/g, '');
  return `${['Public-forum-registration', surname, answers.meetingDate].filter(Boolean).join('_')}.pdf`;
}

export function emailSubject(
  answers: Answers,
  format: (typeof EMAIL_SUBJECT_FORMATS)[number] = EMAIL_SUBJECT_FORMATS[0],
) {
  const date = subjectDate(answers.meetingDate, format.dateFormat);
  const heading = date ? format.template.replace('{date}', date) : 'Public Forum Registration';
  return [heading, answers.reportTitle.trim()].filter(Boolean).join(' - ');
}

export function emailBody(
  a: Answers,
  opening: string,
  message: string,
  signoff: string,
  spacing: EmailSpacing,
  includeName: boolean,
) {
  const fullName = a.fullName.trim();
  const name = includeName && fullName ? `\n${fullName}` : '';
  const closing = name ? signoff : signoff.replace(/,\s*$/, '');
  return `${opening}${spacing.afterOpening}${message}${spacing.beforeSignoff}${closing}${name}`.trim();
}
