import { ObservableStore, observable } from '@common/observable';
import type { Answers } from '@common/form/types';
import type { StorageService } from '@service/storage/service';
import type { StepsDevelopmentController } from '@ui/steps/development';
import { defaultPreset, readPreset } from './preset';
import type { DemoPreset } from './preset';
import type { FontChoice, ThemeChoice } from './appearance';

export const DEMO_STORAGE_KEY = 'speak-woollahra:dev-preset:v1';

export class DemoStore extends ObservableStore {
  @observable status = 'Edits are saved as your next demo values on this browser.';
  @observable applying = false;
  @observable font: FontChoice = 'default';
  @observable theme: ThemeChoice = 'light';
  preset: DemoPreset = defaultPreset();
}

export class DemoPresenter {
  constructor(
    private readonly storage: StorageService,
    private readonly steps: StepsDevelopmentController,
  ) {}

  changeFont(store: DemoStore, font: FontChoice): void {
    store.font = font;
  }

  changeTheme(store: DemoStore, theme: ThemeChoice): void {
    store.theme = theme;
  }

  attach(store: DemoStore): () => void {
    store.preset = defaultPreset(this.steps.assistedStance || 'support');
    try {
      store.preset = readPreset(
        this.storage.read(DEMO_STORAGE_KEY),
        this.steps.assistedStance || 'support',
      );
    } catch {
      store.status = 'Browser storage is unavailable; demo values will last until reload.';
    }
    let previous = this.steps.getSnapshot().answers;
    let signature = this.steps.getSnapshot().signature;
    const saveChanges = () => {
      const snapshot = this.steps.getSnapshot();
      const answers = snapshot.answers;
      const changed = Object.fromEntries(
        (Object.keys(answers) as (keyof Answers)[])
          .filter(key => answers[key] !== previous[key])
          .map(key => [key, answers[key]]),
      );
      const signatureChanged = signature !== snapshot.signature;
      previous = answers;
      signature = snapshot.signature;
      if (store.applying || (!Object.keys(changed).length && !signatureChanged)) return;
      store.preset = {
        answers: { ...store.preset.answers, ...changed },
        signature: signatureChanged ? signature : store.preset.signature,
      };
      this.save(store);
    };
    return this.steps.subscribe(saveChanges);
  }

  async fill(store: DemoStore): Promise<void> {
    if (store.applying) return;
    store.applying = true;
    try {
      await this.steps.apply(store.preset);
      this.save(store);
    } finally {
      store.applying = false;
    }
  }

  private save(store: DemoStore): void {
    try {
      this.storage.write(DEMO_STORAGE_KEY, JSON.stringify(store.preset));
      store.status = 'Demo values saved. Your edits update them automatically.';
    } catch {
      store.status = 'Could not save demo values in browser storage; kept until reload.';
    }
  }
}
