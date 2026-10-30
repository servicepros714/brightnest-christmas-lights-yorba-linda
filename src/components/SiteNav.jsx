import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BUSINESS } from '../config/site.js';
import Icon from './Icon.jsx';

export const NAV_LINKS = [
  { id: 'packages', label: 'Packages' },
  { id: 'gallery', label: 'Gallery' },
  { id: 'how-it-works', label: 'How it works' },
  { id: 'season', label: 'Season dates' },
  { id: 'faq', label: 'FAQ' },
  { id: 'service-area', label: 'Service area' },
  { id: 'reviews', label: 'Reviews' },
];

function useSectionLink() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  return (e, id, after) => {
    e.preventDefault();
    after && after();
    if (pathname === '/') {
      const el = document.getElementById(id);
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.history.replaceState(null, '', '#' + id);
    } else {
      navigate('/#' + id);
    }
  };
}

function useActiveSection(enabled) {
  const [active, setActive] = useState('');
  useEffect(() => {
    if (!enabled || !('IntersectionObserver' in window)) return;
    const els = NAV_LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((en) => en.isIntersecting && setActive(en.target.id));
      },
      { rootMargin: '-45% 0px -50% 0px' }
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, [enabled]);
  return enabled ? active : '';
}

export default function SiteNav() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const railRef = useRef(null);
  const goTo = useSectionLink();
  const active = useActiveSection(pathname === '/');

  // scroll progress line on the desktop rail
  useEffect(() => {
    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const pct = max > 0 ? Math.min(1, window.scrollY / max) : 0;
        if (railRef.current) railRef.current.style.setProperty('--progress', pct.toFixed(4));
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('scroll', onScroll);
    };
  }, [pathname]);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.classList.toggle('drawer-open', open);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open]);

  return (
    <>
      {/* Desktop: fixed vertical side rail */}
      <aside className="rail" ref={railRef} aria-label="Site">
        <Link to="/" className="rail__logo" aria-label={BUSINESS.name + ' — home'}>
          <img src="/images/logo-720.webp" alt="BrightNest Christmas Lights" width="720" height="362" />
        </Link>
        <p className="rail__city">Yorba Linda, CA</p>
        <nav className="rail__nav" aria-label="Sections">
          <ul>
            {NAV_LINKS.map((l) => (
              <li key={l.id}>
                <a
                  href={'/#' + l.id}
                  className={'rail__link' + (active === l.id ? ' is-active' : '')}
                  onClick={(e) => goTo(e, l.id)}
                >
                  <span className="rail__bulb" aria-hidden="true" />
                  {l.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <div className="rail__cta">
          <a className="btn btn--ghost-dark btn--block" href={BUSINESS.phoneHref}>
            <Icon name="phone" size={16} /> {BUSINESS.phoneDisplay}
          </a>
          <Link className="btn btn--gold btn--block" to="/book">
            Book online <Icon name="arrowRight" size={16} />
          </Link>
        </div>
        <span className="rail__progress" aria-hidden="true" />
      </aside>

      {/* Mobile / tablet: top bar + drawer */}
      <header className={'topbar' + (open ? ' is-open' : '')}>
        <div className="topbar__row">
          <Link to="/" className="topbar__logo" aria-label={BUSINESS.name + ' — home'}>
            <img src="/images/logo-720.webp" alt="BrightNest Christmas Lights" width="720" height="362" />
          </Link>
          <a className="topbar__call" href={BUSINESS.phoneHref} aria-label={'Call ' + BUSINESS.phoneDisplay}>
            <Icon name="phone" size={18} />
          </a>
          <button
            type="button"
            className="topbar__toggle"
            aria-expanded={open}
            aria-controls="mobile-drawer"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((o) => !o)}
          >
            <Icon name={open ? 'close' : 'menu'} size={22} />
          </button>
        </div>
        <div id="mobile-drawer" className="drawer" hidden={!open}>
          <nav aria-label="Mobile">
            <ul className="drawer__list">
              {NAV_LINKS.map((l, i) => (
                <li key={l.id} style={{ '--i': i }}>
                  <a href={'/#' + l.id} onClick={(e) => goTo(e, l.id, () => setOpen(false))}>
                    <span className="drawer__num">{String(i + 1).padStart(2, '0')}</span>
                    {l.label}
                  </a>
                </li>
              ))}
            </ul>
          </nav>
          <div className="drawer__actions">
            <a className="btn btn--outline" href={BUSINESS.phoneHref}>
              <Icon name="phone" size={16} /> Call Now
            </a>
            <Link className="btn btn--gold" to="/book" onClick={() => setOpen(false)}>
              <Icon name="calendar" size={16} /> Book Online
            </Link>
          </div>
        </div>
      </header>
      {open && <button className="drawer-scrim" aria-label="Close menu" onClick={() => setOpen(false)} />}
    </>
  );
}
