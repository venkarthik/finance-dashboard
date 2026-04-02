import { Router } from "express";
import * as recordController from "../controllers/record.controller.js";
import { authenticate } from "../middleware/authenticate.js";
import { adminOnly, analystAndAbove, allRoles } from "../middleware/authorize.js";
import { validate } from "../middleware/validate.js";
import { createRecordSchema, updateRecordSchema } from "../utils/schemas.js";

const router = Router();

// All record routes require authentication
router.use(authenticate);

// GET /api/records            → All roles can view
router.get("/", allRoles, recordController.getRecords);

// GET /api/records/:id        → All roles can view
router.get("/:id", allRoles, recordController.getRecordById);

// POST /api/records           → Admin only
router.post("/", adminOnly, validate(createRecordSchema), recordController.createRecord);

// PUT /api/records/:id        → Admin only
router.put("/:id", adminOnly, validate(updateRecordSchema), recordController.updateRecord);

// DELETE /api/records/:id     → Admin only
router.delete("/:id", adminOnly, recordController.deleteRecord);

export default router;