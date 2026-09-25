import { STEP } from '@common/form/steps';
import { expect, it, vi } from 'vitest';
import { completeAnswers, createHarness } from '@ui/steps/tests/fixture';
import { SendPresenter, SendStore } from '../presenter';
import {
  EMAIL_MESSAGES,
  EMAIL_OPENINGS,
  EMAIL_SIGNOFFS,
  EMAIL_SEPARATORS,
  EMAIL_SIGNOFF_SEPARATORS,
  EMAIL_SUBJECT_FORMATS,
  emailBody,
  emailSubject,
} from '../util';

it('offers at least 100 distinct short messages without unfilled placeholders', () => {
  expect(EMAIL_MESSAGES.length).toBeGreaterThanOrEqual(100);
  expect(new Set(EMAIL_MESSAGES).size).toBe(EMAIL_MESSAGES.length);
  for (const message of EMAIL_MESSAGES) {
    expect(message.length).toBeLessThan(100);
    expect(message).not.toMatch(/[{}\n]/);
    expect(message.toLowerCase()).toContain('public forum');
  }
});

it('chooses wording and spacing once, keeping email and sharing consistent', async () => {
  const { store: steps, browser } = createHarness();
  const random = vi
    .fn()
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0.999)
    .mockReturnValueOnce(0.999)
    .mockReturnValueOnce(0)
    .mockReturnValueOnce(0.5)
    .mockReturnValueOnce(0.25)
    .mockReturnValueOnce(0);
  const presenter = new SendPresenter(browser, 'records@example.com', random);
  const store = new SendStore();
  const data = { answers: steps.answers, pdfBytes: new Uint8Array([1]), issues: [] };
  presenter.setDownload(store, data);
  const body = store.body;
  expect(body).toBe(
    `${EMAIL_OPENINGS[0]} ${EMAIL_MESSAGES.at(-1)}\n\n${EMAIL_SIGNOFFS.at(-1)}\nJane Citizen`,
  );
  expect(new URL(presenter.emailUrl(store)).searchParams.get('body')).toBe(body);
  presenter.attach(store);
  await presenter.share(store);
  expect(browser.share.mock.lastCall?.[0].text).toContain(body);
  presenter.dispose(store);
  presenter.attach(store);
  presenter.setDownload(store, { ...data, answers: { ...data.answers, fullName: 'New Name' } });
  expect(store.body).toBe(body.replace('Jane Citizen', 'New Name'));
  expect(random).toHaveBeenCalledTimes(7);
});

it('supports all six spacing combinations without leading whitespace when the greeting is empty', () => {
  for (const afterOpening of EMAIL_SEPARATORS) {
    for (const beforeSignoff of EMAIL_SIGNOFF_SEPARATORS) {
      const spacing = { afterOpening, beforeSignoff };
      expect(
        emailBody(completeAnswers, 'Hi,', 'My form is attached.', 'Thanks,', spacing, true),
      ).toBe(`Hi,${afterOpening}My form is attached.${beforeSignoff}Thanks,\nJane Citizen`);
      expect(emailBody(completeAnswers, '', 'My form is attached.', 'Thanks,', spacing, true)).toBe(
        `My form is attached.${beforeSignoff}Thanks,\nJane Citizen`,
      );
    }
  }
});

it('keeps the name omitted across edits and regeneration when that option is chosen', () => {
  const { browser } = createHarness();
  const random = vi.fn().mockReturnValue(0.975);
  const presenter = new SendPresenter(browser, 'records@example.com', random);
  const store = new SendStore();
  const data = { answers: completeAnswers, pdfBytes: new Uint8Array([1]), issues: [] };
  presenter.setDownload(store, data);
  expect(store.includeName).toBe(false);
  const body = store.body;
  expect(body).not.toContain(completeAnswers.fullName);
  expect(body.endsWith(store.signoff!.replace(/,$/, ''))).toBe(true);
  expect(body).not.toMatch(/,\s*$/);
  presenter.setDownload(store, { ...data, answers: { ...completeAnswers, fullName: 'New Name' } });
  expect(store.body).toBe(body);
  expect(new URL(presenter.emailUrl(store)).searchParams.get('body')).toBe(body);
  expect(random).toHaveBeenCalledTimes(7);
});

it('keeps the sign-off comma only when a nonempty name follows it', () => {
  const spacing = { afterOpening: ' ', beforeSignoff: '\n' } as const;
  for (const signoff of EMAIL_SIGNOFFS) {
    const withName = emailBody(
      completeAnswers,
      'Hi,',
      'My form is attached.',
      signoff,
      spacing,
      true,
    );
    expect(withName.endsWith(`${signoff}\nJane Citizen`)).toBe(true);
    for (const [answers, includeName] of [
      [completeAnswers, false],
      [{ ...completeAnswers, fullName: ' ' }, true],
    ] as const) {
      const body = emailBody(answers, 'Hi,', 'My form is attached.', signoff, spacing, includeName);
      expect(body.endsWith(signoff.replace(/,$/, ''))).toBe(true);
      expect(body).not.toMatch(/,\s*$/);
    }
  }
});

