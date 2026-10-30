import { Routes, Route, Link, useLocation } from 'react-router-dom';
import SiteNav from './components/SiteNav.jsx';
import FlowBar from './components/FlowBar.jsx';
import Footer from './components/Footer.jsx';
import MobileActionBar from './components/MobileActionBar.jsx';
import ScrollManager from './components/ScrollManager.jsx';
import Home from './pages/Home.jsx';
import Book from './pages/Book.jsx';
import Checkout from './pages/Checkout.jsx';
import Confirmation from './pages/Confirmation.jsx';

function NotFound() {
  return (
    <main className="confirm">
      <div className="container confirm__card">
        <h1 className="book__title">Page not found</h1>
        <p>That page doesn’t exist — but your lights still can.</p>
        <div className="confirm__actions">
          <Link className="btn btn--navy" to="/">
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}

export default function App() {
  const { pathname } = useLocation();
  const flow = ['/book', '/checkout', '/confirmation'].some((p) => pathname.startsWith(p));
  // focused booking pages: slim back · brand · call bar, no side rail, no footer
  const focus = ['/book', '/checkout'].some((p) => pathname.startsWith(p));
  return (
    <div className={'shell' + (flow ? ' shell--flow' : '') + (focus ? ' shell--focus' : '')}>
      <ScrollManager />
      <a className="skip-link" href="#content">
        Skip to content
      </a>
      {focus ? <FlowBar /> : <SiteNav />}
      <div className="shell__main" id="content">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/book" element={<Book />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/confirmation" element={<Confirmation />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
        {!focus && <Footer />}
      </div>
      <MobileActionBar />
    </div>
  );
}
