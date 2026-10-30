-- Shared bookings table (same columns as the detailing sites so the shared admin dashboard works).
-- Safe to run more than once. Paste into Cloudflare dashboard → D1 → your database → Console.
-- Each statement is a single line so it also works with consoles that split on newlines.
CREATE TABLE IF NOT EXISTS bookings (id TEXT PRIMARY KEY, date TEXT, time TEXT, service TEXT, name TEXT, phone TEXT, email TEXT, vehicle TEXT, address TEXT, notes TEXT, source TEXT, created_at TEXT, status TEXT DEFAULT 'Booked', reschedule_date TEXT, reschedule_time TEXT, notes2 TEXT, original_date TEXT, original_time TEXT, payment_status TEXT);
CREATE INDEX IF NOT EXISTS idx_bookings_source_date ON bookings (source, date);
