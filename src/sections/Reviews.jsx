import { BUSINESS, REVIEWS } from '../config/site.js';
import Icon from '../components/Icon.jsx';

export default function Reviews() {
  return (
    <section id="reviews" className="section section--cream">
      <div className="container">
        <header className="sec-head sec-head--center">
          <p className="eyebrow" data-reveal="slide">
            {REVIEWS.length ? 'Reviews' : 'Our promise'}
          </p>
          <h2 className="sec-title" data-reveal="slide">
            {REVIEWS.length ? `What ${BUSINESS.city} neighbors say` : 'What every BrightNest install includes'}
          </h2>
        </header>

        {REVIEWS.length > 0 ? (
          <ul className="quotes">
            {REVIEWS.map((r, i) => (
              <li key={i} className="quote" data-reveal="rise" style={{ '--d': i }}>
                <Icon name="star" size={18} className="quote__mark" />
                <blockquote>
                  <p>{r.text}</p>
                </blockquote>
                <p className="quote__by">
                  <span className="quote__name">{r.name}</span>
                  {r.city && <span className="quote__meta"> · {r.city}</span>}
                  {r.source && <span className="quote__meta"> · via {r.source}</span>}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          // Shown until real reviews are added in src/config/site.js (REVIEWS)
          <ul className="quotes">
            {[
              { t: 'Nothing to buy', d: 'Commercial-grade LED lights are leased for the season — no boxes of tangled strands in your garage.' },
              { t: 'We keep it glowing', d: 'In-season maintenance and bulb replacement are included. If a strand goes dark, call and we’ll come fix it.' },
              { t: 'Gone after the holidays', d: 'Takedown is included. Add off-season storage and we’ll keep everything ready for next year.' },
            ].map((p, i) => (
              <li key={p.t} className="quote" data-reveal="rise" style={{ '--d': i }}>
                <Icon name="star" size={18} className="quote__mark" />
                <p className="quote__name" style={{ fontSize: 20, marginBottom: 6 }}>{p.t}</p>
                <p style={{ color: 'var(--muted)' }}>{p.d}</p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
