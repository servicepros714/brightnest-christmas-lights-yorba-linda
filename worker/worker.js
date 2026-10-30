/**
 * BrightNest Christmas Lights Yorba Linda — booking + payments API
 * Worker name: brightnest-yorbalinda-api
 *
 * Paste this whole file into the Cloudflare dashboard Worker editor (ES module syntax).
 * Bindings (Worker → Settings → Bindings):
 *   DB                 D1 database binding (the shared bookings database)
 * Variables & Secrets (Worker → Settings → Variables and Secrets):
 *   STRIPE_SECRET_KEY  Secret  — sk_live_... / sk_test_...
 *   ADMIN_TOKEN        Secret  — optional; enables the GET/PATCH admin routes ("Authorization: Bearer <token>").
 *                                Without it those routes return 401 (the shared dashboard reads D1 directly).
 *   ALLOWED_ORIGIN     Text    — optional; e.g. https://brightnestyorbalinda.com (defaults to *)
 *
 * Routes
 *   GET   /api/health
 *   GET   /api/availability?from=YYYY-MM-DD&to=YYYY-MM-DD   → { booked: { "YYYY-MM-DD": ["8AM–12PM", ...] } }
 *   POST  /api/create-payment-intent                         → { clientSecret, id }
 *   POST  /api/bookings                                      → { id, payment_status }
 *   POST  /api/estimates                                     → { id }   (free-estimate request, no date/payment)
 *   GET   /api/bookings                (admin)               → { bookings: [...] }
 *   PATCH /api/bookings/:id            (admin)               → { ok: true }
 */

const SOURCE = 'brightnest-yorbalinda';
const PREFIX = 'BN-';
const DEPOSIT_CENTS = 14900; // $149 reservation deposit
const TZ = 'America/Los_Angeles';
const SEASON = { startMonth: 10, startDay: 20, endMonth: 12, endDay: 20 };
const TIME_WINDOWS = ['8AM–12PM', '12PM–4PM']; // en dash — shared D1 format
const WINDOW_START = { '8AM–12PM': '08:00', '12PM–4PM': '12:00' };
const LEAD_HOURS = 48;
const SERVICES = ['Front Only', 'Front & Sides'];
const LIGHT_TYPES = ['Permanent', 'Seasonal'];

const PATCHABLE = [
  'status',
  'reschedule_date',
  'reschedule_time',
  'notes2',
  'original_date',
  'original_time',
  'payment_status',
  'date',
  'time',
];

const CANCELLED = ['Cancelled', 'Canceled'];

/* ───────── schema ─────────
 * Statements run one at a time via prepare() inside batch() — never DB.exec(),
 * which splits on newlines and breaks multi-line SQL.
 * ensureSchema is cached per isolate, never throws, and is NOT awaited on the
 * payment-intent route, so a slow or failing schema check can't block payment. */
const SCHEMA = [
  `CREATE TABLE IF NOT EXISTS bookings (
    id TEXT PRIMARY KEY,
    date TEXT,
    time TEXT,
    service TEXT,
    name TEXT,
    phone TEXT,
    email TEXT,
    vehicle TEXT,
    address TEXT,
    notes TEXT,
    source TEXT,
    created_at TEXT,
    status TEXT DEFAULT 'Booked',
    reschedule_date TEXT,
    reschedule_time TEXT,
    notes2 TEXT,
    original_date TEXT,
    original_time TEXT,
    payment_status TEXT
  )`,
  `CREATE INDEX IF NOT EXISTS idx_bookings_source_date ON bookings (source, date)`,
];

let schemaPromise = null;
function ensureSchema(env) {
  if (!schemaPromise) {
    schemaPromise = env.DB.batch(SCHEMA.map((s) => env.DB.prepare(s)))
      .then(() => true)
      .catch((err) => {
        console.error('ensureSchema failed (continuing):', err && err.message);
        schemaPromise = null; // retry on a later request
        return false;
      });
  }
  return schemaPromise;
}

