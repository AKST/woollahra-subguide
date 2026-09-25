import { vi } from 'vitest';
import type { Answers, FontMetrics } from '@common/form/types';
import type { BrowserService } from '@service/browser/service';
import type { PdfService } from '@service/pdf/service';
import { StepsStore, StepsPresenter } from '../presenter';

export const completeAnswers: Answers = {
  reportTitle: 'DA 412/2025',
  meetingDate: '2099-10-14',
  stance: 'support',
  mode: 'person',
  honorific: '',
  fullName: 'Jane Citizen',
  company: '',
  address: '12 Example Street',
  phone: '0400 123 456',
  email: 'jane@example.com',
  rep: 'no',
  repDetails: '',
  accept: true,
  signDate: '2026-09-25',
};

export const metrics: FontMetrics = {
  width: (text, size) => text.length * size * 0.5,
  canEncode: text => [...text].every(char => char.charCodeAt(0) <= 255),
};

export function createHarness(
  answers = completeAnswers,
  assistedStance: Answers['stance'] = 'support',
  hash = '',
) {
  const pdf = {
    loadMetrics: vi.fn<PdfService['loadMetrics']>().mockResolvedValue(metrics),
    buildPdf: vi.fn<PdfService['buildPdf']>().mockResolvedValue(new Uint8Array([1, 2, 3])),
  };
  const browser = {
    readImage: vi
      .fn<BrowserService['readImage']>()
      .mockResolvedValue({ url: 'data:image/png;base64,test', width: 300, height: 100 }),
    history: { replaceState: vi.fn(), pushState: vi.fn() },
    readPixels: vi.fn<BrowserService['readPixels']>().mockResolvedValue({
      width: 1,
      height: 1,
      data: new Uint8ClampedArray([255, 255, 255, 255]),
    }),
    writePixels: vi
      .fn<BrowserService['writePixels']>()
      .mockReturnValue({ url: 'data:image/png;base64,clean', width: 1, height: 1 }),
    getHash: vi.fn().mockReturnValue(hash),
    onHashChange: vi.fn<BrowserService['onHashChange']>().mockReturnValue(vi.fn()),
    onPopState: vi.fn<BrowserService['onPopState']>().mockReturnValue(vi.fn()),
    onBeforeUnload: vi.fn<BrowserService['onBeforeUnload']>().mockReturnValue(vi.fn()),
    loadFont: vi.fn<BrowserService['loadFont']>().mockResolvedValue(undefined),
    createFile: vi.fn<BrowserService['createFile']>(
      (parts, name, options) => new File(parts, name, options),
    ),
    createObjectURL: vi.fn<BrowserService['createObjectURL']>().mockReturnValue('blob:form'),
    revokeObjectURL: vi.fn<BrowserService['revokeObjectURL']>(),
    canShare: vi.fn<BrowserService['canShare']>().mockReturnValue(true),
    share: vi.fn<BrowserService['share']>().mockResolvedValue(undefined),
  };
  const store = new StepsStore(answers, assistedStance);
  const exportSignature = vi.fn().mockResolvedValue(undefined);
  const presenter: StepsPresenter = new StepsPresenter({
    pdf,
    browser,
    exportSignature,
    email: 'records@example.com',
    onChange: () => presenter.changed(store),
  });
  presenter.attach(store);
  return { store, presenter, pdf, browser, exportSignature };
}

export function deferred<Value>() {
  let resolve!: (value: Value) => void;
  const promise = new Promise<Value>(done => {
    resolve = done;
  });
  return { promise, resolve };
}
