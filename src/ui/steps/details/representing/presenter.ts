import { ObservableStore, observable } from '@common/observable';
import type { Answers, FieldMessages } from '@common/form/types';

export type RepresentingAnswers = Pick<Answers, 'rep' | 'repDetails'>;

export class RepresentingStore extends ObservableStore {
  @observable answers: RepresentingAnswers;
  @observable messages: FieldMessages = {};

  constructor(answers: RepresentingAnswers) {
    super();
    this.answers = {
      rep: answers.rep,
      repDetails: answers.repDetails,
    };
  }
}

export class RepresentingPresenter {
  constructor(private readonly onChange: () => void) {}

  change<Key extends keyof RepresentingAnswers>(
    store: RepresentingStore,
    key: Key,
    value: RepresentingAnswers[Key],
  ): void {
    store.answers = { ...store.answers, [key]: value };
    store.messages = { ...store.messages, [key]: undefined };
    this.onChange();
  }

  problems(store: RepresentingStore): FieldMessages {
    const a = store.answers;
    const p: FieldMessages = {};
    if (!a.rep) p.rep = 'Missing. Choose yes or no.';
    if (a.rep === 'yes' && !a.repDetails.trim())
      p.repDetails = 'Missing. Add who you are speaking on behalf of.';
    return p;
  }
}
