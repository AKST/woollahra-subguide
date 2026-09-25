import { sydneyNow } from '@common/format';
import type { Answers } from '@common/form/types';

interface Prefill {
  reportTitle: string | undefined;
  meetingDate: string | undefined;
  stance: string | undefined;
  mode: string | undefined;
}

export function initialAnswers(prefill: Prefill, search: string): Answers {
  const answers: Answers = {
    reportTitle: '',
    meetingDate: '',
    stance: '',
    mode: '',
    honorific: '',
    fullName: '',
    company: '',
    address: '',
    suburb: '',
    state: '',
    postcode: '',
    phone: '',
    email: '',
    rep: '',
    repDetails: '',
    accept: false,
    signDate: sydneyNow().date,
  };
  const params = new URLSearchParams(search);
  applyPrefill(answers, prefill);
  applyPrefill(answers, {
    reportTitle: params.get('item') ?? undefined,
    meetingDate: params.get('date') ?? undefined,
    stance: params.get('stance') ?? undefined,
    mode: params.get('mode') ?? undefined,
  });
  return answers;
}

function applyPrefill(answers: Answers, values: Prefill) {
  if (values.reportTitle?.trim()) answers.reportTitle = values.reportTitle.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(values.meetingDate?.trim() ?? '')) {
    answers.meetingDate = values.meetingDate!.trim();
  }

  const stance = values.stance?.toLowerCase();
  if (stance === 'support' || stance === 'for') answers.stance = 'support';
  else if (stance === 'objection' || stance === 'against') answers.stance = 'objection';

  const mode = values.mode?.toLowerCase();
  if (mode === 'person' || mode === 'in-person') answers.mode = 'person';
  else if (mode === 'zoom') answers.mode = 'zoom';
}

export function trimAnswers(answers: Answers): Answers {
  return {
    ...answers,
    reportTitle: answers.reportTitle.trim(),
    honorific: answers.honorific.trim(),
    fullName: answers.fullName.trim(),
    company: answers.company.trim(),
    address: answers.address.trim(),
    suburb: answers.suburb?.trim() ?? '',
    state: answers.state?.trim() ?? '',
    postcode: answers.postcode?.trim() ?? '',
    phone: answers.phone.trim(),
    email: answers.email.trim(),
    repDetails: answers.repDetails.trim(),
  };
}
