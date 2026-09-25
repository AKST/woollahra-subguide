import { memo, Suspense } from 'react';
import type { ComponentType } from 'react';
import type { OfflineService } from '@service/offline/service';
import type { StepsComponent, StepsController } from '@ui/steps/controller';
import { useStepsState } from '@ui/steps/use_steps_state';
import { createHeader } from './header/create';
import { createFooter } from './footer/create';
import { createNavigation } from './navigation/create';
import { createPagination } from './pagination/create';
import { Skeleton } from './component';
import { useObservable } from '@common/observable';
import { SkeletonStore, SkeletonPresenter } from './presenter';
import { useTheme } from './use_theme';

export function createSkeleton({
  Steps,
  controller,
  offline,
  Tools,
}: {
  Steps: StepsComponent;
  controller: StepsController;
  offline: OfflineService;
  Tools?: ComponentType;
}) {
  const store = new SkeletonStore();
  const presenter = new SkeletonPresenter();
  const Header = createHeader({
    steps: controller,
    appearance: store,
    onToggleTheme: () => presenter.toggleTheme(store),
  });
  const Navigation = createNavigation(controller);
  const Pagination = createPagination(controller);
  const Footer = createFooter(offline);

  return memo(function BoundSkeleton() {
    const appearance = useObservable(store);
    useTheme(appearance.accentTheme);
    const state = useStepsState(controller);
    return (
      <>
        <Skeleton
          step={state.step}
          layoutFrozen={state.outsideScope}
          focusField={state.focusField}
          headerResizable={state.headerResizable}
          Header={Header}
          Navigation={Navigation}
          Steps={Steps}
          Pagination={Pagination}
          Footer={Footer}
        />
        {Tools && (
          <Suspense fallback={null}>
            <Tools />
          </Suspense>
        )}
      </>
    );
  });
}
