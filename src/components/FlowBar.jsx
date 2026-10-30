import { Link, useLocation, useNavigate } from 'react-router-dom';
import { BUSINESS } from '../config/site.js';
import { useBooking } from '../context/BookingContext.jsx';
import Icon from './Icon.jsx';

// Slim focused header for /book and /checkout: back · brand · call
export default function FlowBar() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { state, set } = useBooking();

  const back = () => {
    if (pathname.startsWith('/checkout')) {
      set({ step: 3 });
      navigate('/book');
      return;
    }
    if ((state.step || 1) > 1) {
      set({ step: state.step - 1 });
      return;
    }
    navigate('/');
  };

  return (
    <header className="flowbar">
      <button type="button" className="flowbar__btn" onClick={back} aria-label="Go back">
        <Icon name="arrowLeft" size={20} />
      </button>
      <Link to="/" className="flowbar__brand" aria-label={BUSINESS.name + ' — home'}>
        <img src="/android-chrome-192x192.png" alt="" width="36" height="36" />
        <span>BrightNest</span>
      </Link>
      <a className="flowbar__btn flowbar__btn--call" href={BUSINESS.phoneHref} aria-label={'Call ' + BUSINESS.phoneDisplay}>
        <Icon name="phone" size={18} />
      </a>
    </header>
  );
}
