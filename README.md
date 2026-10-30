# BrightNest Christmas Lights Yorba Linda

Vite + React site with a 6-step booking flow (Permanent/Seasonal → Package → Home → Date → Time → Info), Stripe deposit checkout, and a Cloudflare Worker + D1 backend.

| Plumbing | Value |
|---|---|
| Source tag | `brightnest-yorbalinda` |
| Booking ID prefix | `BN-` |
| Worker | `brightnest-yorbalinda-api` |
| Pages project | `brightnest-christmas-lights-yorba-linda` |
| GitHub repo (suggested) | `servicepros714/brightnest-christmas-lights-yorba-linda` |

## 1. Fill in the business details

Edit **`src/config/site.js`** — prices (`null` shows "Online quoting"), service cities, reviews (real ones only), takedown timing, Google review link, live domain.
If you change the domain, also update it in `index.html` (canonical, OG, JSON-LD), `public/robots.txt` and `public/sitemap.xml`.

## 2. Run locally (Windows CMD)

```cmd
cd brightnest-yorba-linda
npm install
npm run dev
```

Open http://localhost:5173. Put your real values in `.env.local`:

```
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...
VITE_API_BASE=https://brightnest-yorbalinda-api.<your-subdomain>.workers.dev
```

`.env.local` only holds public values and is committed on purpose so the GitHub build can read it.
**Never** put the Stripe secret key in this repo.

## 3. Push to GitHub (Windows CMD)

```cmd
cd brightnest-yorba-linda
git init
git add .
git commit -m "BrightNest Yorba Linda site"
git branch -M main
git remote add origin https://github.com/servicepros714/brightnest-christmas-lights-yorba-linda.git
git push -u origin main
```

## 4. Cloudflare (dashboard only)

**D1** — use the shared bookings database. If the table doesn't exist yet, open D1 → database → Console and run `worker/schema.sql` (safe to re-run).

**Worker** — Workers & Pages → Create → Worker → name it `brightnest-yorbalinda-api` → Edit code → paste `worker/worker.js` → Deploy. Then Settings:
- Bindings → add D1 database, variable name **`DB`** → the shared bookings database
- Variables and Secrets → **`STRIPE_SECRET_KEY`** (type: Secret)
- Optional: `ALLOWED_ORIGIN` (text, your site URL) and `ADMIN_TOKEN` (secret, enables the GET/PATCH admin API)

**Pages** — Workers & Pages → Create → Pages → Direct Upload, name it `brightnest-christmas-lights-yorba-linda` (the GitHub Action deploys into it).

**GitHub repo secrets** (Settings → Secrets and variables → Actions):
- `CLOUDFLARE_API_TOKEN` (Cloudflare Pages: Edit permission)
- `CLOUDFLARE_ACCOUNT_ID`
- Optional overrides: `VITE_STRIPE_PUBLISHABLE_KEY`, `VITE_API_BASE`

Every push to `main` builds and deploys. `public/_redirects` keeps client routes (/book, /checkout, /confirmation) working on refresh.

## Booking data (shared D1 columns)

| Column | What's stored |
|---|---|
| `service` | `Front Only` / `Front & Sides` |
| `vehicle` | Lighting type + home details, e.g. `Seasonal · 2-Story · Front & Sides · +Wreaths +Pathway` |
| `time` | `8AM–12PM` or `12PM–4PM` (en dash) |
| `notes` | `Type: Seasonal \| Add-ons: … \| Estimate: … \| Deposit: … \| PI: pi_… \| Ref: R…` |
| `status` | `Booked` on insert |
| `payment_status` | `Paid` or `Pay Later` |

PATCHABLE: status, reschedule_date, reschedule_time, notes2, original_date, original_time, payment_status, date, time.
Availability is source-scoped (`AND source = ?`); cancelled rows free their slot, and a filled-in reschedule_date/time replaces the original slot.

## Built-in fixes for known recurring bugs
- **ensureSchema blocking payment** — schema check is cached, never throws, and isn't called on the payment-intent route.
- **`.exec()` newline parsing** — no `DB.exec()`; schema runs as single `prepare()` statements in `batch()`.
- **Nav grid mismatch** — rail and drawer navs are flex columns; no grid templates to drift.
- **`.btn` background** — all buttons draw from `--btn-bg` on the class; the bare `button` reset can't override it.
- **`.container` specificity** — exactly one `.container` rule; sections never pad it.
- **ExpressCheckoutElement clientSecret** — `<Elements>` mounts only after the PaymentIntent exists, with `clientSecret` in its options, keyed by it.
- **`strong` display bleed** — no global `strong` styling anywhere.
