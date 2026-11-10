import mongoose from "mongoose";
import { ZodError } from "zod";
import {
  AppError,
  BadRequestError,
  ConflictError,
  NotFoundError,
  PayloadTooLargeError,
  ServiceUnavailableError,
  ValidationError,
} from "./app-error.js";
import { zodFields } from "../validators/schemas.js";

type ErrorLike = {
  name?: string;
  type?: string;
  status?: number;
  statusCode?: number;
  code?: number | string;
  message?: string;
  keyPattern?: Record<string, number>;
  keyValue?: Record<string, unknown>;
};

function asErrorLike(error: unknown): ErrorLike {
  return typeof error === "object" && error !== null ? (error as ErrorLike) : {};
}

function duplicateKeyError(error: ErrorLike) {
  const key = Object.keys(error.keyPattern ?? error.keyValue ?? {})[0];
  if (key === "email") {
    return new ConflictError("A doctor with this email already exists.", { email: "Already in use" });
  }
  return new ConflictError("A record with these values already exists.");
}

function mongooseValidation(error: mongoose.Error.ValidationError) {
  const fields: Record<string, string> = {};
  for (const [key, detail] of Object.entries(error.errors)) {
    if (!fields[key]) fields[key] = detail.message;
  }
  return new ValidationError("Check the highlighted fields.", fields);
}

export function normalizeError(error: unknown): AppError {
  if (error instanceof AppError) return error;
  if (error instanceof ZodError) {
    return new ValidationError("Check the highlighted fields.", zodFields(error));
  }
  if (error instanceof mongoose.Error.CastError) {
    return new BadRequestError("Invalid identifier.");
  }
  if (error instanceof mongoose.Error.ValidationError) return mongooseValidation(error);
  if (error instanceof mongoose.Error.DocumentNotFoundError) return new NotFoundError();

  const like = asErrorLike(error);
  if (like.name === "MongoServerError" && like.code === 11000) return duplicateKeyError(like);
  if (like.name === "MongoNetworkError" || like.name === "MongoServerSelectionError") {
    return new ServiceUnavailableError();
  }
  if (like.type === "entity.parse.failed" || (error instanceof SyntaxError && like.status === 400)) {
    return new BadRequestError("Request body must be valid JSON.");
  }
  if (like.type === "entity.too.large" || like.status === 413) return new PayloadTooLargeError();
  if (like.message === "Origin not allowed.") return new AppError(like.message, 403, "FORBIDDEN");

  return new AppError("Something went wrong. Try again.", 500, "INTERNAL_ERROR", { expose: false });
}
