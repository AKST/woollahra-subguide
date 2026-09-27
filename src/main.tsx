import React, { lazy } from 'react';
import { createRoot } from 'react-dom/client';
import { FORM } from '@common/form/form_map';
import { reducedMotionRequested } from '@common/motion';
import { createBrowserService } from '@service/browser/service';
import { createOfflineService } from '@service/offline/service';
import { createPdfService } from '@service/pdf/service';
import { createSkeleton } from '@ui/skeleton/create';
import { createSteps } from '@ui/steps/create';
import { initialAnswers } from '@ui/steps/util';
import { drawnImage, typedImage } from '@ui/common/signature/util';
import config from './config';
import './fonts.css';
import './styles.css';

const root = document.getElementById('root');
if (root == null) throw new Error('The application root is missing.');
const reducedMotion = reducedMotionRequested(location.hash);
document.documentElement.dataset.reducedMotion = String(reducedMotion);

const { Steps, controller } = createSteps({
  answers: initialAnswers(config.prefill, location.search),
  assistedStance: config.prefill.stance,
  enableEmailInitialCopy: config.enableEmailInitialCopy,
  enableDeetsAnimation: config.enableDeetsAnimation,
  reducedMotion,
  enableWhyThisIsImportant: config.enableWhyThisIsImportant,
  articleImageVariant: config.aboutImageVariant,
  calendar: { ...config.exhibition, councilDate: config.prefill.meetingDate },
  browser: createBrowserService(),
  pdf: createPdfService(FORM.file),
  async exportSignature(value) {
    if (value.mode === 'upload') return value.uploadedImage;
    if (value.mode === 'type') return typedImage(value.typedName, value.typedFont);
    return drawnImage(value.strokes);
  },
});

// This branch and its hostname check are removed from production builds.
const Tools =
  import.meta.env.DEV && ['localhost', '127.0.0.1', '[::1]'].includes(location.hostname)
    ? lazy(async () => {
        const { createDemoTools } = await import('@ui/dev/create');
        return { default: createDemoTools(controller) };
      })
    : undefined;

const Skeleton = createSkeleton({
  Steps,
  controller,
  Tools,
  offline: createOfflineService(),
});

createRoot(root).render(
  <React.StrictMode>
    <Skeleton />
  </React.StrictMode>,
);
