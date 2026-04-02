import { Router } from "express";
import * as dashboardController from "../controllers/dashboard.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { analystAndAbove, allRoles } from "../middleware/authorize.js";

const router = Router();

// All dashboard routes require authentication
router.use(authenticate);

// GET /api/dashboard/summary          → All roles
router.get("/summary", allRoles, dashboardController.getSummary);

// GET /api/dashboard/categories       → Analyst and above
router.get("/categories", analystAndAbove, dashboardController.getCategoryTotals);

// GET /api/dashboard/trends/monthly   → Analyst and above
router.get("/trends/monthly", analystAndAbove, dashboardController.getMonthlyTrends);

// GET /api/dashboard/trends/weekly    → Analyst and above
router.get("/trends/weekly", analystAndAbove, dashboardController.getWeeklyTrends);

// GET /api/dashboard/activity         → All roles
router.get("/activity", allRoles, dashboardController.getRecentActivity);

export default router;