/* ───────── helpers ───────── */
function cors(env) {
  return {
    'Access-Control-Allow-Origin': (env && env.ALLOWED_ORIGIN) || '*',
    'Access-Control-Allow-Methods': 'GET, POST, PATCH, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

function json(env, data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { 'Content-Type': 'application/json; charset=utf-8', ...cors(env) },
  });
}

const pad = (n) => String(n).padStart(2, '0');
const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;
const isYmd = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(s);
const clean = (v, max = 300) =>
  String(v == null ? '' : v)
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .trim()
    .slice(0, max);

function ptParts(date) {
  const f = new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  });
  const p = {};
  for (const part of f.formatToParts(date)) p[part.type] = part.value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, min: +p.minute };
}

function seasonRange(now = new Date()) {
  const p = ptParts(now);
  const afterEnd = p.m > SEASON.endMonth || (p.m === SEASON.endMonth && p.d > SEASON.endDay);
  const y = afterEnd ? p.y + 1 : p.y;
  return { start: ymd(y, SEASON.startMonth, SEASON.startDay), end: ymd(y, SEASON.endMonth, SEASON.endDay) };
}

function slotProblem(date, time, now = new Date()) {
  if (!isYmd(date)) return 'Invalid date.';
  if (!TIME_WINDOWS.includes(time)) return 'Invalid time window.';
  const { start, end } = seasonRange(now);
  if (date < start || date > end) return 'That date is outside the install season.';
  const e = ptParts(new Date(now.getTime() + LEAD_HOURS * 3600 * 1000));
  const earliest = `${ymd(e.y, e.m, e.d)} ${pad(e.h)}:${pad(e.min)}`;
  if (`${date} ${WINDOW_START[time]}` < earliest) return `Bookings need at least ${LEAD_HOURS} hours notice.`;
  return null;
}

/** Active slot for a row: a reschedule (if filled in) replaces the original slot. */
function activeSlot(row) {
  if (row.reschedule_date && row.reschedule_time) return { date: row.reschedule_date, time: row.reschedule_time };
  return { date: row.date, time: row.time };
}

async function slotTaken(env, date, time) {
  const { results } = await env.DB.prepare(
    `SELECT date, time, reschedule_date, reschedule_time, status FROM bookings
     WHERE source = ? AND (date = ? OR reschedule_date = ?)`
  )
    .bind(SOURCE, date, date)
    .all();
  return (results || []).some((r) => {
    if (CANCELLED.includes(r.status)) return false;
    const s = activeSlot(r);
    return s.date === date && s.time === time;
  });
}

function makeId() {
  const abc = 'ABCDEFGHJKMNPQRSTUVWXYZ23456789';
  const bytes = new Uint8Array(6);
  crypto.getRandomValues(bytes);
  let s = '';
  for (const b of bytes) s += abc[b % abc.length];
  return PREFIX + s;
}

