import { ObservableStore, observable } from '@common/observable';
import { clamp } from '@common/util';
import { formatShortDate } from '@common/format';
import type { Answers, FieldKey, Issue, SignatureImage } from '@common/form/types';
import type { BrowserService } from '@service/browser/service';
import type { PdfService } from '@service/pdf/service';
import type { SignatureValue } from '@ui/common/signature/types';
import { EditorPresenter, EditorStore } from '@ui/steps/editor/presenter';
import { SendPresenter, SendStore } from '@ui/steps/send/presenter';
import { emailSubject } from '@ui/steps/send/util';
import { DetailsPresenter, DetailsStore } from './details/presenter';
import { STEP } from '@common/form/steps';
import { stepFromHash, stepHash } from '@common/form/routes';
import { RepresentingPresenter, RepresentingStore } from './details/representing/presenter';
import { DeclarationPresenter, DeclarationStore } from './declaration/presenter';
import { trimAnswers } from './util';
import { issuesFromMessages } from './issues';

export const LAST_STEP = STEP.send;
const NOOP = () => {};

export class StepsStore extends ObservableStore {
  readonly details: DetailsStore;
  readonly representing: RepresentingStore;
  readonly declaration: DeclarationStore;
  readonly editor = new EditorStore();
  readonly send: SendStore;

  @observable step: number = STEP.details;
  @observable pendingStep: number | undefined = undefined;
  @observable error: string | undefined = undefined;
  @observable focusField: FieldKey | undefined = undefined;
  dirty = false;
  revision = 0;
  visitedEnd = false;
  readonly visitedSteps = new Set<number>();
  attached = false;
  generation = 0;
  releaseNavigation: (() => void) | undefined = undefined;
  releaseHash: (() => void) | undefined = undefined;
  releaseUnload: (() => void) | undefined = undefined;

  constructor(
    answers: Answers,
    assistedStance: Answers['stance'] = 'support',
    enableEmailInitialCopy = true,
  ) {
    super();
    this.details = new DetailsStore(answers, assistedStance);
    this.send = new SendStore(enableEmailInitialCopy);
    this.representing = new RepresentingStore(answers);
    this.declaration = new DeclarationStore(answers);
  }

  get answers(): Answers {
    return trimAnswers({
      ...this.details.answers,
      ...this.representing.answers,
      ...this.declaration.answers,
    });
  }

  get outsideScope(): boolean {
    return this.details.outsideScope;
  }

  get busy(): boolean {
    return this.pendingStep != null;
  }

  get nextLabel(): string {
    if (this.pendingStep === STEP.editor) return 'Loading the form…';
    if (this.pendingStep === LAST_STEP) return 'Creating your PDF…';
    if (this.step === STEP.declaration) return 'Check it on the form';
    if (this.step === STEP.editor) return 'Create my PDF';
    return 'Next';
  }
}

export interface StepsDependencies {
  pdf: PdfService;
  browser: BrowserService;
  exportSignature: (value: SignatureValue) => Promise<SignatureImage | undefined>;
  email: string;
  onChange: () => void;
  stepHref?: (step: number) => string;
}

export class StepsPresenter {
  readonly stepHref: (step: number) => string;
  readonly details: DetailsPresenter;
  readonly representing: RepresentingPresenter;
  readonly declaration: DeclarationPresenter;
  readonly editor: EditorPresenter;
  readonly send: SendPresenter;

  constructor(private readonly dependencies: StepsDependencies) {
    this.stepHref = dependencies.stepHref ?? stepHash;
    this.details = new DetailsPresenter(dependencies.onChange);
    this.representing = new RepresentingPresenter(dependencies.onChange);
    this.declaration = new DeclarationPresenter(dependencies.onChange, dependencies.browser);
    this.editor = new EditorPresenter(dependencies.onChange);
    this.send = new SendPresenter(dependencies.browser, dependencies.email);
  }

  attach(store: StepsStore): void {
    store.attached = true;
    const followLocation = () => {
      const target = stepFromHash(this.dependencies.browser.getHash());
      if (store.pendingStep === target) return;
      // Back/forward can interrupt a slow PDF build without letting it replace the new route.
      store.generation++;
      store.pendingStep = undefined;
      void this.goTo(store, target, { addToHistory: false }).then(() => {
        if (store.attached && !store.busy)
          this.dependencies.browser.history.replaceState(
            { step: store.step },
            '',
            this.stepHref(store.step),
          );
      });
    };
    store.releaseNavigation = this.dependencies.browser.onPopState(() => followLocation());
    store.releaseHash = this.dependencies.browser.onHashChange(() => followLocation());
    followLocation();
    store.releaseUnload = this.dependencies.browser.onBeforeUnload(event => {
      if (store.dirty && store.step < LAST_STEP) event.preventDefault();
    });
  }

