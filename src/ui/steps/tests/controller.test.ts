import { describe, expect, it, vi } from 'vitest';
import { STEP } from '@common/form/steps';
import { createStepsController } from '../controller';
import { createHarness } from './fixture';

describe('steps controller', () => {
  it('notifies the shell about nested step state and releases both subscriptions', () => {
    const { store, presenter } = createHarness();
    const controller = createStepsController(store, presenter);
    const listener = vi.fn();
    const dispose = controller.subscribe(listener);
    const version = controller.getVersion();
    presenter.details.change(store.details, 'stance', 'objection');
    expect(listener).toHaveBeenCalled();
    expect(controller.getVersion()).toBeGreaterThan(version);
    const state = controller.getState();
    expect(state.outsideScope).toBe(true);
    expect(state.navigation.filter(item => item.visible).map(item => item.step)).toEqual([
      STEP.about,
      STEP.details,
    ]);
    expect(state.showPagination).toBe(false);
    dispose();
    listener.mockClear();
    presenter.details.change(store.details, 'fullName', 'No subscriber');
    store.error = 'No subscriber';
    expect(listener).not.toHaveBeenCalled();
  });

  it('owns navigation commands and supplies pagination and layout state to the shell', async () => {
    const { store, presenter } = createHarness();
    const controller = createStepsController(store, presenter);
    expect(await controller.next()).toBe(true);
    expect(controller.getState()).toMatchObject({
      step: STEP.declaration,
      headerResizable: false,
      canGoBack: true,
    });
    expect(await controller.back()).toBe(true);
    expect(controller.getState().step).toBe(STEP.details);
    expect(await controller.goTo(STEP.send)).toBe(true);
    expect(controller.getState()).toMatchObject({
      canGoNext: false,
      backLabel: 'Back to the form preview',
    });
    expect(store.send.data).toBeDefined();
    expect(await controller.next()).toBe(false);
    expect(await controller.goTo(STEP.about)).toBe(true);
    expect(await controller.back()).toBe(false);
  });
});
