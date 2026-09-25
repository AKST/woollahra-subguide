/** Current date (YYYY-MM-DD) and hour in Sydney, whatever the device's time zone. */
export function sydneyNow() {
  const parts = Object.fromEntries(
    new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Australia/Sydney',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      hourCycle: 'h23',
    })
      .formatToParts(new Date())
      .map(p => [p.type, p.value]),
  );
  return { date: `${parts.year}-${parts.month}-${parts.day}`, hour: Number(parts.hour) };
}

/** '2026-10-14' → '14/10/2026' */
export const formatShortDate = (iso: string) => (iso ? iso.split('-').reverse().join('/') : '');

/** '2026-10-14' → 'Wednesday 14 October 2026' */
export const formatLongDate = (iso: string) =>
  new Date(`${iso}T12:00:00`).toLocaleDateString('en-AU', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

/** Strips accents, e.g. for file names. */
export const stripAccents = (text: string) => text.normalize('NFKD').replace(/[̀-ͯ]/g, '');
