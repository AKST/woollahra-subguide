import { ObservableStore, observable } from '@common/observable';
import { clamp } from '@common/util';
import type {
  Adjustments,
  Answers,
  FontMetrics,
  LayoutItem,
  SignatureImage,
} from '@common/form/types';
import { layoutAnswers } from '@common/form/layout';

export class EditorStore extends ObservableStore {
  @observable items: LayoutItem[] = [];
  @observable adjustments: Adjustments = {};
  @observable selectedId: string | undefined = undefined;
  @observable zoomed = false;
  answers: Answers | undefined = undefined;
  signature: SignatureImage | undefined = undefined;
  metrics: FontMetrics | undefined = undefined;

  get selected(): LayoutItem | undefined {
    return this.items.find(item => item.id === this.selectedId);
  }
}

export class EditorPresenter {
  constructor(private readonly onChange: () => void) {}

  show(
    store: EditorStore,
    answers: Answers,
    signature: SignatureImage | undefined,
    metrics: FontMetrics,
  ): void {
    store.answers = answers;
    store.signature = signature;
    store.metrics = metrics;
    this.#layout(store);
  }

  select(store: EditorStore, id: string | undefined): void {
    store.selectedId = id;
  }
  toggleZoom(store: EditorStore): void {
    store.zoomed = !store.zoomed;
  }

  move(store: EditorStore, id: string, dx: number, dy: number): void {
    store.adjustments = {
      ...store.adjustments,
      [id]: { dx, dy, scale: store.adjustments[id]?.scale ?? 1 },
    };
    this.#layout(store);
    this.onChange();
  }

  resize(store: EditorStore, id: string, factor: number): void {
    const current = store.adjustments[id] ?? { dx: 0, dy: 0, scale: 1 };
    store.adjustments = {
      ...store.adjustments,
      [id]: { ...current, scale: clamp(current.scale * factor, 0.4, 3) },
    };
    this.#layout(store);
    this.onChange();
  }

  reset(store: EditorStore, id: string | undefined): void {
    const adjustments = { ...store.adjustments };
    if (id == null) store.adjustments = {};
    else {
      delete adjustments[id];
      store.adjustments = adjustments;
    }
    this.#layout(store);
    this.onChange();
  }

  #layout(store: EditorStore): void {
    if (store.answers == null || store.metrics == null) return;
    store.items = layoutAnswers(store.answers, store.signature, store.adjustments, store.metrics);
  }
}
