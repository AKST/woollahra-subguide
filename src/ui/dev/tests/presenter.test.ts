import { createStepsController } from '@ui/steps/controller';
import { STEP } from '@common/form/steps';
import { describe, expect, it, vi } from 'vitest';
import { createHarness } from '@ui/steps/tests/fixture';
import { DemoPresenter, DemoStore } from '../presenter';
import { defaultPreset, readPreset } from '../preset';

function harness() {
  const app = createHarness();
  const storage = { read: vi.fn().mockReturnValue(null), write: vi.fn() };
  const store = new DemoStore();
  const presenter = new DemoPresenter(
    storage,
    createStepsController(app.store, app.presenter).development!,
  );
  return { app, storage, store, presenter };
}

describe('local demo defaults', () => {
  it('saves individual edits without overwriting untouched demo values', () => {
    const { app, storage, store, presenter } = harness();
    const dispose = presenter.attach(store);
    app.presenter.details.change(app.store.details, 'fullName', 'New Demo Name');
    const saved = JSON.parse(storage.write.mock.lastCall![1]);
    expect(saved.answers.fullName).toBe('New Demo Name');
    expect(saved.answers.company).toBe('Example Community Group');
    app.presenter.details.change(app.store.details, 'fullName', '');
    expect(JSON.parse(storage.write.mock.lastCall![1]).answers.fullName).toBe('');
    dispose();
    storage.write.mockClear();
    app.presenter.details.change(app.store.details, 'fullName', 'Not saved');
    expect(storage.write).not.toHaveBeenCalled();
  });

  it('loads saved values only when the prefill button is used', async () => {
    const { app, storage, store, presenter } = harness();
    const preset = defaultPreset();
    preset.answers.fullName = 'Saved Name';
    storage.read.mockReturnValue(JSON.stringify(preset));
    const dispose = presenter.attach(store);
    expect(app.store.answers.fullName).toBe('Jane Citizen');
    await presenter.fill(store);
    expect(app.store.answers.fullName).toBe('Saved Name');
    expect(app.store.answers.accept).toBe(true);
    expect(app.store.declaration.signature.mode).toBe('type');
    expect(app.store.dirty).toBe(true);
    dispose();
  });

  it('refreshes an open preview after prefilling', async () => {
    const { app, store, presenter } = harness();
    const dispose = presenter.attach(store);
    await app.presenter.goTo(app.store, STEP.editor);
    await presenter.fill(store);
    expect(app.store.step).toBe(STEP.editor);
    expect(app.store.editor.answers?.company).toBe('Example Community Group');
    expect(store.applying).toBe(false);
    dispose();
  });

  it('handles invalid or unavailable storage without breaking prefilling', async () => {
    expect(readPreset('{bad json').answers.fullName).toBe('Jane Citizen');
    expect(readPreset('{"answers":{},"signature":{}}').answers.fullName).toBe('Jane Citizen');
    const { app, storage, store, presenter } = harness();
    storage.read.mockImplementation(() => {
      throw new Error('Denied');
    });
    storage.write.mockImplementation(() => {
      throw new Error('Quota exceeded');
    });
    const dispose = presenter.attach(store);
    await presenter.fill(store);
    expect(app.store.answers.company).toBe('Example Community Group');
    expect(store.status).toContain('Could not save');
    dispose();
  });
});
