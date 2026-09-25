import { memo, useEffect } from 'react';
import type { OfflineService } from '@service/offline/service';
import { Footer } from './component';

export function createFooter(offline: OfflineService) {
  return memo(function BoundFooter() {
    useEffect(() => {
      void offline.prepare().catch(() => {});
    }, []);
    return <Footer />;
  });
}
