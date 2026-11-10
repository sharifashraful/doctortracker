import { MAX_PAGE_SIZE, PAGE_SIZE } from "./constants.js";
import { clinicDayEnd, clinicDayStart, utcDayEnd, utcDayStart } from "./dates.js";
import { BadRequestError } from "./errors/app-error.js";

export function escapeRegex(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function parsePagination(searchParams: URLSearchParams) {
  const page = Math.max(1, Math.floor(Number(searchParams.get("page")) || 1));
  const requested = Math.floor(Number(searchParams.get("limit")) || PAGE_SIZE);
  const limit = Math.min(MAX_PAGE_SIZE, Math.max(1, requested));
  return { page, limit, skip: (page - 1) * limit };
}

export function searchTerm(searchParams: URLSearchParams) {
  return (searchParams.get("q") ?? "").trim().slice(0, 80);
}

function bound(value: string | null, label: "from" | "to", parse: (value: string) => Date | null) {
  const text = value?.trim() ?? "";
  if (!text) return undefined;
  const date = parse(text);
  if (!date) {
    throw new BadRequestError(`${label === "from" ? "From" : "To"} date is not a real calendar date.`, {
      [label]: "Choose a real date",
    });
  }
  return date;
}

function dayRange(from: string | null, to: string | null, start: (value: string) => Date | null, end: (value: string) => Date | null) {
  const range: { $gte?: Date; $lte?: Date } = {};
  const lower = bound(from, "from", start);
  const upper = bound(to, "to", end);
  if (lower) range.$gte = lower;
  if (upper) range.$lte = upper;
  if (range.$gte && range.$lte && range.$gte.getTime() > range.$lte.getTime()) {
    throw new BadRequestError("The start date is after the end date.", { from: "Must be on or before the end date" });
  }
  return Object.keys(range).length ? range : null;
}

export function utcDayRange(from: string | null, to: string | null) {
  return dayRange(from, to, utcDayStart, utcDayEnd);
}

export function clinicDayRange(from: string | null, to: string | null) {
  return dayRange(from, to, clinicDayStart, clinicDayEnd);
}

export function pagesFor(total: number, limit: number) {
  return Math.max(1, Math.ceil(total / limit));
}

export function queryOf(originalUrl: string) {
  return new URL(originalUrl, "http://localhost").searchParams;
}