it('omits generated copy from email and sharing when initial copy is disabled', async () => {
  const { browser } = createHarness();
  const random = vi.fn().mockReturnValue(0.5);
  const presenter = new SendPresenter(browser, 'records@example.com', random);
  const store = new SendStore(false);
  const data = { answers: completeAnswers, pdfBytes: new Uint8Array([1]), issues: [] };
  presenter.setDownload(store, data);
  expect(store.body).toBe('');
  expect(store.opening).toBeUndefined();
  expect(store.message).toBeUndefined();
  expect(store.signoff).toBeUndefined();
  expect(random).toHaveBeenCalledOnce(); // Subject formatting still varies.
  expect(store.subject).toBe('2099-10-14 - Public Forum Registration - DA 412/2025');
  const url = new URL(presenter.emailUrl(store));
  expect(url.searchParams.has('body')).toBe(false);
  expect(url.searchParams.get('subject')).toBe(store.subject);
  presenter.attach(store);
  await presenter.share(store);
  expect(browser.share.mock.lastCall?.[0].text).toBe(
    `Send to: records@example.com\nSubject: ${store.subject}`,
  );
  presenter.setDownload(store, {
    ...data,
    answers: { ...completeAnswers, fullName: 'New Name', meetingDate: '2026-09-30' },
  });
  expect(store.body).toBe('');
  expect(store.subject).toBe('2026-09-30 - Public Forum Registration - DA 412/2025');
  expect(random).toHaveBeenCalledOnce();
});

it('varies subject formatting while keeping the speaking item and handling missing details', () => {
  const answers = {
    ...completeAnswers,
    meetingDate: '2026-09-30',
    reportTitle: 'Agenda item 9 – Rezoning',
  };
  expect(
    EMAIL_SUBJECT_FORMATS.filter(format => format.dateFormat === 'DD/MM/YYYY').map(format =>
      emailSubject(answers, format),
    ),
  ).toEqual(
    [
      'Public Forum Registration - 30/09/2026',
      'Public Forum Registration: 30/09/2026',
      'Public Forum Registration (30/09/2026)',
      '30/09/2026 - Public Forum Registration',
      '30/09/2026: Public Forum Registration',
      '(30/09/2026) Public Forum Registration',
    ].map(subject => `${subject} - Agenda item 9 – Rezoning`),
  );
  expect(
    EMAIL_SUBJECT_FORMATS.filter(
      format => format.template === 'Public Forum Registration - {date}',
    ).map(format => emailSubject(answers, format)),
  ).toEqual(
    [
      'Public Forum Registration - 2026-09-30',
      'Public Forum Registration - 30-09-2026',
      'Public Forum Registration - 30/09/2026',
      'Public Forum Registration - 3009',
      'Public Forum Registration - 30 Sep 2026',
      'Public Forum Registration - 30 Sep',
    ].map(subject => `${subject} - Agenda item 9 – Rezoning`),
  );
  expect(new Set(EMAIL_SUBJECT_FORMATS.map(format => emailSubject(answers, format))).size).toBe(36);
  for (const format of EMAIL_SUBJECT_FORMATS) {
    expect(emailSubject({ ...answers, meetingDate: '' }, format)).toBe(
      'Public Forum Registration - Agenda item 9 – Rezoning',
    );
    expect(emailSubject({ ...answers, meetingDate: '', reportTitle: '' }, format)).toBe(
      'Public Forum Registration',
    );
  }
});

it('releases download URLs on replacement and unmount, and recreates them on remount', async () => {
  const { store, presenter, browser } = createHarness();
  await presenter.goTo(store, STEP.send);
  presenter.send.attach(store.send);
  expect(store.send.url).toBe('blob:form');
  expect(browser.createObjectURL).toHaveBeenCalledOnce();
  presenter.send.setDownload(store.send, { ...store.send.data!, pdfBytes: new Uint8Array([9]) });
  expect(browser.revokeObjectURL).toHaveBeenCalledWith('blob:form');
  expect(browser.createObjectURL).toHaveBeenCalledTimes(2);
  presenter.send.dispose(store.send);
  expect(store.send.url).toBeUndefined();
  presenter.send.attach(store.send);
  expect(browser.createObjectURL).toHaveBeenCalledTimes(3);
});

it('passes the PDF and email details to the share adapter', async () => {
  const { store, presenter, browser } = createHarness();
  await presenter.goTo(store, STEP.send);
  presenter.send.attach(store.send);
  await presenter.send.share(store.send);
  expect(browser.share).toHaveBeenCalledWith(
    expect.objectContaining({
      files: [store.send.file],
      text: expect.stringContaining('records@example.com'),
    }),
  );
});
