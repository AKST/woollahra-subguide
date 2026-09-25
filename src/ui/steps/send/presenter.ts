import { ObservableStore, observable } from '@common/observable';
import { formatLongDate } from '@common/format';
import type { Answers, Issue } from '@common/form/types';
import type { BrowserService } from '@service/browser/service';
import {
  EMAIL_MESSAGES,
  EMAIL_OPENINGS,
  EMAIL_SIGNOFFS,
  EMAIL_SEPARATORS,
  EMAIL_SIGNOFF_SEPARATORS,
  EMAIL_SUBJECT_FORMATS,
  emailBody,
  emailSubject,
  fileNameFor,
} from './util';
import type { EmailSpacing } from './util';

export interface DownloadData {
  answers: Answers;
  pdfBytes: Uint8Array;
  issues: Issue[];
  showCompletionNote?: boolean;
}

export class SendStore extends ObservableStore {
  @observable data: DownloadData | undefined = undefined;
  @observable url: string | undefined = undefined;
  @observable canShare = false;
  @observable shareError: string | undefined = undefined;
  @observable opening: string | undefined = undefined;
  @observable message: string | undefined = undefined;
  @observable signoff: string | undefined = undefined;
  @observable spacing: EmailSpacing | undefined = undefined;
  @observable includeName: boolean | undefined = undefined;
  @observable subjectFormat: (typeof EMAIL_SUBJECT_FORMATS)[number] | undefined = undefined;
  file: File | undefined = undefined;
  attached = false;

  constructor(readonly enableEmailInitialCopy = true) {
    super();
  }

  get name(): string {
    return this.data == null ? '' : fileNameFor(this.data.answers);
  }
  get subject(): string {
    return this.data == null ? '' : emailSubject(this.data.answers, this.subjectFormat);
  }
  get body(): string {
    if (
      !this.enableEmailInitialCopy ||
      this.data == null ||
      this.opening == null ||
      this.message == null ||
      this.signoff == null ||
      this.spacing == null ||
      this.includeName == null
    )
      return '';
    return emailBody(
      this.data.answers,
      this.opening,
      this.message,
      this.signoff,
      this.spacing,
      this.includeName,
    );
  }
  get deadline(): string {
    const date = this.data?.answers.meetingDate;
    return date ? `10am on ${formatLongDate(date)}` : '10am on the day of the meeting';
  }
}

export class SendPresenter {
  constructor(
    private readonly browser: Pick<
      BrowserService,
      'createFile' | 'createObjectURL' | 'revokeObjectURL' | 'canShare' | 'share'
    >,
    readonly email: string,
    private readonly random: () => number = Math.random,
  ) {}

  setDownload(store: SendStore, data: DownloadData): void {
    this.#release(store);
    if (store.enableEmailInitialCopy) {
      store.opening ??= EMAIL_OPENINGS[Math.floor(this.random() * EMAIL_OPENINGS.length)];
      store.message ??= EMAIL_MESSAGES[Math.floor(this.random() * EMAIL_MESSAGES.length)];
      store.signoff ??= EMAIL_SIGNOFFS[Math.floor(this.random() * EMAIL_SIGNOFFS.length)];
      store.spacing ??= {
        afterOpening: EMAIL_SEPARATORS[Math.floor(this.random() * EMAIL_SEPARATORS.length)],
        beforeSignoff:
          EMAIL_SIGNOFF_SEPARATORS[Math.floor(this.random() * EMAIL_SIGNOFF_SEPARATORS.length)],
      };
      store.includeName ??= this.random() < 0.95;
    }
    store.subjectFormat ??=
      EMAIL_SUBJECT_FORMATS[Math.floor(this.random() * EMAIL_SUBJECT_FORMATS.length)];
    store.data = data;
    store.shareError = undefined;
    if (store.attached) this.#prepare(store);
  }

  attach(store: SendStore): void {
    store.attached = true;
    this.#prepare(store);
  }

  dispose(store: SendStore): void {
    store.attached = false;
    this.#release(store);
  }

  async share(store: SendStore): Promise<void> {
    if (store.file == null || !store.canShare) return;
    store.shareError = undefined;
    try {
      await this.browser.share({
        files: [store.file],
        title: store.subject,
        text: `Send to: ${this.email}\nSubject: ${store.subject}${store.body ? `\n\n${store.body}` : ''}`,
      });
    } catch (error) {
      if (store.attached && !(error instanceof Error && error.name === 'AbortError')) {
        store.shareError = 'Sharing did not open. Download the PDF and attach it to your email.';
      }
    }
  }

  emailUrl(store: SendStore): string {
    return `mailto:${this.email}?subject=${encodeURIComponent(store.subject)}${store.body ? `&body=${encodeURIComponent(store.body)}` : ''}`;
  }

  #prepare(store: SendStore): void {
    if (store.data == null || store.url != null) return;
    const file = this.browser.createFile([new Uint8Array(store.data.pdfBytes)], store.name, {
      type: 'application/pdf',
    });
    store.file = file;
    store.url = this.browser.createObjectURL(file);
    store.canShare = this.browser.canShare({ files: [file] });
  }

  #release(store: SendStore): void {
    if (store.url != null) this.browser.revokeObjectURL(store.url);
    store.url = undefined;
    store.file = undefined;
    store.canShare = false;
  }
}
