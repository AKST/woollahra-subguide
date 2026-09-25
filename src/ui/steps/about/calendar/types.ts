export interface CalendarDates {
  startDate: string;
  endDate: string;
  councilDate: string;
}

export interface CalendarDay {
  date: string;
  number: number;
  exhibition: boolean;
  council: boolean;
  closing: boolean;
}

export interface CalendarMonth {
  label: string;
  weeks: (CalendarDay | undefined)[][];
}
