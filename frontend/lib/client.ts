export class ClientError extends Error {
  status: number;
  code: string;
  fields?: Record<string, string>;

  constructor(message: string, status: number, code: string, fields?: Record<string, string>) {
    super(message);
    this.name = "ClientError";
    this.status = status;
    this.code = code;
    this.fields = fields;
  }
}

const CODE_BY_STATUS: Record<number, string> = {
  400: "BAD_REQUEST",
  401: "UNAUTHORIZED",
  403: "FORBIDDEN",
  404: "NOT_FOUND",
  409: "CONFLICT",
  413: "PAYLOAD_TOO_LARGE",
  422: "VALIDATION_ERROR",
  429: "RATE_LIMITED",
  503: "SERVICE_UNAVAILABLE",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://127.0.0.1:4000";

export async function api<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      credentials: "include",
      headers: {
        ...(init?.body ? { "Content-Type": "application/json" } : {}),
        ...(init?.headers ?? {}),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") throw error;
    throw new ClientError("The API could not be reached.", 0, "NETWORK_ERROR");
  }

  const body = (await response.json().catch(() => ({}))) as {
    ok?: boolean;
    error?: string;
    code?: string;
    fields?: Record<string, string>;
  } & T;

  if (!response.ok || body.ok === false) {
    const code = body.code || CODE_BY_STATUS[response.status] || "INTERNAL_ERROR";
    throw new ClientError(body.error || "Request failed.", response.status, code, body.fields);
  }
  return body;
}
