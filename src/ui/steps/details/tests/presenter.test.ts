import { describe, expect, it } from 'vitest';
import { STEP } from '@common/form/steps';
import { createHarness, completeAnswers, deferred } from '../../tests/fixture';

describe('combined first step', () => {
  it('summarises prefilled agenda values and allows changing Zoom to in person', () => {
    const { store, presenter } = createHarness({ ...completeAnswers, mode: 'zoom' });
    expect(store.details.agendaExpanded).toBe(false);
    expect(store.answers.mode).toBe('zoom');
    presenter.details.change(store.details, 'mode', 'person');
    expect(store.answers.mode).toBe('person');
    expect(
      createHarness({ ...completeAnswers, reportTitle: '' }).store.details.agendaExpanded,
    ).toBe(true);
  });

  it('opens hidden agenda controls and focuses attendance when fixing issues', async () => {
    const { store, presenter } = createHarness({ ...completeAnswers, mode: 'zoom' });
    await presenter.goTo(store, STEP.send);
    await presenter.fixIssue(store, {
      key: 'reportTitle',
      step: STEP.details,
      label: 'Report title',
      message: 'Missing',
    });
    expect(store.details.agendaExpanded).toBe(true);
    expect(store.focusField).toBe('reportTitle');
    await presenter.fixIssue(store, {
      key: 'mode',
      step: STEP.details,
      label: 'Attendance',
      message: 'Missing',
    });
    expect(store.focusField).toBe('mode');
  });

  it('blocks later steps for objections and restores existing answers when support is selected', async () => {
    const { store, presenter, pdf } = createHarness();
    presenter.representing.change(store.representing, 'repDetails', 'Our neighbourhood');
    presenter.details.change(store.details, 'stance', 'objection');
    expect(store.outsideScope).toBe(true);
    expect(await presenter.goTo(store, STEP.send)).toBe(false);
    expect(await presenter.goTo(store, STEP.declaration)).toBe(false);
    expect(pdf.buildPdf).not.toHaveBeenCalled();
    presenter.details.change(store.details, 'stance', 'support');
    expect(store.details.answers.fullName).toBe(completeAnswers.fullName);
    expect(store.representing.answers.repDetails).toBe('Our neighbourhood');
    expect(await presenter.goTo(store, STEP.declaration)).toBe(true);
  });

  it('cancels an in-flight export when the stance changes to objection', async () => {
    const { store, presenter, pdf } = createHarness();
    const pending = deferred<Uint8Array>();
    pdf.buildPdf.mockReturnValueOnce(pending.promise);
    const navigation = presenter.goTo(store, STEP.send);
    await Promise.resolve();
    await Promise.resolve();
    presenter.details.change(store.details, 'stance', 'objection');
    pending.resolve(new Uint8Array([1]));
    expect(await navigation).toBe(false);
    expect(store.step).toBe(STEP.details);
    expect(store.pendingStep).toBeUndefined();
    expect(store.send.data).toBeUndefined();
  });

  it('assists objections when configured and preserves the selected position in the PDF', async () => {
    const { store, presenter } = createHarness(
      { ...completeAnswers, stance: 'objection' },
      'objection',
    );
    expect(store.outsideScope).toBe(false);
    expect(await presenter.goTo(store, STEP.editor)).toBe(true);
    expect(store.editor.answers?.stance).toBe('objection');
    presenter.details.change(store.details, 'stance', 'support');
    expect(store.outsideScope).toBe(true);
    expect(store.step).toBe(STEP.details);
    expect(await presenter.goTo(store, STEP.send)).toBe(false);
    presenter.details.change(store.details, 'stance', 'objection');
    expect(await presenter.goTo(store, STEP.send)).toBe(true);
    expect(store.details.answers.fullName).toBe(completeAnswers.fullName);
  });

  it('does not let initial answer overrides change the assisted position', async () => {
    const { store, presenter } = createHarness(
      { ...completeAnswers, stance: 'objection' },
      'support',
    );
    expect(store.outsideScope).toBe(true);
    expect(await presenter.goTo(store, STEP.declaration)).toBe(false);
  });

  it('allows either position when the configured stance is blank', async () => {
    const { store, presenter } = createHarness(completeAnswers, '');
    for (const stance of ['support', 'objection'] as const) {
      presenter.details.change(store.details, 'stance', stance);
      expect(store.outsideScope).toBe(false);
      expect(await presenter.goTo(store, STEP.editor)).toBe(true);
      await presenter.goTo(store, STEP.details);
    }
  });
});
