import type { NextFunction, Request, Response } from "express";
import { NotFoundError } from "../errors/app-error.js";

export function notFound(_req: Request, _res: Response, next: NextFunction) {
  next(new NotFoundError("Route not found."));
}
