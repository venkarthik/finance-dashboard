import * as dashboardService from "../services/dashboard.service.js";
import { successResponse } from "../utils/response.js";

export const getSummary = async (req, res, next) => {
  try {
    const summary = await dashboardService.getSummary();
    return successResponse(res, summary, "Summary fetched.");
  } catch (err) {
    next(err);
  }
};

export const getCategoryTotals = async (req, res, next) => {
  try {
    const categories = await dashboardService.getCategoryTotals();
    return successResponse(res, { categories }, "Category totals fetched.");
  } catch (err) {
    next(err);
  }
};

export const getMonthlyTrends = async (req, res, next) => {
  try {
    const trends = await dashboardService.getMonthlyTrends();
    return successResponse(res, { trends }, "Monthly trends fetched.");
  } catch (err) {
    next(err);
  }
};

export const getWeeklyTrends = async (req, res, next) => {
  try {
    const trends = await dashboardService.getWeeklyTrends();
    return successResponse(res, { trends }, "Weekly trends fetched.");
  } catch (err) {
    next(err);
  }
};

export const getRecentActivity = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const activity = await dashboardService.getRecentActivity(limit);
    return successResponse(res, { activity }, "Recent activity fetched.");
  } catch (err) {
    next(err);
  }
};