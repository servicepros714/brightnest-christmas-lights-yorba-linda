// Pacific-time scheduling helpers. All comparisons use PT wall-clock strings
// ("YYYY-MM-DD HH:MM"), which sort correctly as plain strings.
import { SEASON, WINDOW_START, LEAD_HOURS, TIME_WINDOWS } from '../config/site.js';

const TZ = 'America/Los_Angeles';
const pad = (n) => String(n).padStart(2, '0');

const fmt = new Intl.DateTimeFormat('en-US', {
  timeZone: TZ,
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
  hourCycle: 'h23',
});

export function ptParts(date = new Date()) {
  const p = {};
  for (const part of fmt.formatToParts(date)) p[part.type] = part.value;
  return { y: +p.year, m: +p.month, d: +p.day, h: +p.hour % 24, min: +p.minute };
}

export const ymd = (y, m, d) => `${y}-${pad(m)}-${pad(d)}`;

export function ptToday(now = new Date()) {
  const p = ptParts(now);
  return ymd(p.y, p.m, p.d);
}

export function earliestStamp(now = new Date()) {
  const p = ptParts(new Date(now.getTime() + LEAD_HOURS * 3600 * 1000));
  return `${ymd(p.y, p.m, p.d)} ${pad(p.h)}:${pad(p.min)}`;
}

export function seasonYear(now = new Date()) {
  const p = ptParts(now);
  const afterEnd = p.m > SEASON.endMonth || (p.m === SEASON.endMonth && p.d > SEASON.endDay);
  return afterEnd ? p.y + 1 : p.y;
}

export function seasonRange(now = new Date()) {
  const y = seasonYear(now);
  return {
    year: y,
    start: ymd(y, SEASON.startMonth, SEASON.startDay),
    end: ymd(y, SEASON.endMonth, SEASON.endDay),
  };
}

export function inSeason(date, now = new Date()) {
  const { start, end } = seasonRange(now);
  return date >= start && date <= end;
}

export function slotIsSoonEnough(date, time, now = new Date()) {
  return `${date} ${WINDOW_START[time]}` >= earliestStamp(now);
}

/** Status of one slot: 'open' | 'booked' | 'too-soon' | 'closed' */
export function slotStatus(date, time, booked = {}, now = new Date()) {
  if (!inSeason(date, now)) return 'closed';
  if (!slotIsSoonEnough(date, time, now)) return 'too-soon';
  if ((booked[date] || []).includes(time)) return 'booked';
  return 'open';
}

export function dayIsOpen(date, booked = {}, now = new Date()) {
  return TIME_WINDOWS.some((t) => slotStatus(date, t, booked, now) === 'open');
}

export function firstOpenDate(booked = {}, now = new Date()) {
  const { start, end } = seasonRange(now);
  let cur = parseYmd(start);
  const last = parseYmd(end);
  while (cur <= last) {
    const s = ymdFromUTC(cur);
    if (dayIsOpen(s, booked, now)) return s;
    cur = new Date(cur.getTime() + 86400000);
  }
  return null;
}

// Date helpers that never touch the local timezone (UTC-anchored)
export function parseYmd(s) {
  const [y, m, d] = s.split('-').map(Number);
  return new Date(Date.UTC(y, m - 1, d));
}
export function ymdFromUTC(dt) {
  return ymd(dt.getUTCFullYear(), dt.getUTCMonth() + 1, dt.getUTCDate());
}

export function prettyDate(s, opts = {}) {
  if (!s) return '';
  return parseYmd(s).toLocaleDateString('en-US', {
    timeZone: 'UTC',
    weekday: opts.short ? 'short' : 'long',
    month: opts.short ? 'short' : 'long',
    day: 'numeric',
    ...(opts.year ? { year: 'numeric' } : {}),
  });
}

export function daysBetween(a, b) {
  return Math.round((parseYmd(b) - parseYmd(a)) / 86400000);
}