async function stripe(env, method, path, form) {
  const res = await fetch('https://api.stripe.com/v1' + path, {
    method,
    headers: {
      Authorization: 'Bearer ' + env.STRIPE_SECRET_KEY,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: form ? new URLSearchParams(form).toString() : undefined,
  });
  const data = await res.json();
  if (!res.ok) {
    const msg = (data && data.error && data.error.message) || 'Stripe error';
    throw Object.assign(new Error(msg), { status: res.status });
  }
  return data;
}

// Admin routes stay closed until ADMIN_TOKEN is set — customer details are never public.
function isAdmin(request, env) {
  if (!env.ADMIN_TOKEN) return false;
  const h = request.headers.get('Authorization') || '';
  return h === 'Bearer ' + env.ADMIN_TOKEN;
}

/* ───────── routes ───────── */
async function availability(request, env) {
  const url = new URL(request.url);
  const range = seasonRange();
  const from = isYmd(url.searchParams.get('from')) ? url.searchParams.get('from') : range.start;
  const to = isYmd(url.searchParams.get('to')) ? url.searchParams.get('to') : range.end;
  await ensureSchema(env);
  const { results } = await env.DB.prepare(
    `SELECT date, time, reschedule_date, reschedule_time, status FROM bookings
     WHERE source = ? AND ((date BETWEEN ? AND ?) OR (reschedule_date BETWEEN ? AND ?))`
  )
    .bind(SOURCE, from, to, from, to)
    .all();
  const booked = {};
  for (const r of results || []) {
    if (CANCELLED.includes(r.status)) continue;
    const s = activeSlot(r);
    if (!s.date || s.date < from || s.date > to) continue;
    (booked[s.date] = booked[s.date] || []).includes(s.time) || booked[s.date].push(s.time);
  }
  return json(env, { booked });
}

async function createPaymentIntent(request, env) {
  if (!env.STRIPE_SECRET_KEY) return json(env, { error: 'Payments are not configured.' }, 503);
  let body = {};
  try {
    body = await request.json();
  } catch {
    return json(env, { error: 'Invalid JSON.' }, 400);
  }
  const draftRef = clean(body.draftRef, 40);
  if (!draftRef) return json(env, { error: 'Missing draft reference.' }, 400);

  // Best-effort slot check — never blocks payment on a DB problem (no ensureSchema here).
  if (body.date && body.time) {
    const problem = slotProblem(body.date, body.time);
    if (problem) return json(env, { error: problem }, 409);
    try {
      if (await slotTaken(env, body.date, body.time)) return json(env, { error: 'That install window was just booked.' }, 409);
    } catch (err) {
      console.warn('slot check skipped:', err && err.message);
    }
  }

  const form = {
    amount: String(DEPOSIT_CENTS),
    currency: 'usd',
    'automatic_payment_methods[enabled]': 'true',
    description: 'BrightNest Christmas Lights Yorba Linda — reservation deposit',
    'metadata[source]': SOURCE,
    'metadata[draft_ref]': draftRef,
    'metadata[service]': clean(body.service, 60),
    'metadata[date]': clean(body.date, 10),
    'metadata[time]': clean(body.time, 12),
    'metadata[name]': clean(body.name, 80),
  };
  const email = clean(body.email, 120);
  if (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) form.receipt_email = email;

  try {
    const pi = await stripe(env, 'POST', '/payment_intents', form);
    return json(env, { clientSecret: pi.client_secret, id: pi.id });
  } catch (err) {
    console.error('create PI failed:', err.message);
    return json(env, { error: 'Could not start payment.' }, 502);
  }
}

async function createBooking(request, env) {
  let b = {};
  try {
    b = await request.json();
  } catch {
    return json(env, { error: 'Invalid JSON.' }, 400);
  }

  const draftRef = clean(b.draftRef, 40);
  const service = clean(b.service, 60);
  const lightType = LIGHT_TYPES.includes(b.lightType) ? b.lightType : '';
  const date = clean(b.date, 10);
  const time = clean(b.time, 12);
  const name = clean(b.name, 100);
  const phone = clean(b.phone, 30);
  const email = clean(b.email, 120);
  const address = clean(b.address, 240);
  const vehicle = clean(b.vehicle, 200); // home details live in the shared "vehicle" column
  const addons = Array.isArray(b.addons) ? b.addons.map((a) => clean(a, 60)).filter(Boolean).slice(0, 10) : [];
  const estimate = clean(b.estimate, 60);
  const paymentStatus = b.payment_status === 'Paid' ? 'Paid' : 'Pay Later';
  const piId = clean(b.paymentIntentId, 60);

  if (!draftRef) return json(env, { error: 'Missing draft reference.' }, 400);
  if (!lightType) return json(env, { error: 'Please choose permanent or seasonal lights.' }, 400);
  if (!SERVICES.includes(service)) return json(env, { error: 'Please choose a package.' }, 400);
  if (name.length < 2) return json(env, { error: 'Please enter your full name.' }, 400);
  if (phone.replace(/\D/g, '').length < 10) return json(env, { error: 'Please enter a valid phone number.' }, 400);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) return json(env, { error: 'Please enter a valid email.' }, 400);
  if (address.length < 6) return json(env, { error: 'Please enter the service address.' }, 400);

  await ensureSchema(env);

  // Idempotency: same PaymentIntent or same draft ref → return the existing booking.
  const dupe = await env.DB.prepare(
    `SELECT id, payment_status FROM bookings WHERE source = ? AND (notes LIKE ? ${piId ? 'OR notes LIKE ?' : ''}) LIMIT 1`
  )
    .bind(...[SOURCE, `%Ref: ${draftRef}%`, ...(piId ? [`%PI: ${piId}%`] : [])])
    .first();
  if (dupe) return json(env, { id: dupe.id, payment_status: dupe.payment_status, duplicate: true });

  // Verify the payment server-side before recording it as Paid.
  let piNote = '';
  if (paymentStatus === 'Paid') {
    if (!piId || !env.STRIPE_SECRET_KEY) return json(env, { error: 'Missing payment reference.' }, 400);
    let pi;
    try {
      pi = await stripe(env, 'GET', '/payment_intents/' + encodeURIComponent(piId));
    } catch (err) {
      return json(env, { error: 'Could not verify payment.' }, 502);
    }
    const okStatus = pi.status === 'succeeded' || pi.status === 'processing';
    if (!okStatus || pi.amount < DEPOSIT_CENTS || (pi.metadata && pi.metadata.source !== SOURCE)) {
      return json(env, { error: 'Payment not completed.' }, 402);
    }
    if (pi.status === 'processing') piNote = ' (processing)';
  }

  const problem = slotProblem(date, time);
  let warning = '';
  let taken = false;
  if (!problem) taken = await slotTaken(env, date, time);
  if (problem || taken) {
    // A paid customer is never turned away after paying — save the booking and flag it for the office.
    if (paymentStatus !== 'Paid') return json(env, { error: problem || 'That install window was just booked.' }, 409);
    warning = 'Your deposit is paid. That window filled up at the same moment — we’ll call you to confirm a time.';
  }

  const notes = [
    `Type: ${lightType}`,
    `Add-ons: ${addons.length ? addons.join(', ') : 'None'}`,
    `Estimate: ${estimate || 'Online quoting'}`,
    paymentStatus === 'Paid' ? `Deposit: $${DEPOSIT_CENTS / 100} paid${piNote}` : 'Deposit: pay at visit',
    piId && paymentStatus === 'Paid' ? `PI: ${piId}` : '',
    `Ref: ${draftRef}`,
    warning ? 'SLOT CONFLICT — please reschedule' : '',
  ]
    .filter(Boolean)
    .join(' | ');

  const createdAt = new Date().toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = makeId();
    try {
      await env.DB.prepare(
        `INSERT INTO bookings (id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at, status, payment_status)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Booked', ?)`
      )
        .bind(id, date, time, service, name, phone, email, vehicle, address, notes, SOURCE, createdAt, paymentStatus)
        .run();
      return json(env, { id, payment_status: paymentStatus, ...(warning ? { warning } : {}) }, 201);
    } catch (err) {
      if (!/UNIQUE|constraint/i.test(String(err && err.message))) {
        console.error('insert failed:', err && err.message);
        return json(env, { error: 'Could not save booking.' }, 500);
      }
    }
  }
  return json(env, { error: 'Could not save booking.' }, 500);
}

