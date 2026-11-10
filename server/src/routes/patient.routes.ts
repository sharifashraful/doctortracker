import { Router } from "express";
import * as patientController from "../controllers/patient.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { validateBody } from "../middleware/validate.js";
import { patientSchema } from "../validators.js";

export const patientsRouter = Router();

patientsRouter.use(authenticate);
patientsRouter.get("/", patientController.list);
patientsRouter.post("/", validateBody(patientSchema), patientController.create);
patientsRouter.get("/:id", patientController.get);
patientsRouter.patch("/:id", validateBody(patientSchema), patientController.update);
patientsRouter.delete("/:id", patientController.remove);
