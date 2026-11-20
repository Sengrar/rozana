/**
 * Dates are stored in UTC (timestamptz) and shown in India time.
 */
const IST = "Asia/Kolkata";

const displayFormat = new Intl.DateTimeFormat("en-IN", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: IST,
});

// en-CA formats as YYYY-MM-DD, which is what <input type="date"> uses.
const inputFormat = new Intl.DateTimeFormat("en-CA", {
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  timeZone: IST,
});

/** "2026-11-25T18:29:59Z" -> "25 Nov 2026" (India time) */
export function formatDateIST(iso: string) {
  return displayFormat.format(new Date(iso));
}

/** Timestamp -> "YYYY-MM-DD" for a date input, in India time. */
export function toDateInputIST(iso: string) {
  return inputFormat.format(new Date(iso));
}

/** True for a real calendar date written as YYYY-MM-DD. */
export function isDateInput(value: string) {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const date = new Date(`${value}T12:00:00+05:30`);
  return !Number.isNaN(date.getTime()) && inputFormat.format(date) === value;
}

/** "YYYY-MM-DD" -> the last second of that day in India time. */
export function endOfDayIST(value: string) {
  return `${value}T23:59:59+05:30`;
}

/** Whole days from now until `iso` (negative once it has passed). */
export function daysUntil(iso: string, now = Date.now()) {
  return Math.ceil((Date.parse(iso) - now) / 86_400_000);
}
