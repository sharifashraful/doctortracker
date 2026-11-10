import cookieParser from "cookie-parser";
import cors from "cors";
import express from "express";
import { connectDB } from "../db/connection.js";
import { ForbiddenError } from "../errors/app-error.js";
import { errorHandler } from "../middleware/error-handler.js";
import { notFound } from "../middleware/not-found.js";
import { authRouter } from "../routes/auth.routes.js";
import { catalogRouter } from "../routes/catalog.routes.js";
import { doctorsRouter } from "../routes/doctor.routes.js";
import { patientsRouter } from "../routes/patient.routes.js";

function originAllowed(origin?: string) {
  if (!origin) return true;
  const configured = (process.env.CLIENT_ORIGIN ?? "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);
  if (configured.includes(origin)) return true;
  if (process.env.NODE_ENV === "production") return false;
  try {
    const host = new URL(origin).hostname;
    return host === "localhost" || host === "127.0.0.1";
  } catch {
    return false;
  }
}

export async function createApp() {
  await connectDB();
  const app = express();
  app.disable("x-powered-by");
  if (process.env.TRUST_PROXY === "1") app.set("trust proxy", 1);
  app.use((req, res, next) => {
    res.setHeader("X-Content-Type-Options", "nosniff");
    res.setHeader("Referrer-Policy", "no-referrer");
    next();
  });
  app.use(
    cors({
      origin(origin, callback) {
        if (originAllowed(origin)) callback(null, origin ?? true);
        else callback(new ForbiddenError("Origin not allowed."));
      },
      credentials: true,
    }),
  );
  app.use(express.json({ limit: "1mb" }));
  app.use(cookieParser());

  app.get("/health", (_req, res) => {
    res.json({ ok: true, service: "doctortracker-api" });
  });
  app.use("/api/auth", authRouter);
  app.use("/api/doctors", doctorsRouter);
  app.use("/api/patients", patientsRouter);
  app.use("/api", catalogRouter);
  app.use(notFound);
  app.use(errorHandler);
  return app;
}
