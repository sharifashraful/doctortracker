import type { Request, Response } from "express";
import { NotFoundError } from "../errors/app-error.js";

export function sendOk(res: Response, data: unknown, extra?: Record<string, unknown>, status = 200) {
  res.status(status).json({ ok: true, data, ...extra });
}

export function routeParam(req: Request, name: string) {
  const value = req.params[name];
  const id = Array.isArray(value) ? value[0] : value;
  if (!id) throw new NotFoundError();
  return id;
}

export function clientIp(req: Request) {
  return req.ip || req.socket.remoteAddress || "local";
}
