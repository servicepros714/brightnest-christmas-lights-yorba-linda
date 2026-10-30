import { Link } from 'react-router-dom';
import { BUSINESS, SERVICE_CITIES } from '../config/site.js';
import { NAV_LINKS } from './SiteNav.jsx';
import Icon from './Icon.jsx';

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="footer">
      <div className="footer__strip">
        <div className="container footer__strip-inner">
          <div>
            <p className="footer__strip-kicker">Ready to glow this season?</p>
            <a className="footer__phone" href={BUSINESS.phoneHref}>
              {BUSINESS.phoneDisplay}
            </a>
          </div>
          <Link className="btn btn--navy btn--lg" to="/book">
            Book your install <Icon name="arrowRight" size={18} />
          </Link>
        </div>
      </div>

      <div className="footer__main">
        <div className="container footer__grid">
          <div className="footer__brand">
            <div className="footer__logo-chip">
              <img src="/images/logo-720.webp" alt="BrightNest Christmas Lights" width="720" height="362" loading="lazy" />
            </div>
            <p>
              Professionally designed, installed and removed Christmas lights for homes in {BUSINESS.city} and nearby
              cities. Commercial-grade LEDs, leased — nothing to buy.
            </p>
          </div>

          <div className="footer__col">
            <h2 className="footer__head">Explore</h2>
            <ul>
              {NAV_LINKS.map((l) => (
                <li key={l.id}>
                  <Link to={'/#' + l.id}>{l.label}</Link>
                </li>
              ))}
              <li>
                <Link to="/book">Book online</Link>
              </li>
            </ul>
          </div>

          <div className="footer__col">
            <h2 className="footer__head">Service area</h2>
            <ul className="footer__cities">
              {SERVICE_CITIES.map((c) => (
                <li key={c}>{c}</li>
              ))}
            </ul>
          </div>

          <div className="footer__col">
            <h2 className="footer__head">Contact</h2>
            <ul className="footer__contact">
              <li>
                <Icon name="phone" size={15} />
                <a href={BUSINESS.phoneHref}>{BUSINESS.phoneDisplay}</a>
              </li>
              <li>
                <Icon name="pin" size={15} />
                <span>
                  {BUSINESS.city}, {BUSINESS.state}
                </span>
              </li>
              <li>
                <Icon name="calendar" size={15} />
                <span>Installs Oct 20 – Dec 20</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="container footer__legal">
          <span>
            © {year} {BUSINESS.name}
          </span>
          <span>Prices shown are starting prices; final price is confirmed at the on-site visit.</span>
        </div>
      </div>
    </footer>
  );
}
