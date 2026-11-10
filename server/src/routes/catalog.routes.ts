import { Router } from "express";
import * as catalogController from "../controllers/catalog.controller.js";
import { authenticate } from "../middleware/authenticate.js";

export const catalogRouter = Router();

catalogRouter.use(authenticate);
catalogRouter.get("/meta", catalogController.meta);
catalogRouter.get("/stats", catalogController.stats);
