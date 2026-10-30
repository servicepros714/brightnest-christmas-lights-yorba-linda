import { Link } from 'react-router-dom';
import { BUSINESS } from '../config/site.js';
import { DEPOSIT_LABEL } from '../lib/pricing.js';
import Icon from '../components/Icon.jsx';

export default function FinalCta() {
  return (
    <section className="final">
      <div className="final__media" data-reveal="wipe">
        <img src="/images/house-b-redwhite.webp" alt="" width="1400" height="1050" loading="lazy" />
      </div>
      <div className="final__copy">
        <p className="eyebrow eyebrow--gold">This season</p>
        <h2 className="final__title">Lock in your install date before the windows fill.</h2>
        <p className="final__lede">
          Reserve online in five quick steps. A {DEPOSIT_LABEL} deposit holds your window and comes off your final invoice
          — or choose to pay at the visit.
        </p>
        <div className="final__actions">
          <Link className="btn btn--gold btn--lg" to="/book">
            Book online <Icon name="arrowRight" size={18} />
          </Link>
          <a className="btn btn--outline-light btn--lg" href={BUSINESS.phoneHref}>
            <Icon name="phone" size={16} /> {BUSINESS.phoneDisplay}
          </a>
        </div>
      </div>
    </section>
  );
}
