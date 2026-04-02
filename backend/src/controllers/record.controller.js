import * as recordService from "../services/record.service.js";
import { successResponse } from "../utils/response.js";

export const getRecords = async (req, res, next) => {
  try {
    const { page, limit, type, category, startDate, endDate, search } = req.query;
    const result = await recordService.getRecords({
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 10,
      type,
      category,
      startDate,
      endDate,
      search,
    });
    return successResponse(res, result, "Records fetched.");
  } catch (err) {
    next(err);
  }
};

export const getRecordById = async (req, res, next) => {
  try {
    const record = await recordService.getRecordById(req.params.id);
    return successResponse(res, { record }, "Record fetched.");
  } catch (err) {
    next(err);
  }
};

export const createRecord = async (req, res, next) => {
  try {
    const record = await recordService.createRecord(req.body, req.user.id);
    return successResponse(res, { record }, "Record created.", 201);
  } catch (err) {
    next(err);
  }
};

export const updateRecord = async (req, res, next) => {
  try {
    const record = await recordService.updateRecord(req.params.id, req.body);
    return successResponse(res, { record }, "Record updated.");
  } catch (err) {
    next(err);
  }
};

export const deleteRecord = async (req, res, next) => {
  try {
    await recordService.deleteRecord(req.params.id);
    return successResponse(res, null, "Record deleted.");
  } catch (err) {
    next(err);
  }
};