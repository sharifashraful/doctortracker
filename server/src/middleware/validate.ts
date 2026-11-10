import type { NextFunction, Request, Response } from "express";
import type { z } from "zod";
import { ValidationError } from "../errors/app-error.js";
import { zodFields } from "../validators.js";

export function validateBody<T>(schema: z.ZodType<T>) {
  return (req: Request, res: Response, next: NextFunction) => {
    const parsed = schema.safeParse(req.body);
    if (!parsed.success) {
      next(new ValidationError("Check the highlighted fields.", zodFields(parsed.error)));
      return;
    }
    res.locals.input = parsed.data;
    next();
  };
}

export function readInput<T>(res: Response) {
  return res.locals.input as T;
}
