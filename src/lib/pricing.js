import { PACKAGES, ADDONS, TWO_STORY_PERCENT, DEPOSIT } from '../config/site.js';

export const QUOTE_LABEL = 'Online quoting';

export const money = (n) =>
  '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

export function priceLabel(price, { plus = false } = {}) {
  if (price == null) return QUOTE_LABEL;
  return (plus ? '+' : '') + money(price);
}

export const getPackage = (id) => PACKAGES.find((p) => p.id === id) || null;
export const getAddon = (id) => ADDONS.find((a) => a.id === id) || null;

/** Returns { total: number|null, label: string } — null total means online quoting. */
export function estimate({ lightType, pkg, stories, addons = [] }) {
  const p = getPackage(pkg);
  if (!p) return { total: null, label: '—' };
  // Permanent systems are quoted at the on-site design visit
  if (lightType === 'Permanent') return { total: null, label: QUOTE_LABEL };
  if (p.price == null) return { total: null, label: QUOTE_LABEL };
  let total = p.price;
  if (stories === '2-Story') total += (p.price * TWO_STORY_PERCENT) / 100;
  for (const id of addons) {
    const a = getAddon(id);
    if (!a) continue;
    if (a.price == null) return { total: null, label: QUOTE_LABEL };
    total += a.price;
  }
  return { total, label: 'Starting at ' + money(total) };
}

/** Value stored in the shared D1 "vehicle" column, e.g. "Seasonal · 2-Story · Front & Sides · +Wreaths" */
export function homeDetails({ lightType, pkg, stories, addons = [] }) {
  const p = getPackage(pkg);
  const parts = [lightType || '', stories || '', p ? p.name : ''].filter(Boolean);
  const extras = addons.map((id) => getAddon(id)).filter(Boolean).map((a) => '+' + a.short);
  if (extras.length) parts.push(extras.join(' '));
  return parts.join(' · ');
}

export function addonNames(addons = []) {
  return addons.map((id) => getAddon(id)).filter(Boolean).map((a) => a.label);
}

export const DEPOSIT_LABEL = money(DEPOSIT);
