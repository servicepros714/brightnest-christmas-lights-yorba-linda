import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PACKAGES, LIGHT_TYPES, BUSINESS, SOURCE_TAG } from '../config/site.js';
import { useBooking, makeRef } from '../context/BookingContext.jsx';
import { getPackage } from '../lib/pricing.js';
import { createEstimate, apiConfigured } from '../lib/api.js';
import { formatPhone, validPhone } from '../lib/booking.js';
import Icon from '../components/Icon.jsx';

const STEPS = [
  { label: 'Light type', title: 'Permanent or seasonal lights?', sub: 'Pick the kind of lighting you’re interested in.' },
  { label: 'Coverage', title: 'How much of your home should we light?', sub: 'Pick the coverage you’d like.' },
  { label: 'Your info', title: 'Almost done — how can we reach you?', sub: 'We’ll text or call to confirm your booking.' },
];

export default function Book() {
  const { state, set, reset } = useBooking();
  const navigate = useNavigate();
  const [error, setError] = useState(null); // { msg, field }
  const [busy, setBusy] = useState(false);
  const step = Math.min(state.step || 1, STEPS.length);
  const TOTAL = STEPS.length;
  const cur = STEPS[step - 1];

  // A finished request shouldn't be reopened — start fresh.
  useEffect(() => {
    if (state.result) reset();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Auto-scroll to top on every step
  useEffect(() => {
    window.scrollTo(0, 0);
    setError(null);
  }, [step]);

  // Clear the error as soon as the visitor makes a selection or types
  useEffect(() => {
    setError(null);
  }, [state.lightType, state.pkg, state.name, state.phone, state.address]);

  const fail = (msg, field) => {
    setError({ msg, field });
    requestAnimationFrame(() => {
      const el = document.getElementById(field);
      if (el) {
        el.focus({ preventScroll: true });
        el.scrollIntoView({ block: 'center', behavior: 'smooth' });
      }
    });
    return false;
  };

  const validate = () => {
    if (step === 1 && !state.lightType) return fail('Please choose permanent or seasonal lights.', 'opt-type-0');
    if (step === 2 && !state.pkg) return fail('Please choose your coverage.', 'opt-pkg-' + PACKAGES[0].id);
    if (step === 3) {
      if (state.name.trim().length < 2) return fail('Please enter your name.', 'f-name');
      if (!state.phone.trim()) return fail('Please enter your phone number.', 'f-phone');
      if (!validPhone(state.phone)) return fail('Please enter a valid 10-digit phone number.', 'f-phone');
      if (state.address.trim().length < 6) return fail('Please enter your street address.', 'f-address');
    }
    return true;
  };

  const submit = async () => {
    if (!apiConfigured) {
      setError({ msg: `Online requests aren’t connected yet — please call ${BUSINESS.phoneDisplay}.`, field: '' });
      return;
    }
    const draftRef = state.draftRef || makeRef();
    if (!state.draftRef) set({ draftRef });
    setBusy(true);
    try {
      const res = await createEstimate({
        source: SOURCE_TAG,
        draftRef,
        lightType: state.lightType,
        service: getPackage(state.pkg)?.name || '',
        name: state.name.trim(),
        phone: state.phone.trim(),
        address: state.address.trim(),
        details: state.details.trim(),
      });
      set({ result: { id: res.id, kind: 'estimate' } });
      navigate('/confirmation');
    } catch (e) {
      setBusy(false);
      setError({ msg: e.data?.error || `We couldn’t send your request. Please try again or call ${BUSINESS.phoneDisplay}.`, field: '' });
    }
  };

  const next = () => {
    if (busy || !validate()) return;
    if (step === TOTAL) {
      submit();
      return;
    }
    set({ step: step + 1 });
  };
  const back = () => (step > 1 ? set({ step: step - 1 }) : navigate('/'));

  const pkg = getPackage(state.pkg);
  const picks = [state.lightType && `${state.lightType} lights`, pkg && pkg.name].filter(Boolean);

  return (
    <main className="flow">
      <div className="flow__card">
        <p className="flow__step">
          Step {step} of {TOTAL}
        </p>
        <ol className="flow__bar" aria-hidden="true">
          {STEPS.map((s, i) => (
            <li key={i} className={i + 1 < step ? 'is-done' : i + 1 === step ? 'is-current' : ''}>
              <span className="flow__seg" />
              <span className="flow__lbl">{s.label}</span>
            </li>
          ))}
        </ol>
        <h1 className="flow__title" id="flow-title">
          {cur.title}
        </h1>
        <p className="flow__sub">{cur.sub}</p>

        {step === 1 && <StepType state={state} set={set} />}
        {step === 2 && <StepPackage state={state} set={set} />}
        {step === 3 && <StepContact state={state} set={set} error={error} />}

        {error && (
          <p className="form-error" id="step-error" role="alert">
            {error.msg}
          </p>
        )}

        <div className="book__actions">
          <button type="button" className="btn btn--outline" onClick={back} disabled={busy}>
            <Icon name="arrowLeft" size={16} /> Back
          </button>
          {step === TOTAL ? (
            <button type="button" className="btn btn--gold" onClick={next} disabled={busy}>
              {busy ? 'Sending…' : 'Get Free Estimate'}
            </button>
          ) : (
            <button type="button" className="btn btn--navy" onClick={next}>
              Continue <Icon name="arrowRight" size={16} />
            </button>
          )}
        </div>
      </div>

      {picks.length > 0 && (
        <aside className="flow__summary" aria-label="Your selection">
          <ul className="flow__chips">
            {picks.map((p) => (
              <li key={p}>{p}</li>
            ))}
          </ul>
        </aside>
      )}
    </main>
  );
}

/* ───────── shared choice row (radio indicator on the left) ───────── */
function Choice({ id, on, onClick, title, desc }) {
  return (
    <button id={id} type="button" role="radio" aria-checked={on} className={'choice' + (on ? ' is-on' : '')} onClick={onClick}>
      <span className={'tick tick--round' + (on ? ' is-on' : '')} aria-hidden="true">
        <Icon name="check" size={13} stroke={3} />
      </span>
      <span className="choice__body">
        <span className="choice__title">{title}</span>
        {desc && <span className="choice__desc">{desc}</span>}
      </span>
    </button>
  );
}

function StepType({ state, set }) {
  return (
    <div className="choices" role="radiogroup" aria-labelledby="flow-title">
      {LIGHT_TYPES.map((t, i) => (
        <Choice key={t.id} id={'opt-type-' + i} on={state.lightType === t.id} onClick={() => set({ lightType: t.id })} title={t.title} desc={t.desc} />
      ))}
    </div>
  );
}

function StepPackage({ state, set }) {
  return (
    <div className="choices" role="radiogroup" aria-labelledby="flow-title">
      {PACKAGES.map((p) => (
        <Choice key={p.id} id={'opt-pkg-' + p.id} on={state.pkg === p.id} onClick={() => set({ pkg: p.id })} title={p.name} desc={p.coverage || p.tagline} />
      ))}
    </div>
  );
}

/* Step 3: contact details for the free estimate */
function StepContact({ state, set, error }) {
  const bad = (f) => error && error.field === f;
  return (
    <div className="fields fields--stack fields--flush">
      <Field id="f-name" label="Name" invalid={bad('f-name')}>
        <input
          id="f-name"
          autoComplete="name"
          placeholder="Your full name"
          value={state.name}
          onChange={(e) => set({ name: e.target.value })}
          aria-invalid={bad('f-name') || undefined}
        />
      </Field>
      <Field id="f-phone" label="Phone" invalid={bad('f-phone')}>
        <input
          id="f-phone"
          type="tel"
          inputMode="tel"
          autoComplete="tel-national"
          placeholder="(760) 000-0000"
          value={state.phone}
          onChange={(e) => set({ phone: formatPhone(e.target.value) })}
          aria-invalid={bad('f-phone') || undefined}
        />
      </Field>
      <Field id="f-address" label="Address" invalid={bad('f-address')}>
        <input
          id="f-address"
          autoComplete="street-address"
          placeholder={`Street address in ${BUSINESS.city}`}
          value={state.address}
          onChange={(e) => set({ address: e.target.value })}
          aria-invalid={bad('f-address') || undefined}
        />
      </Field>
      <Field
        id="f-details"
        label={
          <>
            Details <span className="field__opt">(optional)</span>
          </>
        }
      >
        <textarea
          id="f-details"
          rows={4}
          placeholder="Trees, walkways, gate codes, preferred install dates…"
          value={state.details}
          onChange={(e) => set({ details: e.target.value })}
        />
      </Field>
    </div>
  );
}

function Field({ id, label, invalid, children }) {
  return (
    <div className={'field' + (invalid ? ' is-invalid' : '')}>
      <label htmlFor={id}>{label}</label>
      {children}
    </div>
  );
}
