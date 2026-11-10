import { Router } from "express";
import * as doctorController from "../controllers/doctor.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate.js";
import { doctorSchema } from "../validators/schemas.js";

export const doctorsRouter = Router();

doctorsRouter.use(authenticate);
doctorsRouter.get("/", doctorController.list);
doctorsRouter.post("/", validateBody(doctorSchema), doctorController.create);
doctorsRouter.get("/:id", doctorController.get);
doctorsRouter.patch("/:id", validateBody(doctorSchema), doctorController.update);
doctorsRouter.delete("/:id", doctorController.remove);
