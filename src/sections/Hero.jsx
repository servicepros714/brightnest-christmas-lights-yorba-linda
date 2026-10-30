import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BUSINESS, HERO_STYLES } from '../config/site.js';
import { seasonRange } from '../lib/time.js';
import { prefersReducedMotion } from '../components/useReveal.js';
import Icon from '../components/Icon.jsx';

export default function Hero() {
  const [idx, setIdx] = useState(1);
  const [auto, setAuto] = useState(true);
  const { year } = seasonRange();

  useEffect(() => {
    if (!auto || prefersReducedMotion()) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO_STYLES.length), 4200);
    return () => clearInterval(t);
  }, [auto]);

  const pick = (i) => {
    setAuto(false);
    setIdx(i);
  };

  return (
    <section id="hero" className="hero">
      <div className="hero__inner">
        <div className="hero__copy">
          <p className="eyebrow">
            <Icon name="star" size={12} /> {BUSINESS.city} · {year} season
          </p>
          <h1 className="hero__title">
            Come home to a <span className="hero__title-gold">glowing nest.</span>
          </h1>
          <p className="hero__lede">
            Custom-designed Christmas lights for {BUSINESS.city} homes. We lease the commercial-grade LEDs, hang them,
            keep them shining all season, and take them down after the holidays.
          </p>
          <div className="hero__actions">
            <Link className="btn btn--navy btn--lg" to="/book">
              Book your install <Icon name="arrowRight" size={18} />
            </Link>
            <a className="btn btn--outline btn--lg" href={BUSINESS.phoneHref}>
              <Icon name="phone" size={16} /> {BUSINESS.phoneDisplay}
            </a>
          </div>
          <ul className="hero__facts">
            <li>
              <Icon name="bulb" size={18} /> Leased LEDs — nothing to buy
            </li>
            <li>
              <Icon name="clock" size={18} /> Timer setup included
            </li>
            <li>
              <Icon name="takedown" size={18} /> Takedown included
            </li>
          </ul>
        </div>

        <div className="hero__stage">
          <div className="stage">
            <div className="stage__shadow">
            <div className="stage__frame">
              {HERO_STYLES.map((s, i) => (
                <img
                  key={s.id}
                  className={'stage__img' + (i === idx ? ' is-on' : '')}
                  src={s.src}
                  srcSet={`${s.sm} 720w, ${s.src} 1400w`}
                  sizes="(min-width: 1100px) 46vw, 100vw"
                  alt={i === idx ? s.alt : ''}
                  aria-hidden={i !== idx}
                  width="1400"
                  height="1050"
                  loading={i < 2 ? 'eager' : 'lazy'}
                />
              ))}
              <span className="stage__badge">
                {idx === 0 ? (
                  <>
                    <Icon name="sun" size={14} /> Before
                  </>
                ) : (
                  <>
                    <Icon name="bulb" size={14} /> After · {HERO_STYLES[idx].label}
                  </>
                )}
              </span>
            </div>
            </div>
            <div className="stage__tabs" role="group" aria-label="Preview a lighting style">
              {HERO_STYLES.map((s, i) => (
                <button
                  key={s.id}
                  type="button"
                  className={'stage__tab' + (i === idx ? ' is-active' : '')}
                  aria-pressed={i === idx}
                  onClick={() => pick(i)}
                >
                  <span className={'swatch swatch--' + s.dot} aria-hidden="true" />
                  {s.label}
                </button>
              ))}
            </div>
            <p className="stage__note">Same home, four looks — we design yours on-site.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