/* Free-estimate request from the 3-step form: no date, time or payment.
 * Saved in the shared table with status 'Estimate Request' so the office can call and schedule. */
async function createEstimate(request, env) {
  let b = {};
  try {
    b = await request.json();
  } catch {
    return json(env, { error: 'Invalid JSON.' }, 400);
  }
  const draftRef = clean(b.draftRef, 40);
  const lightType = LIGHT_TYPES.includes(b.lightType) ? b.lightType : '';
  const service = clean(b.service, 60);
  const name = clean(b.name, 100);
  const phone = clean(b.phone, 30);
  const email = clean(b.email, 120);
  const address = clean(b.address, 240);
  const details = clean(b.details, 1000);

  if (!draftRef) return json(env, { error: 'Missing draft reference.' }, 400);
  if (!lightType) return json(env, { error: 'Please choose permanent or seasonal lights.' }, 400);
  if (!SERVICES.includes(service)) return json(env, { error: 'Please choose your coverage.' }, 400);
  if (name.length < 2) return json(env, { error: 'Please enter your full name.' }, 400);
  if (phone.replace(/\D/g, '').length < 10) return json(env, { error: 'Please enter a valid phone number.' }, 400);
  if (address.length < 6) return json(env, { error: 'Please enter the service address.' }, 400);

  await ensureSchema(env);

  const dupe = await env.DB.prepare(`SELECT id FROM bookings WHERE source = ? AND notes LIKE ? LIMIT 1`)
    .bind(SOURCE, `%Ref: ${draftRef}%`)
    .first();
  if (dupe) return json(env, { id: dupe.id, duplicate: true });

  const notes = [`Type: ${lightType}`, 'Free estimate request', details ? `Details: ${details}` : '', `Ref: ${draftRef}`]
    .filter(Boolean)
    .join(' | ');
  const createdAt = new Date().toISOString();
  for (let attempt = 0; attempt < 5; attempt++) {
    const id = makeId();
    try {
      await env.DB.prepare(
        `INSERT INTO bookings (id, date, time, service, name, phone, email, vehicle, address, notes, source, created_at, status, payment_status)
         VALUES (?, '', '', ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Estimate Request', 'Pay Later')`
      )
        .bind(id, service, name, phone, email, `${lightType} · ${service}`, address, notes, SOURCE, createdAt)
        .run();
      return json(env, { id }, 201);
    } catch (err) {
      if (!/UNIQUE|constraint/i.test(String(err && err.message))) {
        console.error('estimate insert failed:', err && err.message);
        return json(env, { error: 'Could not save your request.' }, 500);
      }
    }
  }
  return json(env, { error: 'Could not save your request.' }, 500);
}

