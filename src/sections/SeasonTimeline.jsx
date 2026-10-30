import { Link } from 'react-router-dom';
import { TAKEDOWN_NOTE, TIME_WINDOWS, LEAD_HOURS } from '../config/site.js';
import { seasonRange, ptToday, daysBetween, prettyDate, firstOpenDate, ymd } from '../lib/time.js';
import Icon from '../components/Icon.jsx';

const monthDay = (s) => prettyDate(s, { short: true }).replace(/^\w+, /, '');

function thanksgiving(year) {
  const first = new Date(Date.UTC(year, 10, 1)).getUTCDay(); // 0 = Sun
  const firstThu = 1 + ((4 - first + 7) % 7);
  return ymd(year, 11, firstThu + 21);
}

export default function SeasonTimeline() {
  const { start, end, year } = seasonRange();
  const today = ptToday();
  const tg = thanksgiving(year);
  const daysLeft = today > end ? 0 : Math.max(0, daysBetween(today < start ? start : today, end) + 1);
  const firstOpen = firstOpenDate();

  const items = [
    { key: 'open', date: monthDay(start), title: 'Install season opens', text: 'Booking and installs begin.', until: start },
    { key: 'tg', date: monthDay(tg), title: 'Thanksgiving', text: 'Want lights up before family comes to town? Book a window ahead of the holiday.', until: tg },
    { key: 'last', date: monthDay(end), title: 'Last install day', text: 'Final install windows of the season.', until: end },
    { key: 'down', date: 'After the holidays', title: 'Takedown', text: `We take everything down — typically in ${TAKEDOWN_NOTE}.`, until: null },
  ];
  // index of the first milestone still ahead of today
  let nextIdx = items.findIndex((it) => it.until && today < it.until);
  if (nextIdx === -1) nextIdx = items.length - 1;
  const fill = (Math.max(0, nextIdx - 0.5) / (items.length - 1)) * 100;

  return (
    <section id="season" className="section section--white">
      <div className="container season">
        <div className="season__intro">
          <p className="eyebrow" data-reveal="slide">
            {year} season
          </p>
          <h2 className="sec-title" data-reveal="slide">
            Book early — each day has only {TIME_WINDOWS.length} install windows
          </h2>
          <p className="sec-lede">
            We install {monthDay(start)} through {monthDay(end)}, seven days a week, in morning and afternoon windows.
            The earliest you can book is {LEAD_HOURS} hours out.
          </p>
          <dl className="season__stats">
            <div>
              <dt>Install days left</dt>
              <dd>{daysLeft}</dd>
            </div>
            <div>
              <dt>Earliest open date</dt>
              <dd className="season__stats-date">{firstOpen ? monthDay(firstOpen) : 'Season closed'}</dd>
            </div>
          </dl>
          <Link className="btn btn--navy" to="/book">
            Check open dates <Icon name="arrowRight" size={16} />
          </Link>
        </div>

        <ol className="vline" style={{ '--fill': fill.toFixed(1) + '%' }} aria-label="Season timeline">
          {items.map((it, i) => {
            const state = i < nextIdx ? 'past' : i === nextIdx ? 'next' : 'future';
            return (
              <li key={it.key} className={'vline__item is-' + state}>
                <span className="vline__dot" aria-hidden="true" />
                <span className="vline__date">
                  {it.date}
                  {state === 'next' && today >= start && <span className="vline__today">Up next</span>}
                </span>
                <h3 className="vline__title">{it.title}</h3>
                <p>{it.text}</p>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
