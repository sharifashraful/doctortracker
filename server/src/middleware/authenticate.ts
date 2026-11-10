import type { NextFunction, Request, Response } from "express";
import { SESSION_COOKIE, type SessionUser } from "../config/constants.js";
import { UnauthorizedError } from "../errors/app-error.js";
import { verifySession } from "../lib/token.js";

export function currentUser(res: Response) {
  return res.locals.user as SessionUser;
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  try {
    const token = req.cookies?.[SESSION_COOKIE] as string | undefined;
    const session = token ? await verifySession(token) : null;
    if (!session || session.role !== "admin") {
      next(new UnauthorizedError());
      return;
    }
    res.locals.user = session;
    next();
  } catch (error) {
    next(error);
  }
}
