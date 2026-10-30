// ─────────────────────────────────────────────────────────────
// BrightNest Christmas Lights Yorba Linda — site configuration
// Everything business-specific lives here. Edit this file first.
// ─────────────────────────────────────────────────────────────

export const BUSINESS = {
  name: 'BrightNest Christmas Lights Yorba Linda',
  shortName: 'BrightNest',
  phoneDisplay: '760-201-1169',
  phoneHref: 'tel:+17602011169',
  city: 'Yorba Linda',
  state: 'CA',
  // TODO: replace with the live custom domain once connected in Cloudflare Pages
  siteUrl: 'https://brightnest-christmas-lights-yorba-linda.pages.dev',
  // TODO: add the Google Business Profile review link when the profile is live (leave null to hide the button)
  googleReviewUrl: null,
};

// Plumbing IDs — must match worker/worker.js
export const SOURCE_TAG = 'brightnest-yorbalinda';
export const BOOKING_PREFIX = 'BN-';

// Pricing — use null for "Online quoting" (no price shown).
// Prices are "starting at"; the final price is confirmed at the on-site visit.
export const PACKAGES = [
  {
    id: 'front',
    name: 'Front Only',
    price: null, // TODO: starting price, e.g. 499
    image: '/images/house-b-warmwhite-sm.webp',
    imageAlt: 'Warm white roofline lights on the front of a home at night',
    tagline: 'A clean, classic glow across the face of your home.',
    coverage: 'The roofline facing the street.', // shown in booking step 2
    features: [
      'Professional design for the front of the home',
      'Commercial-grade LED lights (leased, no purchase needed)',
      'Roofline & gutter-line installation',
      'Timer setup',
      'In-season maintenance & bulb replacement',
      'Takedown after the holidays',
    ],
  },
  {
    id: 'front-sides',
    name: 'Front & Sides',
    price: null, // TODO: starting price, e.g. 799
    image: '/images/house-a-warmwhite-sm.webp',
    imageAlt: 'Two-story home with warm white lights along the front and side rooflines',
    tagline: 'Wrap the glow around the corners for a fuller look.',
    coverage: 'Roofline plus the side edges for a full outline.', // shown in booking step 2
    ribbon: 'Most complete',
    features: [
      'Everything in Front Only',
      'Side rooflines & gutters',
      'Expanded custom design',
    ],
  },
];

// Booking step 1 — kind of lighting. Stored in the "vehicle" column and in notes ("Type: …").
export const LIGHT_TYPES = [
  { id: 'Permanent', title: 'Permanent lights', desc: 'Installed once and left up year-round, ready for any holiday.' },
  { id: 'Seasonal', title: 'Seasonal lights', desc: 'Hung for the holidays and taken down after the season.' },
];

export const TWO_STORY_PERCENT = 50;

export const ADDONS = [
  { id: 'tree-bush', label: 'Tree & bush wrapping', short: 'Tree & Bush', price: null, icon: 'tree' },
  { id: 'wreaths', label: 'Wreaths / garland', short: 'Wreaths', price: null, icon: 'wreath' },
  { id: 'pathway', label: 'Pathway / stake lights', short: 'Pathway', price: null, icon: 'path' },
  { id: 'own-lights', label: 'Install customer-owned lights', short: 'Own Lights', price: null, icon: 'plug', flat: true },
  { id: 'storage', label: 'Off-season storage', short: 'Storage', price: null, icon: 'box' },
];

export const DEPOSIT = 149; // reservation deposit, applied to the final invoice

// Season + scheduling (Pacific time)
export const SEASON = { startMonth: 10, startDay: 20, endMonth: 12, endDay: 20 };
export const TIME_WINDOWS = ['8AM–12PM', '12PM–4PM']; // en dash — matches the shared D1 format
export const WINDOW_START = { '8AM–12PM': '08:00', '12PM–4PM': '12:00' };
export const LEAD_HOURS = 48;

// TODO: confirm the takedown window with the owner
export const TAKEDOWN_NOTE = 'early January';

export const SERVICE_CITIES = [
  'Yorba Linda',
  'Anaheim Hills',
  'Placentia',
  'Brea',
  'Fullerton',
  'Villa Park',
  'Orange',
  'Chino Hills',
  'La Habra',
];

