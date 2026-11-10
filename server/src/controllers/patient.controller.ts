import { asyncHandler } from "../middleware/async-handler.js";
import { readInput } from "../middleware/validate.js";
import { routeParam, sendOk } from "../lib/respond.js";
import { queryOf } from "../lib/query.js";
import * as patientService from "../services/patient.service.js";
import type { PatientInput } from "../validators/schemas.js";

function pageOf(result: { data: unknown; page: number; limit: number; total: number; pages: number }) {
  return { page: result.page, limit: result.limit, total: result.total, pages: result.pages };
}

export const list = asyncHandler(async (req, res) => {
  const result = await patientService.listPatients(queryOf(req.originalUrl));
  sendOk(res, result.data, pageOf(result));
});

export const create = asyncHandler(async (_req, res) => {
  sendOk(res, await patientService.createPatient(readInput<PatientInput>(res)), undefined, 201);
});

export const get = asyncHandler(async (req, res) => {
  sendOk(res, await patientService.getPatient(routeParam(req, "id")));
});

export const update = asyncHandler(async (req, res) => {
  sendOk(res, await patientService.updatePatient(routeParam(req, "id"), readInput<PatientInput>(res)));
});

export const remove = asyncHandler(async (req, res) => {
  sendOk(res, await patientService.deletePatient(routeParam(req, "id")));
});
