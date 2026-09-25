import type { ComponentType } from 'react';
import type { FieldKey } from '@common/form/types';
import { STEP, STEP_LABELS } from '@common/form/steps';
import type { StepsStore, StepsPresenter } from './presenter';
import { createDevelopmentController, type StepsDevelopmentController } from './development';

export interface StepsState {
  step: number;
  busy: boolean;
  outsideScope: boolean;
  focusField: FieldKey | undefined;
  nextLabel: string;
  error: string | undefined;
  headerResizable: boolean;
  showPagination: boolean;
  canGoBack: boolean;
  canGoNext: boolean;
  backLabel: string;
  navigation: readonly StepNavigationItem[];
}

export interface StepNavigationItem {
  href: string;
  step: number;
  label: string;
  Label?: ComponentType;
  visible: boolean;
  current: boolean;
  before: boolean;
  currentKind: 'page' | 'step';
}

export type StepsComponent = ComponentType<{ Pagination: ComponentType }>;

/** Bound access for the app shell; step rules and state still belong to the presenters/stores. */
export interface StepsController {
  stepHref: (step: number) => string;
  development?: StepsDevelopmentController;
  getState: () => StepsState;
  subscribe: (listener: () => void) => () => void;
  getVersion: () => number;
  goTo: (step: number) => Promise<boolean>;
  next: () => Promise<boolean>;
  back: () => Promise<boolean>;
}

export function createStepsController(
  store: StepsStore,
  presenter: StepsPresenter,
  DetailsLabel?: ComponentType,
): StepsController {
  const goTo = (step: number) => presenter.goTo(store, step);
  return {
    stepHref: presenter.stepHref,
    development: import.meta.env.DEV ? createDevelopmentController(store, presenter) : undefined,
    getState: () => ({
      step: store.step,
      busy: store.busy,
      outsideScope: store.outsideScope,
      focusField: store.focusField,
      nextLabel: store.nextLabel,
      error: store.error,
      headerResizable: store.step <= STEP.details,
      showPagination: store.step !== STEP.about && !store.outsideScope,
      canGoBack: store.step > STEP.details,
      canGoNext: store.step < STEP.send,
      backLabel: store.step === STEP.send ? 'Back to the form preview' : 'Back',
      navigation: ['What’s this about', ...STEP_LABELS].map((label, step) => ({
        href: presenter.stepHref(step),
        step,
        label,
        Label: step === STEP.details ? DetailsLabel : undefined,
        visible: !store.outsideScope || step <= STEP.details,
        current: store.step === step,
        before: step < store.step,
        currentKind: step === STEP.about ? 'page' : 'step',
      })),
    }),
    getVersion: () => store.version + store.details.version,
    subscribe(listener) {
      const releases = [store.subscribe(listener), store.details.subscribe(listener)];
      return () => releases.forEach(release => release());
    },
    goTo,
    next: () => (store.step < STEP.send ? goTo(store.step + 1) : Promise.resolve(false)),
    back: () => (store.step > STEP.about ? goTo(store.step - 1) : Promise.resolve(false)),
  };
}
