import type { FieldKey, FieldMessages, Issue } from '@common/form/types';

/** Which step each checked answer lives on, in the order they're listed at the end. */
const FIELDS_BY_STEP: Record<number, FieldKey[]> = {
  1: [
    'reportTitle',
    'meetingDate',
    'stance',
    'mode',
    'fullName',
    'address',
    'phone',
    'email',
    'rep',
    'repDetails',
  ],
  2: ['accept', 'signature', 'signDate'],
};

const LABELS: Partial<Record<FieldKey, string>> = {
  reportTitle: 'Report title',
  meetingDate: 'Date of meeting',
  stance: 'In support or in objection',
  mode: 'In person or via Zoom',
  fullName: 'Full name',
  address: 'Address',
  phone: 'Phone',
  email: 'Email',
  rep: 'Legal representative or consultant',
  repDetails: 'Who you are speaking on behalf of',
  accept: 'Declaration',
  signature: 'Signature',
  signDate: 'Date signed',
};

/** Every issue as { key, step, label, message }, in form order. */
export function issuesFromMessages(p: FieldMessages): Issue[] {
  return Object.entries(FIELDS_BY_STEP).flatMap(([step, keys]) =>
    keys
      .filter(k => p[k])
      .map(k => ({ key: k, step: Number(step), label: LABELS[k] ?? k, message: p[k] ?? '' })),
  );
}
