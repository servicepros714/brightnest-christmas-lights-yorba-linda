import { createContext, useContext, useEffect, useReducer } from 'react';

const KEY = 'bn-booking-v4'; // v4: 3-step free-estimate flow (type → coverage → contact)

const initial = {
  step: 1,
  lightType: '', // 'Permanent' | 'Seasonal'
  pkg: '',
  stories: '',
  addons: [],
  date: '',
  time: '',
  name: '',
  phone: '',
  email: '',
  address: '',
  details: '', // optional notes from the estimate form
  draftRef: '',
  result: null, // { id, payment_status } after a successful submit
};

function load() {
  try {
    const raw = sessionStorage.getItem(KEY);
    return raw ? { ...initial, ...JSON.parse(raw) } : initial;
  } catch {
    return initial;
  }
}

function reducer(state, action) {
  switch (action.type) {
    case 'set':
      return { ...state, ...action.patch };
    case 'toggleAddon': {
      const has = state.addons.includes(action.id);
      return { ...state, addons: has ? state.addons.filter((a) => a !== action.id) : [...state.addons, action.id] };
    }
    case 'reset':
      return { ...initial };
    default:
      return state;
  }
}

const Ctx = createContext(null);

export function BookingProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, load);

  useEffect(() => {
    try {
      sessionStorage.setItem(KEY, JSON.stringify(state));
    } catch {
      /* storage unavailable — booking still works in memory */
    }
  }, [state]);

  const set = (patch) => dispatch({ type: 'set', patch });
  const toggleAddon = (id) => dispatch({ type: 'toggleAddon', id });
  const reset = () => dispatch({ type: 'reset' });

  return <Ctx.Provider value={{ state, set, toggleAddon, reset }}>{children}</Ctx.Provider>;
}

export function useBooking() {
  const v = useContext(Ctx);
  if (!v) throw new Error('useBooking must be used inside BookingProvider');
  return v;
}

export function bookingComplete(s) {
  return Boolean(s.lightType && s.pkg && s.date && s.time && s.name && s.phone && s.email && s.address);
}

export function makeRef() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  let out = '';
  const bytes = new Uint8Array(10);
  (globalThis.crypto || window.crypto).getRandomValues(bytes);
  for (const b of bytes) out += abc[b % abc.length];
  return 'R' + out;
}
