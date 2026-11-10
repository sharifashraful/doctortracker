import type { NextFunction, Request, Response } from "express";
import { normalizeError } from "../errors/normalize.js";

export function errorHandler(error: unknown, _req: Request, res: Response, _next: NextFunction) {
  const normalized = normalizeError(error);
  if (normalized.status >= 500) console.error(error);
  if (res.headersSent) return;

  const body: { ok: false; error: string; code: string; fields?: Record<string, string> } = {
    ok: false,
    error: normalized.expose ? normalized.message : "Something went wrong. Try again.",
    code: normalized.expose ? normalized.code : "INTERNAL_ERROR",
  };
  if (normalized.fields && Object.keys(normalized.fields).length > 0) body.fields = normalized.fields;
  res.status(normalized.status).json(body);
}
