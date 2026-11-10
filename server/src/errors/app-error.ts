export class AppError extends Error {
  readonly status: number;
  readonly code: string;
  readonly fields?: Record<string, string>;
  readonly expose: boolean;

  constructor(
    message: string,
    status: number,
    code: string,
    options?: { fields?: Record<string, string>; expose?: boolean },
  ) {
    super(message);
    this.name = new.target.name;
    this.status = status;
    this.code = code;
    this.fields = options?.fields;
    this.expose = options?.expose ?? status < 500;
  }
}

export class BadRequestError extends AppError {
  constructor(message = "Bad request.", fields?: Record<string, string>) {
    super(message, 400, "BAD_REQUEST", { fields });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized") {
    super(message, 401, "UNAUTHORIZED");
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden.") {
    super(message, 403, "FORBIDDEN");
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Not found.", fields?: Record<string, string>) {
    super(message, 404, "NOT_FOUND", { fields });
  }
}

export class ConflictError extends AppError {
  constructor(message: string, fields?: Record<string, string>) {
    super(message, 409, "CONFLICT", { fields });
  }
}

export class ValidationError extends AppError {
  constructor(message = "Check the highlighted fields.", fields?: Record<string, string>) {
    super(message, 422, "VALIDATION_ERROR", { fields });
  }
}

export class PayloadTooLargeError extends AppError {
  constructor(message = "Request body is too large.") {
    super(message, 413, "PAYLOAD_TOO_LARGE");
  }
}

export class RateLimitError extends AppError {
  constructor(message = "Too many requests. Try again shortly.") {
    super(message, 429, "RATE_LIMITED");
  }
}

export class ServiceUnavailableError extends AppError {
  constructor(message = "The database is unavailable. Try again shortly.") {
    super(message, 503, "SERVICE_UNAVAILABLE", { expose: true });
  }
}
