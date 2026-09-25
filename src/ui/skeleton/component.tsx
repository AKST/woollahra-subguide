import type { ComponentType } from 'react';
import type { FieldKey } from '@common/form/types';
import type { StepsComponent } from '@ui/steps/controller';
import { useFocus } from './use_focus';
import { useContentScroll } from './use_content_scroll';
import styles from './styles.module.css';

export function Skeleton({
  step,
  layoutFrozen,
  focusField,
  headerResizable,
  Header,
  Navigation,
  Steps,
  Pagination,
  Footer,
}: {
  step: number;
  layoutFrozen: boolean;
  focusField: FieldKey | undefined;
  headerResizable: boolean;
  Header: ComponentType;
  Navigation: ComponentType;
  Steps: StepsComponent;
  Pagination: ComponentType;
  Footer: ComponentType;
}) {
  const rootRef = useFocus(step, focusField);
  const contentRef = useContentScroll(rootRef, layoutFrozen, headerResizable);

  return (
    <div
      ref={rootRef}
      className={styles.page}
      data-step={step}
      data-layout-frozen={layoutFrozen}
    >
      <Header />
      <div
        ref={contentRef}
        className={styles.content}
        id="formContent"
      >
        <div className={styles.workspace}>
          <aside className={styles.sidebar}>
            <Navigation />
          </aside>
          <main className={styles.main}>
            <Steps Pagination={Pagination} />
          </main>
        </div>
        {!layoutFrozen && <Footer />}
      </div>
      {layoutFrozen && <Footer />}
    </div>
  );
}
