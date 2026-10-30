import { getPackage, homeDetails, addonNames, estimate } from './pricing.js';
import { SOURCE_TAG } from '../config/site.js';

export function buildBookingPayload(s, { paymentStatus, paymentIntentId = '' }) {
  const pkg = getPackage(s.pkg);
  return {
    source: SOURCE_TAG,
    draftRef: s.draftRef,
    lightType: s.lightType, // 'Permanent' | 'Seasonal'
    service: pkg ? pkg.name : '',
    vehicle: homeDetails(s), // shared D1 column — holds home details
    stories: s.stories,
    addons: addonNames(s.addons),
    estimate: estimate(s).label,
    date: s.date,
    time: s.time,
    name: s.name.trim(),
    phone: s.phone.trim(),
    email: s.email.trim(),
    address: s.address.trim(),
    payment_status: paymentStatus, // 'Paid' | 'Pay Later'
    paymentIntentId,
  };
}

export function formatPhone(v) {
  const d = v.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
}

export const validEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim());
export const validPhone = (v) => v.replace(/\D/g, '').replace(/^1(?=\d{10})/, '').length === 10;
