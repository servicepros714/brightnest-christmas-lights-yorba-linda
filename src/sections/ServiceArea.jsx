import { useState } from 'react';
import { BUSINESS, SERVICE_CITIES } from '../config/site.js';
import Icon from '../components/Icon.jsx';

export default function ServiceArea() {
  const [q, setQ] = useState('');
  const query = q.trim().toLowerCase();
  const match = query ? SERVICE_CITIES.find((c) => c.toLowerCase().includes(query)) : null;

  return (
    <section id="service-area" className="section section--white">
      <div className="container area">
        <div className="area__intro">
          <p className="eyebrow" data-reveal="slide">
            Service area
          </p>
          <h2 className="sec-title" data-reveal="slide">
            Based in {BUSINESS.city}, lighting up the neighbors
          </h2>
          <label className="area__search" htmlFor="city-search">
            <span className="sr-only">Check your city</span>
            <Icon name="search" size={18} />
            <input
              id="city-search"
              type="search"
              placeholder="Check your city…"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              autoComplete="address-level2"
            />
          </label>
          <p className="area__result" aria-live="polite">
            {!query ? (
              'Type your city to check.'
            ) : match ? (
              <>
                <Icon name="check" size={16} stroke={2.6} /> Yes — we serve {match}.
              </>
            ) : (
              <>
                Not on our list yet — call <a href={BUSINESS.phoneHref}>{BUSINESS.phoneDisplay}</a> and we’ll check.
              </>
            )}
          </p>
        </div>

        <ul className="area__grid">
          {SERVICE_CITIES.map((c, i) => {
            const home = c === BUSINESS.city;
            const hit = query && c.toLowerCase().includes(query);
            return (
              <li
                key={c}
                className={'city' + (home ? ' city--home' : '') + (hit ? ' is-hit' : '') + (query && !hit ? ' is-dim' : '')}
                style={{ '--i': i }}
              >
                <Icon name={home ? 'home' : 'pin'} size={18} />
                <span className="city__name">{c}</span>
                {home && <span className="city__tag">Home base</span>}
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
