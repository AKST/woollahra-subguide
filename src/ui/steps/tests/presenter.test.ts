import { STEP } from '@common/form/steps';
import { describe, expect, it } from 'vitest';
import { completeAnswers, createHarness, deferred } from './fixture';

describe('steps presenter', () => {
  it('keeps download errors hidden when navigating straight from About', async () => {
    const { store, presenter } = createHarness(undefined, undefined, '#?page=about');
    expect(store.visitedSteps.has(STEP.details)).toBe(false);
    await presenter.goTo(store, STEP.send);
    expect(store.send.data?.issues).toEqual([]);
    expect(store.send.data?.showCompletionNote).toBe(true);
    expect(store.visitedEnd).toBe(false);
  });

  it.each([STEP.details, STEP.declaration, STEP.editor])(
    'shows all incomplete-field errors after visiting only step %i',
    async visitedStep => {
      const { store, presenter } = createHarness(
        { ...completeAnswers, fullName: '' },
        undefined,
        '#?page=about',
      );
      await presenter.goTo(store, visitedStep);
      await presenter.goTo(store, STEP.send);
      expect(store.send.data?.issues.map(issue => issue.key)).toEqual(
        expect.arrayContaining(['fullName', 'signature']),
      );
      expect(store.send.data?.showCompletionNote).toBe(false);
      await presenter.goTo(store, STEP.about);
      await presenter.goTo(store, STEP.send);
      expect(store.send.data?.issues.some(issue => issue.key === 'signature')).toBe(true);
    },
  );

  it.each([
    ['', STEP.details],
    ['#?page=details', STEP.details],
    ['#?page=signature', STEP.declaration],
    ['#?page=check', STEP.editor],
  ] as const)('enables download errors when landing on %s', async (hash, step) => {
    const { store, presenter } = createHarness(undefined, undefined, hash);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(store.step).toBe(step);
    await presenter.goTo(store, STEP.about);
    await presenter.goTo(store, STEP.send);
    expect(store.send.data?.issues.some(issue => issue.key === 'signature')).toBe(true);
    expect(store.send.data?.showCompletionNote).toBe(false);
  });

  it('does not count a failed preview load as visiting step 03', async () => {
    const { store, presenter, pdf } = createHarness(undefined, undefined, '#?page=about');
    pdf.loadMetrics.mockRejectedValueOnce(new Error('Unavailable'));
    expect(await presenter.goTo(store, STEP.editor)).toBe(false);
    await presenter.goTo(store, STEP.send);
    expect(store.send.data?.issues).toEqual([]);
    expect(store.send.data?.showCompletionNote).toBe(true);
  });

  it('opens About without changing answers or preparing a PDF and supports browser history', async () => {
    const { store, presenter, browser, pdf } = createHarness();
    expect(store.step).toBe(STEP.details);
    presenter.details.change(store.details, 'fullName', 'Keep my answers');
    expect(await presenter.goTo(store, STEP.about)).toBe(true);
    expect(store.step).toBe(STEP.about);
    expect(browser.history.pushState).toHaveBeenLastCalledWith(
      { step: STEP.about },
      '',
      '#?page=about',
    );
    expect(pdf.loadMetrics).not.toHaveBeenCalled();
    const onPopState = browser.onPopState.mock.calls[0][0];
    browser.getHash.mockReturnValue('#?page=details');
    onPopState({ step: STEP.details });
    expect(store.step).toBe(STEP.details);
    expect(store.details.answers.fullName).toBe('Keep my answers');
    browser.getHash.mockReturnValue('#?page=about');
    onPopState({ step: STEP.about });
    expect(store.step).toBe(STEP.about);
  });

  it('allows reading About on the alternate-position path', async () => {
    const { store, presenter } = createHarness();
    presenter.details.change(store.details, 'stance', 'objection');
    expect(store.outsideScope).toBe(true);
    expect(await presenter.goTo(store, STEP.about)).toBe(true);
    expect(await presenter.goTo(store, STEP.details)).toBe(true);
    expect(await presenter.goTo(store, STEP.declaration)).toBe(false);
  });

  it('keeps substep state independent while reading one export snapshot', () => {
    const { store, presenter } = createHarness();
    const detailsVersion = store.details.version;
    const representingVersion = store.representing.version;
    store.details.messages = { fullName: 'Missing' };
    presenter.details.change(store.details, 'fullName', '  A new name  ');
    expect(store.details.answers.fullName).toBe('  A new name  ');
    expect(store.answers.fullName).toBe('A new name');
    expect(store.details.messages.fullName).toBeUndefined();
    expect(store.details.version).toBeGreaterThan(detailsVersion);
    expect(store.representing.version).toBe(representingVersion);
    expect(store.dirty).toBe(true);
    expect(store.revision).toBe(1);
  });

  it('creates the PDF from the same adjusted items as the preview', async () => {
    const { store, presenter, pdf } = createHarness();
    await presenter.goTo(store, STEP.declaration);
    await presenter.goTo(store, STEP.editor);
    presenter.editor.move(store.editor, 'phone', 20, 5);
    const preview = store.editor.items;
    expect(await presenter.goTo(store, STEP.send)).toBe(true);
    expect(pdf.buildPdf.mock.calls[0][0]).toEqual(preview);
    expect(store.send.data?.pdfBytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(store.dirty).toBe(false);
    expect(store.send.data?.issues.some(issue => issue.key === 'signature')).toBe(true);
  });

  it('rejects duplicate navigation and ignores work completed after disposal', async () => {
    const { store, presenter, pdf } = createHarness();
    const pending = deferred<Uint8Array>();
    pdf.buildPdf.mockReturnValueOnce(pending.promise);
    const navigation = presenter.goTo(store, STEP.send);
    await Promise.resolve();
    await Promise.resolve();
    expect(await presenter.goTo(store, STEP.editor)).toBe(false);
    presenter.dispose(store);
    pending.resolve(new Uint8Array([9]));
    expect(await navigation).toBe(false);
    expect(store.step).toBe(STEP.details);
    expect(store.pendingStep).toBeUndefined();
    expect(store.send.data).toBeUndefined();
  });

  it('clears busy state after a PDF error and allows retry', async () => {
    const { store, presenter, pdf } = createHarness();
    pdf.buildPdf.mockRejectedValueOnce(new Error('Unavailable'));
    expect(await presenter.goTo(store, STEP.send)).toBe(false);
    expect(store.error).toContain('Unavailable');
    expect(store.busy).toBe(false);
    expect(await presenter.goTo(store, STEP.send)).toBe(true);
    expect(store.error).toBeUndefined();
  });

  it('does not publish a PDF if answers changed while it was being created', async () => {
    const { store, presenter, pdf } = createHarness();
    const pending = deferred<Uint8Array>();
    pdf.buildPdf.mockReturnValueOnce(pending.promise);
    const navigation = presenter.goTo(store, STEP.send);
    await Promise.resolve();
    await Promise.resolve();
    presenter.details.change(store.details, 'fullName', 'Updated name');
    pending.resolve(new Uint8Array([9]));
    expect(await navigation).toBe(false);
    expect(store.send.data).toBeUndefined();
    expect(store.dirty).toBe(true);
  });

  it('interprets browser history in the presenter without pushing another entry', async () => {
    const { store, presenter, browser } = createHarness();
    await presenter.goTo(store, 3);
    browser.history.pushState.mockClear();
    const onPopState = browser.onPopState.mock.calls[0][0];
    browser.getHash.mockReturnValue('#?page=signature');
    onPopState({ step: 2 });
    expect(store.step).toBe(2);
    expect(browser.history.pushState).not.toHaveBeenCalled();
    presenter.dispose(store);
    expect(browser.onPopState.mock.results[0].value).toHaveBeenCalledOnce();
    expect(browser.onBeforeUnload.mock.results[0].value).toHaveBeenCalledOnce();
  });

  it('opens a send deep link and prepares its PDF, including after a StrictMode remount', async () => {
    const { store, presenter, browser, pdf } = createHarness(undefined, undefined, '#?page=send');
    presenter.dispose(store);
    browser.getHash.mockReturnValue('#?page=send');
    presenter.attach(store);
    presenter.dispose(store);
    presenter.attach(store);
    await new Promise(resolve => setTimeout(resolve, 0));
    expect(store.step).toBe(STEP.send);
    expect(store.send.data?.pdfBytes).toEqual(new Uint8Array([1, 2, 3]));
    expect(pdf.buildPdf).toHaveBeenCalledOnce();
    expect(store.send.data?.issues).toEqual([]);
    expect(store.send.data?.showCompletionNote).toBe(true);
    expect(store.details.messages).toEqual({});
    expect(store.declaration.messages).toEqual({});
    expect(store.visitedEnd).toBe(false);
    expect(browser.history.replaceState).toHaveBeenLastCalledWith(
      { step: STEP.send },
      '',
      '#?page=send',
    );
    await presenter.goTo(store, STEP.details);
    await presenter.goTo(store, STEP.declaration);
    await presenter.goTo(store, STEP.editor);
    await presenter.goTo(store, STEP.send);
    expect(store.send.data?.issues.some(issue => issue.key === 'signature')).toBe(true);
    expect(store.send.data?.showCompletionNote).toBe(false);
    expect(store.visitedEnd).toBe(true);
  });

  it('lets a hash change interrupt a PDF build and defaults unknown routes to details', async () => {
    const { store, presenter, browser, pdf } = createHarness();
    const pending = deferred<Uint8Array>();
    pdf.buildPdf.mockReturnValueOnce(pending.promise);
    const navigation = presenter.goTo(store, STEP.send);
    await Promise.resolve();
    await Promise.resolve();
    browser.getHash.mockReturnValue('#?page=signature');
    browser.onHashChange.mock.calls[0][0]();
    expect(store.step).toBe(STEP.declaration);
    pending.resolve(new Uint8Array([9]));
    expect(await navigation).toBe(false);
    expect(store.send.data).toBeUndefined();
    browser.getHash.mockReturnValue('#?page=does-not-exist');
    browser.onHashChange.mock.calls[0][0]();
    expect(store.step).toBe(STEP.details);
  });
});
