import { asyncHandler } from "../middleware/async-handler.js";
import { sendOk } from "../lib/respond.js";
import * as catalogService from "../services/catalog.service.js";

export const meta = asyncHandler(async (_req, res) => {
  sendOk(res, await catalogService.getMeta());
});

export const stats = asyncHandler(async (_req, res) => {
  sendOk(res, await catalogService.getStats());
});
