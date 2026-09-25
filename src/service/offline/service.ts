export interface OfflineService {
  prepare: () => Promise<boolean>;
}

export function createOfflineService(): OfflineService {
  let pending: Promise<boolean> | undefined;
  return {
    prepare() {
      if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return Promise.resolve(false);
      return (pending ??= (async () => {
        // Relative URLs allow the same build to work under /unsorted/20260925/ or elsewhere.
        const url = new URL('sw.js', document.baseURI);
        const registration = await navigator.serviceWorker.register(url, {
          scope: './',
          updateViaCache: 'none',
        });
        const worker = registration.installing ?? registration.waiting ?? registration.active;
        if (!worker) throw new Error('Offline preparation did not start');
        if (worker.state !== 'activated')
          await new Promise<void>((resolve, reject) => {
            const changed = () => {
              if (worker.state === 'activated' || worker.state === 'redundant') {
                worker.removeEventListener('statechange', changed);
                if (worker.state === 'activated') resolve();
                else reject(new Error('Offline preparation failed'));
              }
            };
            worker.addEventListener('statechange', changed);
            changed();
          });
        if (!navigator.serviceWorker.controller)
          await new Promise<void>(resolve => {
            const changed = () => {
              if (!navigator.serviceWorker.controller) return;
              navigator.serviceWorker.removeEventListener('controllerchange', changed);
              resolve();
            };
            navigator.serviceWorker.addEventListener('controllerchange', changed);
            changed();
          });
        // Warm font faces in the background as well as the worker's static files.
        await Promise.all([...document.fonts].map(font => font.load()));
        return true;
      })());
    },
  };
}
