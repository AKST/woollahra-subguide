import { expect, it, vi } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { ObservableStore, observable, useObservable } from '../observable';

class Store extends ObservableStore {
  @observable count = 0;
  @observable value = { label: 'first' };
}

it('only notifies for changed assignments and supports unsubscribe', () => {
  const store = new Store();
  expect(store.version).toBe(0);
  const listener = vi.fn();
  const unsubscribe = store.subscribe(listener);
  store.count = 0;
  expect(listener).not.toHaveBeenCalled();
  store.count = 1;
  store.value = { label: 'second' };
  expect(listener).toHaveBeenCalledTimes(2);
  expect(store.version).toBe(2);
  unsubscribe();
  store.count = 2;
  expect(listener).toHaveBeenCalledTimes(2);
});

it('updates React subscribers without cloning the store', () => {
  const store = new Store();
  const { result, unmount } = renderHook(() => useObservable(store).count);
  act(() => {
    store.count = 3;
  });
  expect(result.current).toBe(3);
  unmount();
});
