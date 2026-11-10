import { SESSION_COOKIE } from "../constants.js";
import { asyncHandler } from "../middleware/async-handler.js";
import { currentUser } from "../middleware/authenticate.js";
import { readInput } from "../middleware/validate.js";
import { clientIp, sendOk } from "../lib/respond.js";
import * as authService from "../services/auth.service.js";
import { sessionCookie } from "../token.js";
import type { LoginInput } from "../validators.js";

export const login = asyncHandler(async (req, res) => {
  const result = await authService.login(readInput<LoginInput>(res), clientIp(req));
  res.cookie(SESSION_COOKIE, result.token, sessionCookie());
  sendOk(res, result.user);
});

export const logout = asyncHandler(async (_req, res) => {
  res.clearCookie(SESSION_COOKIE, { ...sessionCookie(), maxAge: 0 });
  sendOk(res, { signedOut: true });
});

export const me = asyncHandler(async (_req, res) => {
  sendOk(res, await authService.profile(currentUser(res).id));
});
