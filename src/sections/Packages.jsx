import { Link } from 'react-router-dom';
import { PACKAGES, ADDONS, TWO_STORY_PERCENT } from '../config/site.js';
import { priceLabel } from '../lib/pricing.js';
import Icon from '../components/Icon.jsx';

export default function Packages() {
  const tiles = [
    { id: 'two-story', label: 'Two-story home', price: `+${TWO_STORY_PERCENT}% of package`, icon: 'twostory' },
    ...ADDONS.map((a) => ({ id: a.id, label: a.label, price: priceLabel(a.price, { plus: !a.flat }), icon: a.icon })),
  ];

  return (
    <section id="packages" className="section section--white">
      <div className="container">
        <header className="sec-head sec-head--split">
          <div>
            <p className="eyebrow" data-reveal="slide">
              Packages
            </p>
            <h2 className="sec-title" data-reveal="slide">
              Two ways to light up your home
            </h2>
          </div>
          <p className="sec-lede" data-reveal="slide">
            Every package includes design, leased commercial LEDs, install, a timer, in-season maintenance and takedown.
          </p>
        </header>

        <div className="tiers">
          {PACKAGES.map((p) => (
            <article key={p.id} className={'tier' + (p.ribbon ? ' tier--feature' : '')}>
              <div className="tier__media" data-reveal="wipe">
                <img src={p.image} alt={p.imageAlt} width="720" height="540" loading="lazy" />
                {p.ribbon && <span className="tier__ribbon">{p.ribbon}</span>}
              </div>
              <div className="tier__body">
                <div className="tier__top">
                  <h3 className="tier__name">{p.name}</h3>
                  <div className="tier__price">
                    <span className="tier__from">{p.price == null ? 'Price' : 'Starting at'}</span>
                    <span className="tier__amount">{priceLabel(p.price)}</span>
                  </div>
                </div>
                <p className="tier__tag">{p.tagline}</p>
                <ul className="checklist">
                  {p.features.map((f) => (
                    <li key={f}>
                      <span className="checklist__mark" aria-hidden="true">
                        <Icon name="check" size={14} stroke={2.6} />
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            </article>
          ))}
        </div>

        <div className="addons">
          <h3 className="addons__title">Optional add-ons</h3>
          <ul className="addons__grid">
            {tiles.map((t) => (
              <li key={t.id} className="addon-tile">
                <span className="addon-tile__icon">
                  <Icon name={t.icon} size={22} />
                </span>
                <span className="addon-tile__label">{t.label}</span>
                <span className="addon-tile__price">{t.price}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="packages__cta">
          <Link className="btn btn--gold btn--lg" to="/book">
            Book Now <Icon name="arrowRight" size={18} />
          </Link>
          <p className="fineprint">Prices are “starting at.” Your final price is confirmed at the on-site visit.</p>
        </div>
      </div>
    </section>
  );
}
