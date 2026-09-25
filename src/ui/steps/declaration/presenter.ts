import { ObservableStore, observable } from '@common/observable';
import type { Answers, FieldMessages } from '@common/form/types';
import type { SignatureValue } from '@ui/common/signature/types';
import type { BrowserService } from '@service/browser/service';
import { BackgroundPresenter, BackgroundStore } from './background/presenter';

export type DeclarationAnswers = Pick<Answers, 'accept' | 'signDate'>;

export class DeclarationStore extends ObservableStore {
  readonly background = new BackgroundStore();
  @observable answers: DeclarationAnswers;
  @observable messages: FieldMessages = {};
  @observable uploadLoading = false;
  @observable uploadError: string | undefined = undefined;
  uploadGeneration = 0;
  pendingUpload: Promise<void> | undefined = undefined;
  @observable signature: SignatureValue = {
    mode: 'upload',
    typedName: '',
    typedFont: 'caveat',
    strokes: [],
    uploadedImage: undefined,
  };

  constructor(answers: DeclarationAnswers) {
    super();
    this.answers = {
      accept: answers.accept,
      signDate: answers.signDate,
    };
  }
}

export class DeclarationPresenter {
  readonly background: BackgroundPresenter;
  constructor(
    private readonly onChange: () => void,
    private readonly browser: Pick<BrowserService, 'readImage' | 'readPixels' | 'writePixels'>,
  ) {
    this.background = new BackgroundPresenter(browser);
  }

  upload(store: DeclarationStore, file: File): Promise<void> {
    this.cancelUpload(store);
    store.uploadError = undefined;
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      store.uploadError = 'Choose a PNG, JPEG or WebP image.';
      return Promise.resolve();
    }
    if (file.size > 10 * 1024 * 1024) {
      store.uploadError = 'Choose an image smaller than 10 MB.';
      return Promise.resolve();
    }
    const generation = store.uploadGeneration;
    store.uploadLoading = true;
    const pending = this.browser
      .readImage(file)
      .then(image => {
        if (generation !== store.uploadGeneration) return;
        this.changeSignature(store, { ...store.signature, uploadedImage: image });
        void this.background.start(store.background, image);
      })
      .catch(() => {
        if (generation === store.uploadGeneration)
          store.uploadError = 'This image could not be read. Try another PNG, JPEG or WebP image.';
      })
      .finally(() => {
        if (generation !== store.uploadGeneration) return;
        store.uploadLoading = false;
        store.pendingUpload = undefined;
      });
    store.pendingUpload = pending;
    return pending;
  }

  clearUpload(store: DeclarationStore): void {
    this.cancelUpload(store);
    store.uploadError = undefined;
    this.changeSignature(store, { ...store.signature, uploadedImage: undefined });
  }

  cancelUpload(store: DeclarationStore): void {
    this.background.reset(store.background);
    store.uploadGeneration++;
    store.pendingUpload = undefined;
    store.uploadLoading = false;
  }

  finishBackground(store: DeclarationStore, useOriginal: boolean): void {
    const image = useOriginal ? store.background.original : store.background.preview;
    if (!image) return;
    this.changeSignature(store, { ...store.signature, uploadedImage: image });
    store.background.open = false;
  }

  async waitForUpload(store: DeclarationStore): Promise<void> {
    while (store.pendingUpload) await store.pendingUpload;
  }

  change<Key extends keyof DeclarationAnswers>(
    store: DeclarationStore,
    key: Key,
    value: DeclarationAnswers[Key],
  ): void {
    store.answers = { ...store.answers, [key]: value };
    store.messages = { ...store.messages, [key]: undefined };
    this.onChange();
  }

  changeSignature(store: DeclarationStore, signature: SignatureValue): void {
    store.signature = signature;
    store.messages = { ...store.messages, signature: undefined };
    this.onChange();
  }

  hasSignature(store: DeclarationStore): boolean {
    if (store.signature.mode === 'upload') return store.signature.uploadedImage != null;
    if (store.signature.mode === 'type') return Boolean(store.signature.typedName.trim());
    return store.signature.strokes.length > 0;
  }

  problems(store: DeclarationStore, hasSignature = this.hasSignature(store)): FieldMessages {
    const a = store.answers;
    const p: FieldMessages = {};
    if (!a.accept) p.accept = "Sorry buddy, they won't let you speak unless you accept the terms.";
    if (!hasSignature)
      p.signature =
        'Your signature is missing. However, nothing is stopping you from downloading it and adding it on your computer if you like.';
    if (!a.signDate) p.signDate = 'Missing. Add the date you signed.';
    return p;
  }
}
