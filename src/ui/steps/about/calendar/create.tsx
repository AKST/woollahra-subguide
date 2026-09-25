import { memo } from 'react';
import { formatLongDate } from '@common/format';
import { Calendar } from './component';
import type { CalendarDates, CalendarDay, CalendarMonth } from './types';

export function createCalendar(dates: CalendarDates) {
  const ordered = [dates.startDate, dates.endDate, dates.councilDate].filter(Boolean).sort();
  const first = new Date(`${ordered[0]}T12:00:00`);
  const last = new Date(`${ordered[ordered.length - 1]}T12:00:00`);
  const months: CalendarMonth[] = [];
  for (
    const month = new Date(first.getFullYear(), first.getMonth(), 1, 12);
    month <= last;
    month.setMonth(month.getMonth() + 1)
  ) {
    const days: (CalendarDay | undefined)[] = Array.from({ length: (month.getDay() + 6) % 7 });
    const count = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    for (let number = 1; number <= count; number++) {
      const date = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}-${String(number).padStart(2, '0')}`;
      days.push({
        date,
        number,
        exhibition: date >= dates.startDate && date <= dates.endDate,
        council: date === dates.councilDate,
        closing: date === dates.endDate,
      });
    }
    while (days.length % 7) days.push(undefined);
    months.push({
      label: month.toLocaleDateString('en-AU', { month: 'long', year: 'numeric' }),
      weeks: Array.from({ length: days.length / 7 }, (_, index) =>
        days.slice(index * 7, index * 7 + 7),
      ),
    });
  }
  return memo(function BoundCalendar() {
    return (
      <Calendar
        months={months}
        dates={dates}
        startLabel={formatLongDate(dates.startDate)}
        endLabel={formatLongDate(dates.endDate)}
        councilLabel={dates.councilDate ? formatLongDate(dates.councilDate) : undefined}
      />
    );
  });
}
