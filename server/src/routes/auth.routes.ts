import { Router } from "express";
import * as authController from "../controllers/auth.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate.js";
import { loginSchema } from "../validators.js";

export const authRouter = Router();

authRouter.post("/login", validateBody(loginSchema), authController.login);
authRouter.post("/logout", authenticate, authController.logout);
authRouter.get("/me", authenticate, authController.me);
