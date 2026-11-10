import { asyncHandler } from "../middleware/async-handler.js";
import { readInput } from "../middleware/validate.js";
import { routeParam, sendOk } from "../lib/respond.js";
import { queryOf } from "../query.js";
import * as doctorService from "../services/doctor.service.js";
import type { DoctorInput } from "../validators.js";

function pageOf(result: { data: unknown; page: number; limit: number; total: number; pages: number }) {
  return { page: result.page, limit: result.limit, total: result.total, pages: result.pages };
}

export const list = asyncHandler(async (req, res) => {
  const result = await doctorService.listDoctors(queryOf(req.originalUrl));
  sendOk(res, result.data, pageOf(result));
});

export const create = asyncHandler(async (_req, res) => {
  sendOk(res, await doctorService.createDoctor(readInput<DoctorInput>(res)), undefined, 201);
});

export const get = asyncHandler(async (req, res) => {
  sendOk(res, await doctorService.getDoctor(routeParam(req, "id")));
});

export const update = asyncHandler(async (req, res) => {
  sendOk(res, await doctorService.updateDoctor(routeParam(req, "id"), readInput<DoctorInput>(res)));
});

export const remove = asyncHandler(async (req, res) => {
  sendOk(res, await doctorService.deleteDoctor(routeParam(req, "id")));
});