// TODO: add real reviews only (name, text, optional city + source). Never invent reviews or ratings.
// Example shape: { name: 'Jane D.', city: 'Yorba Linda', text: '…', source: 'Google' }
export const REVIEWS = [];

export const GALLERY = [
  { src: '/images/house-a-redwhite.webp', sm: '/images/house-a-redwhite-sm.webp', title: 'Classic red & white', note: 'Two-story roofline, every peak traced' },
  { src: '/images/house-a-warmwhite.webp', sm: '/images/house-a-warmwhite-sm.webp', title: 'Warm white', note: 'Soft, timeless glow on stucco and tile' },
  { src: '/images/house-a-multicolor.webp', sm: '/images/house-a-multicolor-sm.webp', title: 'Multicolor', note: 'Bright retro bulbs end to end' },
  { src: '/images/house-b-redwhite.webp', sm: '/images/house-b-redwhite-sm.webp', title: 'Candy-cane red & white', note: 'Split-level roofline and front eave' },
  { src: '/images/house-b-warmwhite.webp', sm: '/images/house-b-warmwhite-sm.webp', title: 'Warm white', note: 'Crisp lines along the gable and garage' },
  { src: '/images/house-b-multicolor.webp', sm: '/images/house-b-multicolor-sm.webp', title: 'Multicolor', note: 'Full-spectrum bulbs on a sharp gable' },
];

export const HERO_STYLES = [
  { id: 'day', label: 'Daylight', dot: 'day', src: '/images/house-a-day.webp', sm: '/images/house-a-day-sm.webp', alt: 'Two-story stucco home in daylight before lights are installed' },
  { id: 'redwhite', label: 'Red & White', dot: 'redwhite', src: '/images/house-a-redwhite.webp', sm: '/images/house-a-redwhite-sm.webp', alt: 'The same home at night with red and white roofline lights' },
  { id: 'warm', label: 'Warm White', dot: 'warm', src: '/images/house-a-warmwhite.webp', sm: '/images/house-a-warmwhite-sm.webp', alt: 'The same home at night with warm white roofline lights' },
  { id: 'multi', label: 'Multicolor', dot: 'multi', src: '/images/house-a-multicolor.webp', sm: '/images/house-a-multicolor-sm.webp', alt: 'The same home at night with multicolor roofline lights' },
];

export const FAQS = [
  {
    id: 'power',
    tab: 'Outlets & power',
    q: 'Do I need outdoor outlets? How are the lights powered?',
    a: 'Most homes only need one working exterior outlet near the roofline run. During your design visit we map where the power comes from and plan the runs so cords stay tidy and out of walkways. If an outlet is far from the display, we’ll talk through the best option with you before install day.',
  },
  {
    id: 'lease',
    tab: 'Lease vs own',
    q: 'Do I buy the lights or lease them?',
    a: 'Our packages use commercial-grade LED lights that you lease for the season — nothing to buy, store or untangle. If you already own lights you’d like hung, choose the “Install customer-owned lights” add-on.',
  },
  {
    id: 'timers',
    tab: 'Timers',
    q: 'How do the timers work?',
    a: 'Every install includes timer setup. We set your display to turn on at dusk and off at the time you choose, so you never have to think about it.',
  },
  {
    id: 'weather',
    tab: 'Weather',
    q: 'What if it rains or wind knocks something loose?',
    a: 'In-season maintenance and bulb replacement are included. If a strand goes dark or something shifts in the weather, call us and we’ll schedule a service visit. If heavy rain or high wind affects your install day, we’ll reach out to move your window.',
  },
  {
    id: 'takedown',
    tab: 'Takedown date',
    q: 'When do you take the lights down?',
    a: `Takedown is included. We remove everything after the holidays — typically in ${TAKEDOWN_NOTE} — and confirm your takedown date with you ahead of time. Want them stored for next year? Add off-season storage.`,
  },
  {
    id: 'deposit',
    tab: 'Deposit',
    q: 'How does the $149 deposit work?',
    a: 'The $149 reservation deposit holds your install date and is applied to your final invoice. Prefer not to pay online? Choose “I’ll pay at the visit” at checkout.',
  },
  {
    id: 'price',
    tab: 'Pricing',
    q: 'How is the final price set?',
    a: 'Prices shown are starting points. Your final price is confirmed at the on-site visit once we see your rooflines, peaks and any add-ons. Two-story homes are +50% of the package price.',
  },
];
