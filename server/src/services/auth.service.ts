import { RateLimitError, UnauthorizedError } from "../errors/app-error.js";
import { rateLimit } from "../lib/rate-limit.js";
import { User } from "../models/User.js";
import { verifyPassword } from "../password.js";
import { signSession } from "../token.js";
import type { LoginInput } from "../validators.js";

const WINDOW_MS = 15 * 60 * 1000;

export async function login(input: LoginInput, ip: string) {
  if (!rateLimit(`login:${ip}:${input.email}`, 8, WINDOW_MS).ok) {
    throw new RateLimitError("Too many sign-in attempts. Try again shortly.");
  }

  const user = await User.findOne({ email: input.email }).select("+passwordHash");
  const valid = user ? await verifyPassword(input.password, user.passwordHash) : false;
  if (!user || !valid || user.role !== "admin") {
    throw new UnauthorizedError("Invalid email or password.");
  }

  const session = {
    id: String(user._id),
    email: user.email,
    name: user.name,
    role: user.role,
  };
  return { token: await signSession(session), user: session };
}

export async function profile(userId: string) {
  const user = await User.findById(userId).select("name email role");
  if (!user) throw new UnauthorizedError();
  return { id: String(user._id), name: user.name, email: user.email, role: user.role };
}
