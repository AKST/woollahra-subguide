import { useSyncExternalStore } from 'react';

/** Observable fields use replacement semantics; nested mutations do not notify. */
export class ObservableStore {
  #subscribers = new Set<() => void>();
  version = 0;

  subscribe = (listener: () => void): (() => void) => {
    this.#subscribers.add(listener);
    return () => {
      this.#subscribers.delete(listener);
    };
  };

  notify(): void {
    this.version++;
    for (const listener of this.#subscribers) listener();
  }
}

/** Legacy property decorator, matching prop-scrapper's observable.ref-style stores. */
export function observable(prototype: object, key: string | symbol): void {
  const slot = Symbol(String(key));
  Object.defineProperty(prototype, key, {
    configurable: true,
    enumerable: true,
    get(this: Record<symbol, unknown>) {
      return this[slot];
    },
    set(this: ObservableStore & Record<symbol, unknown>, value: unknown) {
      const first = !(slot in this);
      if (!first && Object.is(this[slot], value)) return;
      this[slot] = value;
      if (!first) this.notify();
    },
  });
}

export function useObservable<Store extends ObservableStore>(store: Store): Store {
  useSyncExternalStore(store.subscribe, () => store.version);
  return store;
}
