import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { LayoutItem } from '@common/form/types';
import type { EditorStore, EditorPresenter } from '../presenter';
import { Answer } from './component';

const DEFAULT_ADJUSTMENT = { dx: 0, dy: 0, scale: 1 };

export function createAnswer({
  store,
  presenter,
}: {
  store: EditorStore;
  presenter: EditorPresenter;
}) {
  const onSelect = (id: string | undefined) => presenter.select(store, id);
  const onMove = (id: string, dx: number, dy: number) => presenter.move(store, id, dx, dy);
  const onResize = (id: string, factor: number) => presenter.resize(store, id, factor);

  return memo(function BoundAnswer({ item }: { item: LayoutItem }) {
    const state = useObservable(store);
    return (
      <Answer
        item={item}
        selected={state.selectedId === item.id}
        adjustment={state.adjustments[item.id] ?? DEFAULT_ADJUSTMENT}
        onSelect={onSelect}
        onMove={onMove}
        onResize={onResize}
      />
    );
  });
}
