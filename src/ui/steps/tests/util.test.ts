import { describe, expect, it } from 'vitest';
import { initialAnswers, trimAnswers } from '../util';

const prefill = {
  reportTitle: 'Default item',
  meetingDate: '2026-10-14',
  stance: 'support',
  mode: '',
};

describe('starting answers', () => {
  it('lets valid URL parameters override meeting settings', () => {
    const answers = initialAnswers(prefill, '?item=New+item&stance=against&mode=in-person');
    expect(answers.reportTitle).toBe('New item');
    expect(answers.meetingDate).toBe('2026-10-14');
    expect(answers.stance).toBe('objection');
    expect(answers.mode).toBe('person');
  });

  it('ignores empty and unknown overrides', () => {
    const answers = initialAnswers(prefill, '?item=&date=wrong&stance=maybe&mode=other');
    expect(answers.reportTitle).toBe(prefill.reportTitle);
    expect(answers.meetingDate).toBe(prefill.meetingDate);
    expect(answers.stance).toBe('support');
    expect(answers.mode).toBe('');
  });

  it('trims the exported snapshot without changing what is being edited', () => {
    const answers = { ...initialAnswers(prefill, ''), fullName: ' Jane Citizen ' };
    expect(trimAnswers(answers).fullName).toBe('Jane Citizen');
    expect(answers.fullName).toBe(' Jane Citizen ');
  });
});
