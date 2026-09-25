import { ObservableStore, observable } from '@common/observable';

export class SkeletonStore extends ObservableStore {
  @observable accentTheme = false;
}

export class SkeletonPresenter {
  toggleTheme(store: SkeletonStore): void {
    store.accentTheme = !store.accentTheme;
  }
}
