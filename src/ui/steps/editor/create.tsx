import { memo } from 'react';
import { useObservable } from '@common/observable';
import type { EditorStore, EditorPresenter } from './presenter';
import { Editor, Sheets } from './component';
import { createAnswer } from './answer/create';
import { createSheet } from './sheet/create';
import { createToolbar } from './toolbar/create';

export function createEditor({
  store,
  presenter,
  pages,
  pageWidth,
}: {
  store: EditorStore;
  presenter: EditorPresenter;
  pages: string[];
  pageWidth: number;
}) {
  const Answer = createAnswer({ store, presenter });
  const Toolbar = createToolbar({ store, presenter });
  const sheets = pages.map((src, page) =>
    createSheet({ store, presenter, src, page, pageCount: pages.length, pageWidth, Answer }),
  );
  const BoundSheets = memo(function BoundSheets() {
    const state = useObservable(store);
    return (
      <Sheets
        pages={sheets}
        zoomed={state.zoomed}
      />
    );
  });

  return memo(function BoundEditor({ active }: { active: boolean }) {
    return (
      <Editor
        active={active}
        Toolbar={Toolbar}
        Sheets={BoundSheets}
      />
    );
  });
}
