import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { BUSINESS } from '../config/site.js';
import Icon from './Icon.jsx';

const HIDDEN_ON = ['/book', '/checkout', '/confirmation'];

export default function MobileActionBar() {
  const { pathname } = useLocation();
  const [show, setShow] = useState(false);
  const hidden = HIDDEN_ON.some((p) => pathname.startsWith(p));

  useEffect(() => {
    if (hidden) return;
    const onScroll = () => {
      const hero = document.getElementById('hero');
      const limit = hero ? hero.offsetTop + hero.offsetHeight - 80 : 320;
      setShow(window.scrollY > limit);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, [hidden, pathname]);

  if (hidden) return null;

  return (
    <div className={'actionbar' + (show ? ' is-shown' : '')} aria-hidden={!show}>
      <a className="btn btn--outline-light" href={BUSINESS.phoneHref} tabIndex={show ? 0 : -1}>
        <Icon name="phone" size={16} /> Call Now
      </a>
      <Link className="btn btn--gold" to="/book" tabIndex={show ? 0 : -1}>
        <Icon name="calendar" size={16} /> Book Online
      </Link>
    </div>
  );
}
