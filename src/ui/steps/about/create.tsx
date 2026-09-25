import { memo } from 'react';
import { About } from './component';
import { createCalendar } from './calendar/create';
import type { CalendarDates } from './calendar/types';

export function createAbout({
  onSignUp,
  calendar,
  enableWhyThisIsImportant,
}: {
  onSignUp: () => void;
  calendar: CalendarDates;
  enableWhyThisIsImportant: boolean;
}) {
  const Calendar = createCalendar(calendar);
  return memo(function BoundAbout({ active }: { active: boolean }) {
    return (
      <About
        active={active}
        onSignUp={onSignUp}
        Calendar={Calendar}
        enableWhyThisIsImportant={enableWhyThisIsImportant}
      />
    );
  });
}
