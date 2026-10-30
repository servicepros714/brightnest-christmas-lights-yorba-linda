import { useEffect, useMemo, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, PaymentElement, ExpressCheckoutElement, useElements, useStripe } from '@stripe/react-stripe-js';
import { BUSINESS, DEPOSIT } from '../config/site.js';
import { useBooking, bookingComplete, makeRef } from '../context/BookingContext.jsx';
import { estimate, getPackage, addonNames, DEPOSIT_LABEL } from '../lib/pricing.js';
import { prettyDate } from '../lib/time.js';
import { createBooking, createPaymentIntent, apiConfigured } from '../lib/api.js';
import { buildBookingPayload } from '../lib/booking.js';
import Icon from '../components/Icon.jsx';

const PK = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';
const stripePromise = PK ? loadStripe(PK) : null;

const appearance = {
  theme: 'stripe',
  variables: {
    colorPrimary: '#0B2A5B',
    colorText: '#001431',
    colorBackground: '#FFFFFF',
    colorDanger: '#B42318',
    fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif',
    borderRadius: '10px',
    spacingUnit: '4px',
  },
  rules: { '.Input': { border: '1px solid #D8D0C2', boxShadow: 'none' }, '.Input:focus': { borderColor: '#0B2A5B' } },
};

const piKey = (ref) => 'bn-pi-' + ref;

