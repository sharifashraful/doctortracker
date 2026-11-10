export const CONDITIONS = [
  "Stable",
  "Critical",
  "Recovering",
  "Chronic",
  "Observation",
] as const;

export const GENDERS = [
  "Female",
  "Male",
  "Other",
  "Prefer not to say",
] as const;

export const SESSION_COOKIE = "dt_session";
export const PAGE_SIZE = 8;
export const MAX_PAGE_SIZE = 24;

export type Condition = (typeof CONDITIONS)[number];
export type Gender = (typeof GENDERS)[number];
