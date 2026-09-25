import type { Answers } from '@common/form/types';
import { describe, expect, it } from 'vitest';
import { createHarness } from './fixture';
import { issuesFromMessages } from '../issues';

function problems(answers: Answers, hasSignature: boolean, today = '2026-09-25') {
  const { store, presenter } = createHarness(answers);
  return {
    ...presenter.problems(store, hasSignature),
    ...presenter.details.problems(store.details, today),
  };
}

function listIssues(answers: Answers, hasSignature: boolean) {
  return issuesFromMessages(problems(answers, hasSignature));
}

const answers: Answers = {
  reportTitle: 'DA 412/2025',
  meetingDate: '2099-10-14',
  stance: 'support',
  mode: 'person',
  honorific: '',
  fullName: 'Jane Citizen',
  company: '',
  address: '12 Example Street',
  phone: '0400 123 456',
  email: 'jane@example.com',
  rep: 'no',
  repDetails: '',
  accept: true,
  signDate: '2026-09-25',
};

describe('form validation', () => {
  it('accepts complete answers without optional details', () => {
    expect(problems(answers, true, '2026-09-25')).toEqual({});
  });

  it('only requires representative details when speaking for someone else', () => {
    expect(problems({ ...answers, rep: 'yes' }, true).repDetails).toContain('Missing');
    expect(problems(answers, true).repDetails).toBeUndefined();
  });

  it('reports issues in step order with the correct destination', () => {
    expect(
      listIssues({ ...answers, reportTitle: '', email: '' }, false).map(({ key, step }) => ({
        key,
        step,
      })),
    ).toEqual([
      { key: 'reportTitle', step: 1 },
      { key: 'email', step: 1 },
      { key: 'signature', step: 2 },
    ]);
  });

  it('flags past meetings and malformed contact details without preventing export', () => {
    const issues = problems(
      { ...answers, meetingDate: '2020-01-01', phone: '123', email: 'jane@' },
      true,
      '2026-09-25',
    );
    expect(Object.keys(issues)).toEqual(['meetingDate', 'phone', 'email']);
  });
});