export default function Checkout() {
  const { state, set } = useBooking();
  const navigate = useNavigate();
  const [pi, setPi] = useState(null); // { clientSecret, id }
  const [piError, setPiError] = useState('');
  const [busy, setBusy] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const complete = bookingComplete(state);

  useEffect(() => {
    if (complete && !state.draftRef) set({ draftRef: makeRef() });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [complete, state.draftRef]);

  // Create (or reuse) the PaymentIntent for this draft. This call never waits on the database schema.
  useEffect(() => {
    if (!complete || !state.draftRef || !stripePromise || !apiConfigured || pi) return;
    let cached = null;
    try {
      cached = JSON.parse(sessionStorage.getItem(piKey(state.draftRef)) || 'null');
    } catch {
      cached = null;
    }
    if (cached && cached.clientSecret) {
      setPi(cached);
      return;
    }
    let cancelled = false;
    createPaymentIntent({
      draftRef: state.draftRef,
      date: state.date,
      time: state.time,
      name: state.name,
      email: state.email,
      service: getPackage(state.pkg)?.name || '',
    })
      .then((d) => {
        if (cancelled) return;
        const v = { clientSecret: d.clientSecret, id: d.id };
        setPi(v);
        try {
          sessionStorage.setItem(piKey(state.draftRef), JSON.stringify(v));
        } catch {
          /* ignore */
        }
      })
      .catch((e) => {
        if (cancelled) return;
        setPiError(
          e.status === 409
            ? 'That install window was just taken. Please go back and choose another date or time.'
            : 'Online payment is temporarily unavailable. You can still reserve and pay at the visit.'
        );
      });
    return () => {
      cancelled = true;
    };
  }, [complete, state.draftRef, pi, state.date, state.time, state.name, state.email, state.pkg]);

  if (state.result) return <Navigate to="/confirmation" replace />;
  if (!complete) return <Navigate to="/book" replace />;

  const submit = async (paymentStatus, paymentIntentId = '') => {
    setSubmitError('');
    setBusy(true);
    try {
      const res = await createBooking(buildBookingPayload(state, { paymentStatus, paymentIntentId }));
      set({ result: { id: res.id, payment_status: res.payment_status || paymentStatus, warning: res.warning || '' } });
      try {
        sessionStorage.removeItem(piKey(state.draftRef));
      } catch {
        /* ignore */
      }
      navigate('/confirmation');
    } catch (e) {
      setBusy(false);
      if (e.status === 409) {
        setSubmitError('That install window was just taken. Please go back and choose another date or time.');
      } else {
        setSubmitError(
          paymentStatus === 'Paid'
            ? `Your payment went through, but we couldn’t save the booking automatically. Please call ${BUSINESS.phoneDisplay} and mention reference ${state.draftRef}.`
            : `We couldn’t save your booking. Please try again or call ${BUSINESS.phoneDisplay}.`
        );
      }
    }
  };

  const pkg = getPackage(state.pkg);
  const est = estimate(state);
  const canPayOnline = Boolean(stripePromise && apiConfigured);

  return (
    <main className="checkout">
      <div className="container">
        <header className="book__head">
          <p className="eyebrow">Checkout</p>
          <h1 className="book__title">Reserve your install</h1>
        </header>

        <div className="checkout__grid">
          {/* Order summary */}
          <section className="order" aria-label="Order summary">
            <h2 className="order__title">Your install</h2>
            <ul className="order__lines">
              <li>
                <span>{state.lightType} lights</span>
              </li>
              <li>
                <span>{pkg?.name}</span>
              </li>
              {addonNames(state.addons).map((a) => (
                <li key={a}>
                  <span>+ {a}</span>
                </li>
              ))}
            </ul>
            <dl className="order__meta">
              <div>
                <dt>
                  <Icon name="calendar" size={15} /> Date
                </dt>
                <dd>{prettyDate(state.date)}</dd>
              </div>
              <div>
                <dt>
                  <Icon name="clock" size={15} /> Window
                </dt>
                <dd>{state.time}</dd>
              </div>
              <div>
                <dt>
                  <Icon name="pin" size={15} /> Address
                </dt>
                <dd>{state.address}</dd>
              </div>
              <div>
                <dt>
                  <Icon name="phone" size={15} /> Contact
                </dt>
                <dd>
                  {state.name}
                  <br />
                  {state.phone} · {state.email}
                </dd>
              </div>
            </dl>
            <div className="order__est">
              <span>Estimate</span>
              <span>{est.label}</span>
            </div>
            <div className="order__due">
              <span>Due today</span>
              <span className="order__due-amt">{DEPOSIT_LABEL}</span>
            </div>
            <p className="order__note">
              Reservation deposit — applied to your final invoice. Final price is confirmed at the on-site visit.
            </p>
            <button type="button" className="order__edit" onClick={() => { set({ step: 3 }); navigate('/book'); }}>
              <Icon name="arrowLeft" size={14} /> Edit booking
            </button>
          </section>

          {/* Payment */}
          <section className="pay" aria-label="Payment">
            <h2 className="pay__title">Pay the {DEPOSIT_LABEL} reservation deposit</h2>

            {canPayOnline && pi && !piError ? (
              <Elements stripe={stripePromise} options={{ clientSecret: pi.clientSecret, appearance }} key={pi.clientSecret}>
                <PaymentForm state={state} busy={busy} setBusy={setBusy} onPaid={(id) => submit('Paid', id)} />
              </Elements>
            ) : canPayOnline && !piError ? (
              <div className="pay__loading" aria-live="polite">
                <span className="spinner" aria-hidden="true" /> Preparing secure payment…
              </div>
            ) : (
              <p className="notice notice--warn">{piError || 'Online payment isn’t set up yet. You can reserve now and pay at the visit.'}</p>
            )}

            {submitError && (
              <p className="form-error" role="alert">
                {submitError}
              </p>
            )}

            <p className="pay__secure">
              <Icon name="lock" size={14} /> Payments are processed securely by Stripe. We never see your card number.
            </p>

            <button type="button" className="textlink pay__later" onClick={() => submit('Pay Later')} disabled={busy}>
              I’ll pay at the visit
            </button>
          </section>
        </div>
      </div>
    </main>
  );
}

function PaymentForm({ state, busy, setBusy, onPaid }) {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState('');
  const [hasExpress, setHasExpress] = useState(false);

  const returnUrl = useMemo(() => `${window.location.origin}/confirmation?ref=${encodeURIComponent(state.draftRef)}`, [state.draftRef]);
  const billing = { name: state.name, email: state.email, phone: state.phone };

  const finish = async (result) => {
    const { error: err, paymentIntent } = result;
    if (err) {
      setError(err.message || 'Payment failed. Please try another method.');
      setBusy(false);
      return;
    }
    if (paymentIntent && (paymentIntent.status === 'succeeded' || paymentIntent.status === 'processing')) {
      await onPaid(paymentIntent.id);
    } else {
      setError('Payment was not completed. Please try again.');
      setBusy(false);
    }
  };

  const payCard = async (e) => {
    e.preventDefault();
    if (!stripe || !elements || busy) return;
    setError('');
    setBusy(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl, payment_method_data: { billing_details: billing } },
      redirect: 'if_required',
    });
    await finish(result);
  };

  // Express Checkout (Apple Pay / Google Pay / Link). <Elements> is only mounted once the
  // PaymentIntent clientSecret exists and is passed in its options — the Express element
  // never renders in deferred mode, so it confirms against the same intent as the card form.
  const onExpressConfirm = async () => {
    if (!stripe || !elements) return;
    setError('');
    setBusy(true);
    const result = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl },
      redirect: 'if_required',
    });
    await finish(result);
  };

  return (
    <form className="pay__form" onSubmit={payCard}>
      <div className={'pay__express' + (hasExpress ? '' : ' is-empty')}>
        <ExpressCheckoutElement
          options={{ buttonHeight: 48, buttonType: { applePay: 'book', googlePay: 'book' } }}
          onReady={({ availablePaymentMethods }) => setHasExpress(Boolean(availablePaymentMethods))}
          onConfirm={onExpressConfirm}
        />
      </div>
      {hasExpress && (
        <div className="divider">
          <span>or pay by card</span>
        </div>
      )}
      <PaymentElement options={{ layout: 'tabs', defaultValues: { billingDetails: billing } }} />
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button type="submit" className="btn btn--gold btn--lg btn--block" disabled={!stripe || busy}>
        {busy ? 'Processing…' : `Pay ${'$' + DEPOSIT} deposit`}
      </button>
    </form>
  );
}
