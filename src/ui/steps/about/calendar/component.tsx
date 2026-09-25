import type { CalendarDates, CalendarMonth } from './types';
import styles from './styles.module.css';

const links = {
  statePlan:
    'https://www.planningportal.nsw.gov.au/ppr/under-exhibition/edgecliff-woollahra-precinct',
} as const;

const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export function Calendar({
  months,
  dates,
  startLabel,
  endLabel,
  councilLabel,
}: {
  months: CalendarMonth[];
  dates: CalendarDates;
  startLabel: string;
  endLabel: string;
  councilLabel: string | undefined;
}) {
  return (
    <section
      className={styles.root}
      aria-labelledby="calendarTitle"
    >
      <h2
        id="calendarTitle"
        className={styles.title}
      >
        Key Dates
      </h2>
      <p className={styles.copy}>
        State Plan exhibition: <time dateTime={dates.startDate}>{startLabel}</time> to{' '}
        <time dateTime={dates.endDate}>{endLabel}</time>.
      </p>
      <div className={styles.months}>
        {months.map(month => (
          <table
            key={month.label}
            className={styles.month}
          >
            <caption>{month.label}</caption>
            <thead>
              <tr>
                {weekdays.map(day => (
                  <th
                    key={day}
                    scope="col"
                    aria-label={day}
                  >
                    {day.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {month.weeks.map((week, index) => (
                <tr key={index}>
                  {week.map((day, column) => (
                    <td
                      key={column}
                      className={day?.exhibition ? styles.exhibition : undefined}
                    >
                      {day && (
                        <time
                          dateTime={day.date}
                          className={
                            day.council ? styles.council : day.closing ? styles.closing : undefined
                          }
                        >
                          {day.number}
                          {day.council && <span className={styles.srOnly}> — Council meeting</span>}
                          {day.closing && (
                            <span className={styles.srOnly}>
                              {' '}
                              — Exhibition closes at 5pm Sydney time
                            </span>
                          )}
                        </time>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        ))}
      </div>
      <ul className={styles.legend}>
        <li>
          <span
            className={`${styles.swatch} ${styles.exhibition}`}
            aria-hidden="true"
          />
          State Plan exhibition period
        </li>
        {councilLabel && (
          <li>
            <span
              className={`${styles.swatch} ${styles.council}`}
              aria-hidden="true"
            />
            <span>
              Council meeting — <time dateTime={dates.councilDate}>{councilLabel}</time>
            </span>
          </li>
        )}
        <li>
          <span
            className={`${styles.swatch} ${styles.closing}`}
            aria-hidden="true"
          />
          <span>
            Exhibition closes — <time dateTime={dates.endDate}>{endLabel}</time>, 5pm Sydney time
          </span>
        </li>
      </ul>
      <p className={styles.copy}>
        <a
          href={links.statePlan}
          target="_blank"
          rel="noopener noreferrer"
        >
          View the State Plan and make a submission
        </a>
        .
      </p>
    </section>
  );
}
