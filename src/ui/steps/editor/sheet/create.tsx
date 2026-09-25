import { memo } from 'react';
import type { ComponentType } from 'react';
import { useObservable } from '@common/observable';
import type { LayoutItem } from '@common/form/types';
import type { EditorStore, EditorPresenter } from '../presenter';
import { Sheet } from './component';

export function createSheet({
  store,
  presenter,
  src,
  page,
  pageCount,
  pageWidth,
  Answer,
}: {
  store: EditorStore;
  presenter: EditorPresenter;
  src: string;
  page: number;
  pageCount: number;
  pageWidth: number;
  Answer: ComponentType<{ item: LayoutItem }>;
}) {
  const onDeselect = () => presenter.select(store, undefined);

  return memo(function BoundSheet() {
    const state = useObservable(store);
    const selected = state.selected;
    return (
      <Sheet
        src={src}
        page={page}
        pageCount={pageCount}
        pageWidth={pageWidth}
        target={selected?.page === page && selected.kind !== 'image' ? selected.target : undefined}
        onDeselect={onDeselect}
      >
        {state.items
          .filter(item => item.page === page)
          .map(item => (
            <Answer
              key={item.id}
              item={item}
            />
          ))}
      </Sheet>
    );
  });
}