async function listBookings(request, env) {
  if (!isAdmin(request, env)) return json(env, { error: 'Unauthorized' }, 401);
  await ensureSchema(env);
  const { results } = await env.DB.prepare(`SELECT * FROM bookings WHERE source = ? ORDER BY date ASC, time ASC`).bind(SOURCE).all();
  return json(env, { bookings: results || [] });
}

async function patchBooking(request, env, id) {
  if (!isAdmin(request, env)) return json(env, { error: 'Unauthorized' }, 401);
  let b = {};
  try {
    b = await request.json();
  } catch {
    return json(env, { error: 'Invalid JSON.' }, 400);
  }
  const keys = Object.keys(b).filter((k) => PATCHABLE.includes(k));
  if (!keys.length) return json(env, { error: 'No patchable fields.' }, 400);
  const sets = keys.map((k) => `${k} = ?`).join(', ');
  const vals = keys.map((k) => (b[k] == null ? null : clean(b[k], 1000)));
  const res = await env.DB.prepare(`UPDATE bookings SET ${sets} WHERE id = ? AND source = ?`)
    .bind(...vals, id, SOURCE)
    .run();
  if (!res.meta || !res.meta.changes) return json(env, { error: 'Not found.' }, 404);
  return json(env, { ok: true });
}

export default {
  async fetch(request, env) {
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors(env) });
    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '');
    try {
      if (path === '/api/health') return json(env, { ok: true, source: SOURCE });
      if (path === '/api/availability' && request.method === 'GET') return await availability(request, env);
      if (path === '/api/create-payment-intent' && request.method === 'POST') return await createPaymentIntent(request, env);
      if (path === '/api/bookings' && request.method === 'POST') return await createBooking(request, env);
      if (path === '/api/estimates' && request.method === 'POST') return await createEstimate(request, env);
      if (path === '/api/bookings' && request.method === 'GET') return await listBookings(request, env);
      const m = path.match(/^\/api\/bookings\/([A-Za-z0-9-]+)$/);
      if (m && request.method === 'PATCH') return await patchBooking(request, env, m[1]);
      return json(env, { error: 'Not found' }, 404);
    } catch (err) {
      console.error('unhandled:', err && err.stack);
      return json(env, { error: 'Server error' }, 500);
    }
  },
};