  dispose(store: StepsStore): void {
    store.attached = false;
    store.generation++;
    store.releaseNavigation?.();
    store.releaseHash?.();
    store.releaseUnload?.();
    store.releaseNavigation = undefined;
    store.releaseHash = undefined;
    store.releaseUnload = undefined;
    store.pendingStep = undefined;
    this.send.dispose(store.send);
    this.declaration.cancelUpload(store.declaration);
  }

  changed(store: StepsStore): void {
    store.dirty = true;
    store.revision++;
    if (store.outsideScope) {
      store.generation++;
      store.pendingStep = undefined;
      store.error = undefined;
      store.step = STEP.details;
      if (store.attached)
        this.dependencies.browser.history.replaceState(
          { step: STEP.details },
          '',
          this.stepHref(STEP.details),
        );
    }
  }

  problems(store: StepsStore, hasSignature = this.declaration.hasSignature(store.declaration)) {
    return {
      ...this.details.problems(store.details),
      ...this.representing.problems(store.representing),
      ...this.declaration.problems(store.declaration, hasSignature),
    };
  }

  validate(store: StepsStore, hasSignature: boolean): void {
    this.details.validate(store.details);
    store.representing.messages = this.representing.problems(store.representing);
    store.declaration.messages = this.declaration.problems(store.declaration, hasSignature);
  }

  async fixIssue(store: StepsStore, issue: Issue): Promise<void> {
    this.details.showField(store.details, issue.key);
    if (await this.goTo(store, issue.step)) store.focusField = issue.key;
  }

  async goTo(
    store: StepsStore,
    target: number,
    { addToHistory = true }: { addToHistory?: boolean } = {},
  ): Promise<boolean> {
    if (store.busy || !store.attached || !Number.isInteger(target)) return false;
    const next = clamp(target, STEP.about, LAST_STEP);
    if (store.outsideScope && next > STEP.details) return false;
    if (next === store.step) {
      store.visitedSteps.add(next);
      return true;
    }
    const showIssues = [STEP.details, STEP.declaration, STEP.editor].some(step =>
      store.visitedSteps.has(step),
    );

    const generation = ++store.generation;
    const current = () => store.attached && store.generation === generation;
    store.pendingStep = next;
    store.error = undefined;
    store.focusField = undefined;

    try {
      if (next >= STEP.editor && store.declaration.pendingUpload) {
        await this.declaration.waitForUpload(store.declaration);
        if (!current()) return false;
      }
      const revision = store.revision;
      const answers = store.answers;
      let hasSignature = this.declaration.hasSignature(store.declaration);

      if (next >= STEP.editor) {
        const [image, metrics] = await Promise.all([
          this.dependencies.exportSignature(store.declaration.signature),
          this.dependencies.pdf.loadMetrics(),
        ]);
        if (!current()) return false;
        hasSignature = image != null;
        this.editor.show(store.editor, answers, image, metrics);

        if (next === STEP.editor) {
          await this.dependencies.browser.loadFont('10px "Arimo"').catch(NOOP);
        } else {
          const pdfBytes = await this.dependencies.pdf.buildPdf(store.editor.items, {
            title: [
              'Public Forum Registration',
              answers.fullName,
              formatShortDate(answers.meetingDate),
            ]
              .filter(Boolean)
              .join(' - '),
            author: answers.fullName,
            subject: answers.reportTitle || emailSubject(answers),
          });
          if (!current()) return false;
          if (revision !== store.revision)
            throw new Error('your answers changed while the PDF was being created');
          this.send.setDownload(store.send, {
            answers,
            pdfBytes,
            issues: showIssues ? issuesFromMessages(this.problems(store, hasSignature)) : [],
            showCompletionNote: !showIssues,
          });
          if (showIssues) store.visitedEnd = true;
          store.dirty = false;
        }
      }

      if (!current()) return false;
      if (revision !== store.revision)
        throw new Error('your answers changed while the form was loading');
      if (showIssues && store.visitedEnd) this.validate(store, hasSignature);
      store.visitedSteps.add(next);
      store.step = next;
      if (addToHistory)
        this.dependencies.browser.history.pushState({ step: next }, '', this.stepHref(next));
      return true;
    } catch (cause) {
      if (current()) {
        const message = cause instanceof Error ? cause.message : String(cause);
        store.error = `Something went wrong: ${message}. Try again, or reload the page.`;
      }
      return false;
    } finally {
      if (current()) store.pendingStep = undefined;
    }
  }
}
