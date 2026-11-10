import { ClientError } from "@/lib/client";

const LABELS: Record<string, string> = {
  BAD_REQUEST: "Bad request",
  UNAUTHORIZED: "Unauthorized",
  FORBIDDEN: "Forbidden",
  NOT_FOUND: "Not found",
  CONFLICT: "Conflict",
  VALIDATION_ERROR: "Check the form",
  PAYLOAD_TOO_LARGE: "Request too large",
  RATE_LIMITED: "Too many attempts",
  SERVICE_UNAVAILABLE: "Service unavailable",
  INTERNAL_ERROR: "Server error",
  NETWORK_ERROR: "Connection failed",
};

export type PresentedError = {
  code: string;
  label: string;
  message: string;
  fields?: Record<string, string>;
};

function isPresented(value: unknown): value is PresentedError {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "label" in value &&
    "message" in value &&
    typeof value.code === "string" &&
    typeof value.label === "string" &&
    typeof value.message === "string"
  );
}

export function presentError(error: unknown, fallback = "Something went wrong. Try again."): PresentedError {
  if (isPresented(error)) return error;
  if (error instanceof ClientError) {
    return {
      code: error.code,
      label: LABELS[error.code] ?? "Error",
      message: error.message || fallback,
      fields: error.fields,
    };
  }
  if (error instanceof Error && error.message) {
    return { code: "INTERNAL_ERROR", label: "Error", message: error.message };
  }
  return { code: "INTERNAL_ERROR", label: "Error", message: fallback };
}

export function errorTitle(error: unknown, fallback: string) {
  const presented = presentError(error, fallback);
  if (presented.message.trim().toLowerCase() === presented.label.trim().toLowerCase()) return presented.label;
  return `${presented.label}. ${presented.message}`;
}
