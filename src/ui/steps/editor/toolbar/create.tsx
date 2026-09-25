import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { EditorStore, EditorPresenter } from '../presenter';
import { Toolbar } from './component';

export function createToolbar({
  store,
  presenter,
}: {
  store: EditorStore;
  presenter: EditorPresenter;
}) {
  const onResize = (id: string, factor: number) => presenter.resize(store, id, factor);
  const onReset = (id: string | undefined) => presenter.reset(store, id);
  const onZoom = () => presenter.toggleZoom(store);

  return memo(function BoundToolbar() {
    const state = useObservable(store);
    return (
      <Toolbar
        selected={state.selected}
        overflowing={state.items.filter(item => item.kind === 'text' && item.overflow).length}
        adjustments={state.adjustments}
        zoomed={state.zoomed}
        onResize={onResize}
        onReset={onReset}
        onZoom={onZoom}
      />
    );
  });
}
