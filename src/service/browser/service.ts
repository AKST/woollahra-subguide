import { readImage, readPixels, writePixels } from './image';

export interface BrowserService {
  readImage: typeof readImage;
  readPixels: typeof readPixels;
  writePixels: typeof writePixels;
  history: Pick<History, 'replaceState' | 'pushState'>;
  getHash: () => string;
  onHashChange: (listener: () => void) => () => void;
  onPopState: (listener: (state: unknown) => void) => () => void;
  onBeforeUnload: (listener: (event: BeforeUnloadEvent) => void) => () => void;
  loadFont: (font: string) => Promise<unknown>;
  createFile: (parts: BlobPart[], name: string, options: FilePropertyBag) => File;
  createObjectURL: (file: Blob) => string;
  revokeObjectURL: (url: string) => void;
  canShare: (data: ShareData) => boolean;
  share: (data: ShareData) => Promise<void>;
}

export function createBrowserService(): BrowserService {
  return {
    readImage,
    readPixels,
    writePixels,
    getHash: () => location.hash,
    onHashChange(listener) {
      window.addEventListener('hashchange', listener);
      return () => window.removeEventListener('hashchange', listener);
    },
    history: {
      replaceState: (state, title, url) => history.replaceState(state, title, url),
      pushState: (state, title, url) => history.pushState(state, title, url),
    },
    onPopState(listener) {
      const onPopState = (event: PopStateEvent) => listener(event.state);
      window.addEventListener('popstate', onPopState);
      return () => window.removeEventListener('popstate', onPopState);
    },
    onBeforeUnload(listener) {
      window.addEventListener('beforeunload', listener);
      return () => window.removeEventListener('beforeunload', listener);
    },
    loadFont: font => document.fonts.load(font),
    createFile: (parts, name, options) => new File(parts, name, options),
    createObjectURL: file => URL.createObjectURL(file),
    revokeObjectURL: url => URL.revokeObjectURL(url),
    canShare: data => navigator.canShare?.(data) ?? false,
    share: data => navigator.share(data),
  };
}
