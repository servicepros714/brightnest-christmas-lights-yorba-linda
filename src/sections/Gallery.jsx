import { useEffect, useRef, useState } from 'react';
import { GALLERY } from '../config/site.js';
import Icon from '../components/Icon.jsx';

export default function Gallery() {
  const track = useRef(null);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const el = track.current;
    if (!el) return;
    const onScroll = () => {
      const cards = Array.from(el.children);
      const left = el.scrollLeft;
      let best = 0;
      let dist = Infinity;
      cards.forEach((c, i) => {
        const d = Math.abs(c.offsetLeft - el.offsetLeft - left);
        if (d < dist) {
          dist = d;
          best = i;
        }
      });
      setCurrent(best);
    };
    el.addEventListener('scroll', onScroll, { passive: true });
    return () => el.removeEventListener('scroll', onScroll);
  }, []);

  const go = (dir) => {
    const el = track.current;
    if (!el) return;
    const next = Math.max(0, Math.min(GALLERY.length - 1, current + dir));
    const card = el.children[next];
    if (card) el.scrollTo({ left: card.offsetLeft - el.offsetLeft, behavior: 'smooth' });
  };

  return (
    <section id="gallery" className="section section--navy gallery">
      <div className="container">
        <header className="gallery__head">
          <div>
            <p className="eyebrow eyebrow--gold" data-reveal="slide">
              Night installs
            </p>
            <h2 className="sec-title sec-title--light" data-reveal="slide">
              After dark, it’s all in the lines
            </h2>
          </div>
          <div className="gallery__controls">
            <span className="gallery__count" aria-live="polite">
              <span className="gallery__count-now">{String(current + 1).padStart(2, '0')}</span> /{' '}
              {String(GALLERY.length).padStart(2, '0')}
            </span>
            <button type="button" className="round-btn" onClick={() => go(-1)} disabled={current === 0} aria-label="Previous photo">
              <Icon name="arrowLeft" size={18} />
            </button>
            <button
              type="button"
              className="round-btn"
              onClick={() => go(1)}
              disabled={current === GALLERY.length - 1}
              aria-label="Next photo"
            >
              <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </header>
      </div>

      <ol className="reel" ref={track} tabIndex={0} aria-label="Gallery of night installs — scroll sideways">
        {GALLERY.map((g, i) => (
          <li key={g.src} className={'reel__card' + (i === current ? ' is-current' : '')}>
            <figure>
              <div className="reel__img">
                <img src={g.sm} srcSet={`${g.sm} 720w, ${g.src} 1400w`} sizes="(min-width: 900px) 640px, 86vw" alt={`${g.title} — ${g.note}`} width="1400" height="1050" loading="lazy" />
              </div>
              <figcaption>
                <span className="reel__num">{String(i + 1).padStart(2, '0')}</span>
                <span>
                  <span className="reel__title">{g.title}</span>
                  <span className="reel__note">{g.note}</span>
                </span>
              </figcaption>
            </figure>
          </li>
        ))}
      </ol>

      <div className="container">
        <div className="reel__dots" aria-hidden="true">
          {GALLERY.map((g, i) => (
            <span key={g.src} className={i === current ? 'is-on' : ''} />
          ))}
        </div>
      </div>
    </section>
  );
}
