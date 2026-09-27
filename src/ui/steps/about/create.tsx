import { createArticleImage } from './article_image/create';
import type { ArticleImageVariant } from './article_image/component';
import { memo } from 'react';
import { About } from './component';
import { createCalendar } from './calendar/create';
import type { CalendarDates } from './calendar/types';

export function createAbout({
  onSignUp,
  calendar,
  articleImageVariant,
  enableWhyThisIsImportant,
}: {
  onSignUp: () => void;
  calendar: CalendarDates;
  articleImageVariant: ArticleImageVariant;
  enableWhyThisIsImportant: boolean;
}) {
  const ArticleImage = createArticleImage(articleImageVariant);
  const Calendar = createCalendar(calendar);
  return memo(function BoundAbout({ active }: { active: boolean }) {
    return (
      <About
        active={active}
        onSignUp={onSignUp}
        Calendar={Calendar}
        ArticleImage={ArticleImage}
        enableWhyThisIsImportant={enableWhyThisIsImportant}
      />
    );
  });
}
