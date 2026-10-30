import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { BUSINESS, DEPOSIT } from '../config/site.js';
import { useBooking, bookingComplete } from '../context/BookingContext.jsx';
import { getPackage, addonNames, estimate } from '../lib/pricing.js';
import { prettyDate } from '../lib/time.js';
import { createBooking } from '../lib/api.js';
import { buildBookingPayload } from '../lib/booking.js';
import Icon from '../components/Icon.jsx';

export default function Confirmation() {
  const { state, set, reset } = useBooking();
  const [params] = useSearchParams();
  const [status, setStatus] = useState(state.result ? 'done' : 'idle');
  const started = useRef(false);

  // Finish bookings for payment methods that redirected away and back (return_url).
  useEffect(() => {
    if (state.result || started.current) return;
    const piId = params.get('payment_intent');
    const redirect = params.get('redirect_status');
    if (!piId || !bookingComplete(state)) {
      setStatus('missing');
      return;
    }
    if (redirect !== 'succeeded' && redirect !== 'processing') {
      setStatus('failed');
      return;
    }
    started.current = true;
    setStatus('saving');
    createBooking(buildBookingPayload(state, { paymentStatus: 'Paid', paymentIntentId: piId }))
      .then((res) => {
        set({ result: { id: res.id, payment_status: res.payment_status || 'Paid', warning: res.warning || '' } });
        setStatus('done');
      })
      .catch(() => setStatus('error'));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (status === 'saving' || status === 'idle') {
    return (
      <main className="confirm">
        <div className="container confirm__card">
          <span className="spinner" aria-hidden="true" />
          <p>Finishing your booking…</p>
        </div>
      </main>
    );
  }

  if (status !== 'done' || !state.result) {
    return (
      <main className="confirm">
        <div className="container confirm__card">
          <h1 className="book__title">
            {status === 'failed' ? 'Payment wasn’t completed' : status === 'error' ? 'We couldn’t save your booking' : 'No booking found'}
          </h1>
          <p>
            {status === 'failed'
              ? 'Your payment didn’t go through. You can try again or choose to pay at the visit.'
              : status === 'error'
                ? `Your payment went through, but saving the booking failed. Please call ${BUSINESS.phoneDisplay} and mention reference ${state.draftRef}.`
                : 'Start a new booking to reserve your install date.'}
          </p>
          <div className="confirm__actions">
            {status === 'failed' ? (
              <Link className="btn btn--navy" to="/checkout">
                Back to checkout
              </Link>
            ) : (
              <Link className="btn btn--navy" to="/book">
                Book an install
              </Link>
            )}
            <a className="btn btn--outline" href={BUSINESS.phoneHref}>
              <Icon name="phone" size={16} /> {BUSINESS.phoneDisplay}
            </a>
          </div>
        </div>
      </main>
    );
  }

  const r = state.result;

  // Free-estimate request (3-step form) — no date or payment yet
  if (r.kind === 'estimate') {
    return (
      <main className="confirm">
        <div className="container confirm__card confirm__card--ok">
          <span className="confirm__badge" aria-hidden="true">
            <Icon name="check" size={28} stroke={3} />
          </span>
          <p className="eyebrow">Request received</p>
          <h1 className="book__title">Thanks, {state.name.split(' ')[0] || 'neighbor'}! Your free estimate is on the way</h1>
          <p className="confirm__id">
            Reference <span className="confirm__id-val">{r.id}</span>
          </p>
          <dl className="confirm__list">
            <div>
              <dt>Lighting</dt>
              <dd>{state.lightType} lights</dd>
            </div>
            <div>
              <dt>Coverage</dt>
              <dd>{getPackage(state.pkg)?.name}</dd>
            </div>
            <div>
              <dt>Address</dt>
              <dd>{state.address}</dd>
            </div>
            <div>
              <dt>Phone</dt>
              <dd>{state.phone}</dd>
            </div>
          </dl>
          <p className="confirm__next">
            We’ll text or call you shortly to go over your estimate and pick an install date. Questions? Call{' '}
            <a href={BUSINESS.phoneHref}>{BUSINESS.phoneDisplay}</a>.
          </p>
          <div className="confirm__actions">
            <Link className="btn btn--navy" to="/" onClick={reset}>
              Back to home
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const paid = r.payment_status === 'Paid';

  return (
    <main className="confirm">
      <div className="container confirm__card confirm__card--ok">
        <span className="confirm__badge" aria-hidden="true">
          <Icon name="check" size={28} stroke={3} />
        </span>
        <p className="eyebrow">You’re booked</p>
        <h1 className="book__title">Your install date is reserved</h1>
        <p className="confirm__id">
          Booking ID <span className="confirm__id-val">{r.id}</span>
        </p>
        {r.warning && <p className="notice notice--warn">{r.warning}</p>}

        <dl className="confirm__list">
          <div>
            <dt>Package</dt>
            <dd>
              {state.lightType} · {getPackage(state.pkg)?.name}
            </dd>
          </div>
          {state.addons.length > 0 && (
            <div>
              <dt>Add-ons</dt>
              <dd>{addonNames(state.addons).join(', ')}</dd>
            </div>
          )}
          <div>
            <dt>Install</dt>
            <dd>
              {prettyDate(state.date)} · {state.time}
            </dd>
          </div>
          <div>
            <dt>Address</dt>
            <dd>{state.address}</dd>
          </div>
          <div>
            <dt>Estimate</dt>
            <dd>{estimate(state).label}</dd>
          </div>
          <div>
            <dt>Deposit</dt>
            <dd>{paid ? `$${DEPOSIT} paid — applied to your final invoice` : 'Pay at the visit'}</dd>
          </div>
        </dl>

        <p className="confirm__next">
          We’ll reach out to confirm your design visit. Questions? Call <a href={BUSINESS.phoneHref}>{BUSINESS.phoneDisplay}</a>.
        </p>
        <div className="confirm__actions">
          <Link className="btn btn--navy" to="/" onClick={reset}>
            Back to home
          </Link>
        </div>
      </div>
    </main>
  );
}
