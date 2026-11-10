const DATE = /^(\d{4})-(\d{2})-(\d{2})$/;

let cachedZone: string | null = null;

export function clinicTimeZone() {
  if (cachedZone) return cachedZone;
  const configured = process.env.CLINIC_TIMEZONE?.trim();
  const zone = configured || Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";
  try {
    Intl.DateTimeFormat("en-US", { timeZone: zone }).format(new Date());
  } catch {
    throw new Error(`CLINIC_TIMEZONE is not a valid IANA timezone: ${zone}`);
  }
  cachedZone = zone;
  return zone;
}

export function parseCalendarDate(value: string) {
  const match = DATE.exec(value);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const probe = new Date(Date.UTC(year, month - 1, day));
  if (probe.getUTCFullYear() !== year || probe.getUTCMonth() !== month - 1 || probe.getUTCDate() !== day) return null;
  return { year, month, day };
}

export function utcDayStart(value: string) {
  const date = parseCalendarDate(value);
  if (!date) return null;
  return new Date(Date.UTC(date.year, date.month - 1, date.day));
}

export function utcDayEnd(value: string) {
  const start = utcDayStart(value);
  if (!start) return null;
  return new Date(start.getTime() + 24 * 60 * 60 * 1000 - 1);
}

export function clinicToday(timeZone = clinicTimeZone()) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const read = (type: string) => parts.find((part) => part.type === type)?.value ?? "";
  return `${read("year")}-${read("month")}-${read("day")}`;
}

export function shiftCalendarDate(value: string, days: number) {
  const date = parseCalendarDate(value);
  if (!date) return null;
  const shifted = new Date(Date.UTC(date.year, date.month - 1, date.day + days));
  return shifted.toISOString().slice(0, 10);
}

function zoneOffsetMs(instant: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    hourCycle: "h23",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  }).formatToParts(instant);
  const read = (type: string) => Number(parts.find((part) => part.type === type)?.value ?? "0");
  const hour = read("hour") === 24 ? 0 : read("hour");
  const zonedAsUtc = Date.UTC(read("year"), read("month") - 1, read("day"), hour, read("minute"), read("second"));
  return zonedAsUtc - Math.floor(instant.getTime() / 1000) * 1000;
}

function zonedInstant(value: string, hours: number, minutes: number, seconds: number, ms: number, timeZone: string) {
  const date = parseCalendarDate(value);
  if (!date) return null;
  const utcGuess = Date.UTC(date.year, date.month - 1, date.day, hours, minutes, seconds, ms);
  const first = new Date(utcGuess - zoneOffsetMs(new Date(utcGuess), timeZone));
  return new Date(utcGuess - zoneOffsetMs(first, timeZone));
}

export function clinicDayStart(value: string, timeZone = clinicTimeZone()) {
  return zonedInstant(value, 0, 0, 0, 0, timeZone);
}

export function clinicDayEnd(value: string, timeZone = clinicTimeZone()) {
  return zonedInstant(value, 23, 59, 59, 999, timeZone);
}
