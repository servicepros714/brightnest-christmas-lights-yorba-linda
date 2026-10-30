const BASE = (import.meta.env.VITE_API_BASE || '').replace(/\/$/, '');

async function request(path, opts = {}) {
  const res = await fetch(BASE + path, {
    ...opts,
    headers: { 'Content-Type': 'application/json', ...(opts.headers || {}) },
  });
  let data = {};
  try {
    data = await res.json();
  } catch {
    /* non-JSON response */
  }
  if (!res.ok) {
    const err = new Error(data.error || `Request failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

export const apiConfigured = Boolean(BASE);

export function getAvailability(from, to) {
  return request(`/api/availability?from=${from}&to=${to}`);
}

export function createPaymentIntent(payload) {
  return request('/api/create-payment-intent', { method: 'POST', body: JSON.stringify(payload) });
}

export function createEstimate(payload) {
  return request('/api/estimates', { method: 'POST', body: JSON.stringify(payload) });
}

export function createBooking(payload) {
  return request('/api/bookings', { method: 'POST', body: JSON.stringify(payload) });
}
